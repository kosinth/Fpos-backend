const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const conn = require('../config/configdb');
require('dotenv').config();

exports.getuser = async (req,res) =>{

    const db = await conn('fposDb');
    if(db){
        try{
            const authHeader = req.headers['authorization']
            //console.log('Authorize', authHeader)
            let authToken =''
            if(authHeader){
                authToken = authHeader.split(' ')[1]
            }
            
            console.log('authToken XX ', authToken)
            const PRIVATE_KEY = process.env.APP_PRIVATE_KEY;
            const user = jwt.verify(authToken,PRIVATE_KEY)
            console.log('User ', user)
            
            let dataLogin = req.body
            const results = await db.query(`SELECT * FROM tbUser ;`);

            return res.status(200).send({
                user_data : results[0]
            })

            db.end();
        
        }catch(err){
            db.end();
            console.log(err)
            res.status(500).send(err)
        }

    }else{
      
        res.status(500).json({
           err : 'มีข้อผิดพลาด : ',
           msg : 'Error:file name->login.js|path api post[/login]| Login fail ---> Error Access denied'   
        })

    }  

}
 