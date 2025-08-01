const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const conn = require('../config/configdb');
require('dotenv').config();

exports.login = async (req,res) =>{

    const db = await conn('fposDb');
    if(db){
        try{
            let dataLogin = req.body
            //console.log(' reg Body : ',dataLogin)
            //1 check user
            const results = await db.query(`SELECT * FROM tbUser where user_name = '${dataLogin.user_name}';`);
            // select user from DB  check avaible User
            if(results[0].length==1){
                // check Password  kosin hi 555
                //console.log('key =---> ',PRIVATE_KEY)
                const resultData = results[0];
                const usr_name =dataLogin.user_name;
                const pass = dataLogin.user_pass;
                // check password 
                const match = await bcrypt.compare(pass,resultData[0].user_password)
                //console.log(' compare ---' ,'ok')
                if(!match){
                    console.log('---> Password Invalid ...')
                    return res.status(200).send({
                                password_status:0
                            })
                }else{
                    console.log(`shop id : ${resultData[0].shop_id} ---> Password ok `)
                    // jwt token Generate
                    const PRIVATE_KEY = process.env.APP_PRIVATE_KEY;
                    //console.log(' private Gen Key : ',PRIVATE_KEY)
                    const  shopName = resultData[0].shop_name
                    const token = jwt.sign({shopName,role:'admin'},PRIVATE_KEY,{expiresIn:'1h'})

                    return res.status(200).send({
                                token:token,
                                shopId:resultData[0].shop_id,
                                shopName:resultData[0].shop_name,
                                user_name:resultData[0].user_name
                           })
                           
                }


            }else{
                console.log('---> User Name Invalid ...')
                return res.status(200).send({
                    data_code : 0,
                    user_name : dataLogin.user_name
                })
            }

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
 

//iaqz dezx ppiq whvk