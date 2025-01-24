const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const conn = require('../config/configdb');

// app.get('/user/:shopid/:id',async(req,res) =>{
//     const id = req.params.id
//     const shopid = req.params.shopid
//     console.log(shopid)
//     //const db = await conn('TestDB');
//     const db = await conn(shopid);

// Get all procudt
router.get('/product/getall', async(req, res) => {
    
    const db = await conn('TestDB');
    //console.log( ' HI 555 ')
    if(db){
        try{
            const results = await db.query('SELECT *,DATE_FORMAT(prodt_timestamp, "%d/%m/%Y") AS "dt_name" FROM tbProduct;');
            res.json(results[0]);
            console.log('file:product.js[ api:/product/getall ]-->','ok')
            db.end();

        }catch(err){
            console.error('Error : file name->product.js | api path :/getall' ,err.message);
            res.status(500).json({
                err : 'มีข้อผิดพลาด : ',
                msg : err.message
            })
            db.end();
        }

    }else{
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : 'Error : file name->product.js | api path :/getall |Connection to Database fail ---> Error Access denied'   
        })
    }  

});


//get by id
router.get('/product/:id',async(req,res)=>{
    //res.send('Hello get product By ID One Product ');
    let id = req.params.id
    const db = await conn('TestDB');
    if(db){

        try{
            const results = await db.query('SELECT * FROM  tbProduct WHERE prodt_id = ?',id)
            //console.log('result : ',results[0].length)
            console.log('file:product.js[ api:/product/:id ]-->','ok')

            if (results[0].length>0){
                res.json({ 
                    product : 'Get ID Ok',
                    data : results[0]
                })
            }else{
                res.status(404).json({ 
                    product : 'ไม่พบข่อมูล..',
                    data : results[0]
                })
            }
            db.end();
    
        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error:file name->product.js|path api get[/product/:id] =>',err.message)
        }

    }else{
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : 'Error:file name->product.js|path api get[/product/:id]|Connection to Database fail ---> Error Access denied'   
        })
    }   

})

//post Insert - create
router.post('/product', async(req,res)=>{

    let product = req.body
    //console.log(req.body)
    const db = await conn('TestDB');
    if(db){
        try{
            const results = await db.query('INSERT INTO tbProduct  SET ?',product)
            //console.log('result : ',results)
            console.log('file:product.js[ api:/product ]-->','ok')
            // Close the connection
             res.json({
                 product : 'insert Ok',
                 data : results[0]
             })
             db.end();
        
        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error:file name->product.js|path api post[/product] =>',err.message)
        }
    }else{
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : 'Error:file name->product.js|path api post[/product]|Connection to Database fail ---> Error Access denied'   
        })
    }    

})

//put  update by id 
router.put('/product/:id',async(req,res)=>{
    
    let id = req.params.id
    let updateProduct = req.body
    const db = await conn('TestDB');
    if(db){
        try{
            //let user = req.body
            const results = await db.query(
                'UPDATE tbProduct SET ? WHERE prodt_id = ? ',
                [updateProduct,id]
            )
            //console.log('result : ',results)
            console.log('file:product.js[ api:productproduct/:id ]-->','ok ')

            res.json({
                product : 'update Ok',
                data : results[0]
            })
            db.end();
        
        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error:file name->product.js|path api put[/product/:id] =>',err.message)
        }

    }else{
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : 'Error:file name->product.js|path api put[/product/:id]| Connection to Database fail ---> Error Access denied'   
        })
    }    

})

// search by Name
router.get('/product/search/:name',async(req,res)=>{

    let sname = req.params.name
    const db = await conn('TestDB');
    if(db){
        try{

            let replacement = `'%${sname}%'`;
            let sqlStatement = `SELECT * from  tbProduct where prodt_name LIKE ${replacement}`;
            const results = await db.query(sqlStatement)
            console.log('file:product.js[ api:product/search/:name ]-->','ok ')

            //console.log('result : ',results[0].length)
            res.json(results[0]);
            db.end();

        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error:file name->product.js|path api get[/product/search/:name] =>',err.message)
        }

    }else{
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : 'Error:file name->product.js|path api get[/product/search/:name]|Connection to Database fail ---> Error Access denied'   
        })
    }   

})

router.get('/product/searchname/:name',async(req,res)=>{

    let sname = req.params.name
    const db = await conn('TestDB');
    if(db){
        try{
            //console.log(sname.trim())
            const results = await db.query('SELECT * FROM  tbProduct WHERE prodt_name = ?',sname.trim())
            //console.log('output : ',results)
            console.log('file:product.js[ api:product/searchname/:name ]-->','ok ')
            res.json(results[0]);
            db.end();

        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error:file name->product.js|path api get[/product/searchname/:name] =>',err.message)
        }

    }else{
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : 'Error:file name->product.js|path api get[/product/searchname/:name]|Connection to Database fail ---> Error Access denied'   
        })
    }   

})

router.delete('/product/:id',async(req,res)=>{

    let id = req.params.id
    const db = await conn('TestDB');
    if(db){
        try{
            const results = await db.query('DELETE FROM tbProduct WHERE prodt_id = ?',id)
            //console.log('result : ',results[0].length)
            console.log('file:product.js[ delete api:/product/:id ]-->','ok ')

            res.json({
                product : 'delete Ok',
                data : results[0]
            })
            db.end();
        
        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error,product.js,path api delete[/product/:id] =>',err.message)
        }

    }else{
        res.status(500).json({
        err : 'มีข้อผิดพลาด : ',
        msg : 'Error,product.js,path api delete[/product/:id]|Connection to Database fail ---> Error Access denied'   
        })
    } 

})

module.exports = router;
