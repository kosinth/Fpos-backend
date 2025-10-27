const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const conn = require('../config/configdb');
require('dotenv').config();

exports.login = async (req,res) =>{

    const db = await conn('fposDb');
    //const db = await conn('Cpos_db');
    if(db){
        try{
            let dataLogin = req.body
            //console.log(' reg Body : ',dataLogin)
            //1 check user
            //table tbUser_admin
            //shop_id
                try{
                    const results1 = await db.query(`SELECT shop_id,user_approve FROM tbUser where shop_id = '${dataLogin.shop_id}' and user_approve=1 ;` );
                    // select user from DB  check avaible User
                    console.log(results1[0].length);
                    if(results1[0].length==1){
                        const databaseName = 'fposDb_'+dataLogin.shop_id; 
                        console.log(`connected database ${databaseName} ---> ok`);
                        const db1 = await conn(databaseName);
                        if(db1){
                            const results = await db1.query(`SELECT * FROM tbUser_admin where user_name = '${dataLogin.user_name}';`);
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

                        }else {
                            res.status(500).json({
                                err : 'มีข้อผิดพลาด : ',
                                msg : 'Error:file name->login.js|path api post[/login]| Login fail ---> Error Access denied'   
                            })

                        }
                        db1.end();

                    }else {
                        console.log('---> Shop Id Invalid ...')
                        return res.status(200).send({
                            data_code : 0,
                            user_name : dataLogin.shop_id
                        })

                    }
                
                }catch(err){

                    db1.end();
                    console.log(err)
                    res.status(500).send(err)

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