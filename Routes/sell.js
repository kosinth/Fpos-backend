const express = require('express')
const router = express.Router();
const mysql = require('mysql2/promise');
const conn = require('../config/configdb');
const QRCode = require('qrcode')
const generatePayLoad = require('promptpay-qr')
const fs = require('fs');
const PDFDocument = require('pdfkit');


// app.get('/user/:shopid/:id',async(req,res) =>{
//     const id = req.params.id
//     const shopid = req.params.shopid
//     console.log(shopid)
//     //const db = await conn('TestDB');
//     const db = await conn(shopid);

//post Insert - create

router.post('/sell/create', async(req,res)=>{

    let sell = req.body
    //console.log('Req sell Body : ',sell)
    let order_seq=0
    let prodt_id=0
    let prodt_qty=0
    let prodt_price=0
    let order_id = 0

    const db = await conn('TestDB');
    if(db){
        try{
            let resData =[] 
            const results = await db.query('select case when max(order_id) is null then 0 else max(order_id) end as order_id from tbOrder where order_id')
            order_id = results[0][0].order_id 
            order_id = order_id +1
            console.log('Generate Order ID  : ',order_id)
            let dataorder = {
                order_id: order_id,
                order_list_cnt: sell[sell.length-1].sell_item,
                order_total: sell[sell.length-1].sell_totalprice,
                order_sum_total: sell[sell.length-1].sell_sumtotalprice,
                order_payment: sell[sell.length-1].sell_payment
            }
            console.log('Insert tbOrder : ',dataorder)
            resData.push(dataorder)
            const resultsInsert = await db.query('INSERT INTO tbOrder  SET ?',dataorder)
            //console.log('Result Insert tbOrder : ',resultsInsert)

           for(let i=0;i<sell.length-1;i++){
                let multirow = []
                let row =''
                for(let j=0;j<sell[i].length;j++){
                    //console.log('Row : ', sell[i][j])
                    order_seq = sell[i][0]
                    prodt_id = sell[i][1]
                    prodt_qty = sell[i][2]
                    prodt_price = sell[i][3]
                }
  
                row= [order_id,order_seq, prodt_id, prodt_qty,prodt_price]
                multirow.push(row)
                //insert to table tbOrder_detail
                console.log('deJaaa :  ',multirow)
                resData.push(multirow)

                const results =await db.query(`insert into tbOrder_details
                    (order_id,order_seq,prodt_id,prodt_qty,prodt_price)
                    values ?`,
                    [multirow]
                )

            }
            console.log('file:sell.js[ api:/sell/create ]',' Insert tbOrder/tbOrder_details---> ok')
            db.end();
            res.setHeader('Content-Type', 'text/plain');
            return res.status(200).send(resData)

        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error:file name->sell.js|path api post[/sell/create] =>',err.message)
        }

    }else{
        res.status(500).json({
             err : 'มีข้อผิดพลาด : ',
             msg : 'Error:file name->sell.js|path api post[/sell/create]|Connection to Database fail ---> Error Access denied'   
        })
    } 

    // random pad string 4 digit
    /*
        let val = Math.floor(1000 + Math.random() * 9000);
        //console.log(val);
        //pad string
        const zeroPad = (num, places) => String(num).padStart(places, '0')
        console.log(zeroPad(val, 4)); // "0005"
    */

})

router.post('/sell/generateQR/:amount', async(req,res)=>{

    let amount = req.params.amount
    amount = parseFloat(amount)
    // Get promtpay no.
    const mobile_no = '0857144983'
    const payload = generatePayLoad(mobile_no,{amount})
    const option ={
            color : {
            dark : '#000',
            light : '#fff'
            }
          }
          //QRCode.toString(payload,)
        QRCode.toDataURL(payload,option,(err,url) =>{
            if(err){
                console.log('generate QRcode fail..')
                res.status(600).json({
                    err : ' มีข้อผิดพลาด generate QRcode fail..  ',
                    msg : err.message
                })
            }else{
                //console.log('serve : ',url)
                console.log('file:sell.js[ api:/sell/enerateQR ]-->','ok')
                res.status(200).json({
                    data: url
                })
            }
          
        })

})

