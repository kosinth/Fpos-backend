const express = require('express')
const router = express.Router();
const mysql = require('mysql2/promise');
const conn = require('../config/configdb');

router.post('/report/sell/:dateparam', async(req, res) => {

    let sell = req.params.dateparam
    const db = await conn('TestDB');

    if(db){
        try{
            const arrDateParam = sell.split(',')
            console.log('Report sell date from to  : ',arrDateParam[0] + " to " + arrDateParam[1])
            let sqlStr = "SELECT COUNT(a.order_id) as cntOrder ,SUM(a.order_total) AS total, DATE_FORMAT(a.order_timestamp, '%Y-%m-%d') AS Day "            
            sqlStr += " FROM tbOrder a "
            sqlStr += ` where DATE_FORMAT(a.order_timestamp, '%Y-%m-%d') between DATE_FORMAT('${arrDateParam[0]}', '%Y-%m-%d')  `
            sqlStr += ` and DATE_FORMAT('${arrDateParam[1]}', '%Y-%m-%d') `
            sqlStr +=" GROUP BY DATE_FORMAT(a.order_timestamp, '%Y-%m-%d') "
            //console.log(sqlStr)
            const results = await db.query(`${sqlStr}`)
            res.setHeader('Content-Type', 'text/plain');
            console.log('file:reports.js[ api:/report/sell ] generate reports sell ok -->' ,results[0])
            return res.status(200).send(results[0])

        }catch(err){
            console.error('Error : file:reports.js[ api:/report/sell ]-->' ,err.message);
            res.status(500).json({
                err : 'มีข้อผิดพลาด : ',
                msg : err.message
            })
        }

    }else{
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : 'Error:file name->report.js|path api post[/report/sell]|Connection to Database fail ---> Error Access denied'   
        })
    } 

});

router.post('/report/product/:dateparam', async(req, res) => {

    let sell = req.params.dateparam
    const db = await conn('TestDB');

    if(db){
        try{
            const arrDateParam = sell.split(',')
            console.log('Report product date from to  : ',arrDateParam[0] + " to " + arrDateParam[1])

            let sqlStr = "SELECT sum(a.prodt_qty) as cnt ,b.prodt_name ,a.prodt_id ,sum(a.prodt_price) as sum_prodt "
            sqlStr +=  " FROM tbOrder_details a ,tbProduct b "
            sqlStr +=  ` where DATE_FORMAT(a.order_timestamp, '%Y-%m-%d') between DATE_FORMAT('${arrDateParam[0]}', '%Y-%m-%d') `
            sqlStr +=  ` and DATE_FORMAT('${arrDateParam[1]}', '%Y-%m-%d') `
            sqlStr +=  " and a.prodt_id = b.prodt_id "
            sqlStr +=  " GROUP by a.prodt_id "
            sqlStr +=  " ORDER BY cnt DESC "
            //console.log(sqlStr)
            const results = await db.query(`${sqlStr}`)
            res.setHeader('Content-Type', 'text/plain');
            console.log('file:reports.js[ api:/report/product ] generate reports product ok -->' ,results[0])
            return res.status(200).send(results[0])

        }catch(err){
            console.error('Error : file:reports.js[ api:/report/product ]-->' ,err.message);
            res.status(500).json({
                err : 'มีข้อผิดพลาด : ',
                msg : err.message
            })
        }

    }else{
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : 'Error:file name->report.js|path api post[/report/product]|Connection to Database fail ---> Error Access denied'   
        })
    } 

});

module.exports = router;

