const express = require('express')
const router = express.Router();
const mysql = require('mysql2/promise');
const conn = require('../config/configdb');
const dt = require('../config/system')
const multer = require('multer');
const fs = require('fs')
const XLSX = require('xlsx');
//const http = require('http');

//const { console } = require('inspector');
let filename =''
const storage = multer.diskStorage({
    destination :   function(req,file,cb){
        cb(null,'uploads')
    },filename : function(req,file,cb){
        // const newDate = dt(); 
        // filename = `${newDate}_${file.originalname}`
        filename = file.originalname
        console.log(filename)
        cb(null,filename)
        console.log(' upload file ---> ok :  ',filename)
    }

})
const upload = multer({
    storage
})

router.post('/upload',upload.single('loadfile') ,async(req, res) => {

        try{
            console.log('file:upload.js[ api:/upload ] upload ok --> ')
            //const scuu = await readTextFile(filename)
            const succ =  await reeadExcel(filename)
            res.status(200).json({
                message:  'Upload Success'
            })

        }catch(err){
            console.error('Error : file:upload.js[ api:/upload ]-->' ,err.message);
            res.status(500).json({
                err : 'มีข้อผิดพลาด : ',
                msg : err.message
            })
        }

});

const reeadExcel= async (fileIn)=>{

    const db = await conn('TestDB');
    if(db){
        try{
            path = require('path')   
            let filePath = path.join('uploads', 'Refsnes', '..', fileIn);
            //console.log( ' FFF ',filePath)
            const workbook = XLSX.readFile(`${filePath}`);
            const sheet_name_list = workbook.SheetNames;
            const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            //console.log(xlData )
            //delete data form product Table 
            const resultsdel = await db.query('TRUNCATE TABLE  tbProduct;')
            console.log('file:upload.js[ api:/upload ] truncate table tbProduct ok --> ')
            for(let i = 0;i<xlData.length;i++){
                let sql = `INSERT INTO tbProduct (prodt_name, prodt_price,prodt_short) VALUES ('${xlData[i].สินค้า}', '${xlData[i].ราคาต่อหน่วย}','${xlData[i].คีย์ค้นหา}')`;
                const results = await db.query(sql)
            }
            console.log('file:upload.js[ api:/upload ] insert to tbProduct ok --> ')
            db.end();

        }catch(error){
            console.error('Error:file name->upload.js|path api post[/upload]| ',error);
            db.end();
        }

    }else{
        res.status(500).json({
           err : 'มีข้อผิดพลาด : ',
           msg : 'Error:file name->upload.js|path api post[/upload]| Upload fail ---> Error Access denied'   
        })
    } 
 }

const readTextFile =(fileIn)=>{
    
    path = require('path')   
    let filePath = path.join('uploads', 'Refsnes', '..', fileIn);
    console.log( ' FFF ',filePath)
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            console.log('received data: ' + data);
        } else {
            console.log(err);
        }
    });
}

router.get('/download', async(req, res, next) => {        

    const path = require('path')   
    const mime = require('mime-types')
    const file = 'download' + "/product.xlsx"
    console.log(file)
    const fileName = path.basename(file)
    const mimeType =  mime.contentType(file)
    res.setHeader("Content-Disposition", "attachment;filename=" + fileName)
    res.setHeader("Content-Type", mimeType)
    console.log('file:upload.js[ api:/download ] download file ok --> ')

    setTimeout(() => {
        res.download(file)
    }, 2000);



});


module.exports = router;