router.post('/sell/generateInvoice', async(req,res)=>{

    let inv = req.body  
    // console.log('Inv: ',inv.order_id)
    // console.log('Inv: ',inv.sell_item)
    // console.log('Inv: ',inv.sell_totalprice)
    // console.log('Inv: ',inv.sell_sumtotalprice)
    // console.log('Inv: ',inv.sell_totalprice_calc)
    // console.log('Inv: ',inv.sell_sumtotalprice_calc)
    // console.log('Inv: ',inv.detail)
    // console.log('Inv: ',inv.detail.length)


    try{
        let doc = new PDFDocument({ 
            margins: { top: 0, bottom: 0, left: 5, right: 2 },
            //ze: 'A7',
            size: [210,680],
            layout: 'portrait', // 'portrait' or 'landscape'
            fillColor:'#050505'
        });

        //Set fonts
        doc.registerFont('Sarabun', `fonts/Sarabun-Thin.ttf`)
        doc.font('Sarabun')
        generateInvoice(doc,inv); // Invoke `generateHeader` function.
      

        //let path = 'pdf/invoice.pdf'
        //doc.pipe(fs.createWriteStream(path));

        console.log('file:sell.js[ api:/sell/generateInvoice ]-->','ok')
        res.contentType('application/pdf');
        doc.pipe(res);

    }catch(err){
        res.status(500).json({
            err : ' มีข้อผิดพลาด ',
            msg : err.message
        })
        console.error('Error,sell.js,path api /sell/generateInvoice] =>',err.message)
    }

})

generateInvoice = async(doc,inv) =>{
	
        // Get promtpay no.
        let geturl = ''
        let amount = parseFloat(inv.sell_sumtotalprice_calc)
        const mobile_no = '0857144983'
        const payload = generatePayLoad(mobile_no,{amount})
        //console.log(payload)
         
        let d = new Date();
        let getdt = d.toLocaleString('en-GB').split(',')
        console.log(getdt[0] + " time: " + getdt[1]);
        doc.fillColor('#050505')
        doc.registerFont('Sarabun', `fonts/Sarabun-Thin.ttf`)
        doc.font('Sarabun')
        doc.fontSize(12)
        doc.text('ใบเสร็จรับเงิน', 10, 10, { align: 'center' })
        doc.moveDown()
        doc.registerFont('Sarabun', `fonts/Sarabun-Thin.ttf`)
        doc.font('Sarabun')
        .fontSize(8)
        doc.text(`เลขที่ : ${inv.order_id}`, 10, 30, { align: 'left' })
        doc.text(`วันที่ : ${getdt[0] + ' : '+getdt[1]}`, 10, 45, { align: 'left' })
        doc.text('---------------------------------------------------------------------------', 1, 55, { align: 'left' })
        doc.fontSize(9)
        doc.text('รายการ', 35, 63, { align: 'left' })
        doc.fontSize(9)
        doc.text('จำนวน', 125, 63, { align: 'left' })
        doc.fontSize(9)
        doc.text('ราคา', 170, 63, { align: 'left' })
        doc.text('-------------------------------------------------------------------', 1, 70, { align: 'left' })
         let positionRow =  80;
        doc.fontSize(8)
         doc.fillColor('#050505')
         for( let i =0;i<inv.detail.length;i++){
            //console.log(inv.detail[i][0])
            doc.text(`${inv.detail[i][0]}`, 1, positionRow, { align: 'left' })
            doc.text(`${inv.detail[i][1]}`, 135, positionRow, { align: 'left' })
            doc.text(`${inv.detail[i][2]}`, 155, positionRow, { align: 'right' })
            positionRow += 15

         }
         doc.fontSize(9)
         positionRow = positionRow-5
         doc.text('-------------------------------------------------------------------', 1, positionRow , { align: 'left' })
         doc.fontSize(9)
         doc.text(`  ${inv.sell_item}  รายการ`, 5, positionRow +10, { align: 'left' })

         doc.fontSize(10)
         let totalPrice = parseFloat(inv.sell_totalprice_calc)
         let sumtotalPrice = parseFloat(inv.sell_sumtotalprice_calc)
         if(totalPrice-sumtotalPrice == 0){
            doc.text('รวม   ' +` ${inv.sell_sumtotalprice}`, 100, positionRow +10, { align: 'right' })
         }else{
            let discnt = totalPrice-sumtotalPrice
            //console.log(discnt)
            doc.fontSize(9)
            doc.text('รวม   ' +` ${inv.sell_totalprice}`, 100, positionRow +10, { align: 'right' })
            if(discnt>0){            
                doc.fontSize(9)
                doc.text('ส่วนลด   ' +` ${setAmountFormatTh(discnt)}`, 100, positionRow +25, { align: 'right' })
                doc.fontSize(10)
                doc.text('รวมทั้งหมด   ' +` ${inv.sell_sumtotalprice}`, 80, positionRow +40, { align: 'right' })
    
            }else{
                doc.fontSize(10)
                doc.text('รวมทั้งหมด   ' +` ${inv.sell_sumtotalprice}`, 80, positionRow +25, { align: 'right' })

            }
        }

        let imgname = 'inv_'+'1205'
        await QRCode.toFile(`image/${imgname}.png`, String(payload)).then(qr => {      
            doc.fontSize(8)
            doc.text('สแกนชำระ ' , 10, positionRow +60, { align: 'center' })
            doc.image(`image/${imgname}.png`, 50, positionRow +69, {width: 120, height: 100 })   
        })

        doc.end();

    }

setAmountFormatTh =(amount)=>{
    formattest = Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    }).format(amount)
    return formattest

}

module.exports = router;


  
  