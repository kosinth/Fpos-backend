const mysql = require('mysql2/promise');
const conn = require('../config/configdb');
const connCreate = require('../config/createdb');

require('dotenv').config();

exports.approveExpire = async (req,res) =>{

    const db = await conn('fposDb');
    if(db){
        try{
            let dataLogin = req.body
            //console.log(' reg Body : ',dataLogin)
            //1 check user
            const results = await db.query(`SELECT * FROM tbUser where user_name = '${dataLogin.user_name}';`);
            // select user from DB  check avaible User
            if(results[0].length==1){
                // check Password
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
           msg : 'Error:file name->approve-expire.js|path api post[/approve-expire]| ----> approve fail '
        })

    }  

}

exports.checkpassword = async (req,res) =>{

        try{
            let checkPass = req.body
            const PASSWORD_APPROVE = process.env.PASSWORD_APPROVE;
            if(PASSWORD_APPROVE==checkPass){
                console.log(' password approve -- > ok',checkPass)
                res.status(200).send({
                   checkpass: 1     
                })
            }else{
                res.status(200).send({
                    checkpass: 0     
                 })
            }
        
        }catch(err){
            res.status(500).json({
                err : 'มีข้อผิดพลาด : ',
                msg : 'Error:file name->approve-expire.js|path api post[/approve-checkpassword]| ----> passord approve fail '
             })
             }

}


exports.getApproveUser = async (req,res) =>{

    const db = await conn('fposDb');
    if(db){
        try{
            let approveUser = req.body
            console.log(approveUser)

            const results = await db.query(`SELECT shop_id,shop_name,user_name, user_mobile,user_approve, DATE_FORMAT(user_expire, '%d-%m-%Y') as user_expire  FROM tbUser; `);
            //console.log(' reg Body : ',results[0])
            res.status(200).json(results[0]);

            db.end();
        
        }catch(err){
            db.end();
            console.log(err)
            res.status(500).send(err)
        }

    }else{
        res.status(500).json({
           err : 'มีข้อผิดพลาด : ',
           msg : 'Error:file name->approve-expire.js|path api get[/approve-getuser]| ----> approve getuser fail '
        })

    }  

}

// approve set expire_date and generate DB
exports.approveuser = async (req,res) =>{

    const db = await conn('fposDb');
    if(db){
        try{
            let id = req.params.id
            const results = await db.query(
                                'UPDATE tbUser SET user_approve=1 WHERE shop_id = ? ',
                                [id]
                            )
            //set Expire date
            const results_1 = await db.query( `SELECT DATE_FORMAT(CURDATE() + INTERVAL 1 year, '%y-%m-%d') as expireDate ; `);
             let expire = results_1[0];
             expire = expire[0].expireDate
             const results_2 = await db.query(
                `UPDATE tbUser SET user_expire = '${expire}'  WHERE shop_id = ? `,
                [id]
            )

            // Create DB
            let databaseName = 'cposDb_'+id; 
            console.log("  Db : --> ",databaseName);
            const dbcreate = await connCreate(databaseName);
            let createQuery = ` CREATE DATABASE IF NOT EXISTS  ${databaseName}`; 
            dbcreate.query(createQuery, (err) => { 
                if(err) throw err; 
                console.log(`Database [ ${databaseName} ] Created Successfully !`); 
                let useQuery = `USE ${databaseName}`; 
                dbcreate.query(useQuery, (error) => { 
                    if(error) throw error; 
                    // create Table tbOrder
                    let sql = "CREATE TABLE IF NOT EXISTS  tbOrder ( order_id int NOT NULL,"
                        sql+= " order_list_cnt smallint NOT NULL,"
                        sql+= " order_total double NOT NULL,"
                        sql+= " order_sum_total double NOT NULL,"
                        sql+= " order_payment tinyint NOT NULL,"
                        sql+= " order_timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                        sql+= " PRIMARY KEY (`order_id`)"
                        sql+= "  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci "
                        dbcreate.query(sql, function (err, result) {
                        if (err) throw err;
                            console.log(" tbOrder created");
                        });
                            
                         // create Table tbOrder 
                        sql = "CREATE TABLE IF NOT EXISTS  tbOrder_details ( order_id int NOT NULL,"
                        sql+= " order_seq smallint NOT NULL,"
                        sql+= " prodt_id int NOT NULL,"
                        sql+= " prodt_qty smallint NOT NULL,"
                        sql+= " prodt_price  double NOT NULL,"
                        sql+= " order_timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                        sql+= " PRIMARY KEY (`order_id`,`order_seq`,`prodt_id`)"
                        sql+= "  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci "
                        dbcreate.query(sql, function (err, result) {
                        if (err) throw err;
                            console.log(" tbOrder_details created");
                        });

                         // create Table tbProduct 
                         sql = "CREATE TABLE IF NOT EXISTS  tbProduct ( prodt_id int NOT NULL AUTO_INCREMENT,"
                         sql+= " prodt_name varchar(255) COLLATE utf8mb4_general_ci NOT NULL,"
                         sql+= " prodt_short varchar(100) COLLATE utf8mb4_general_ci NOT NULL,"
                         sql+= " prodt_price double NOT NULL,"
                         sql+= " prodt_timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                         sql+= " PRIMARY KEY (`prodt_id`)"
                         sql+= "  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci "
                         dbcreate.query(sql, function (err, result) {
                         if (err) throw err;
                             console.log(" tbProduct created");
                         });

                }) 
            }); 

            console.log(`file:approve-exprire.js[ api:approve-approveuser/:id ] ID --> ${id} `,'ok ')
            res.json({
                statusUpdate : 1
                //data : results[0]
            })
            db.end();

            // check expire date where date
            //select * from tbUser a 
            //WHERE DATE_FORMAT(a.user_expire, '%Y-%m-%d') < DATE_FORMAT(CURDATE(), '%Y-%m-%d')

        }catch(err){
            db.end();
            console.log(err)
            res.status(500).send(err)
        }

    }else{
        res.status(500).json({
           err : 'มีข้อผิดพลาด : ',

           msg : 'Error:file file:approve-exprire.js[ api:approve-approveuser/:id]| ----> approve getuser fail '
        })

    }  

}

exports.approvedelete = async (req,res) =>{

    let id = req.params.id
    const db = await conn('fposDb');
    if(db){
        try{
            
            const results = await db.query('DELETE FROM tbUser WHERE shop_id = ?',id)
            //console.log('result : ',results[0].length)
            console.log(`file:approve-expire.js[ delete api:/approve-delete/:id ]--> ${id} `,' ok ')
   
            res.json.status(200).json({
                data : results[0]
            })

            db.end();
        
        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error,file:approve-expire.js[ delete api:/approve-delete/:id] =>',err.message)
        }

    }else{
        res.status(500).json({
        err : 'มีข้อผิดพลาด : ',
        msg : 'Error,file:approve-expire.js[ delete api:/approve-delete/:id]|Connection to Database fail ---> Error Access denied'   
        })
    } 

}

exports.approvesearch = async (req,res) =>{

    const db = await conn('fposDb');

    if(db){

        try{
            let dataSearch = req.body
             //console.log('search : ',req.body)
            let shop_name = dataSearch.shop_name.trim();
            
            let sqlStatement = `SELECT shop_id,shop_name,user_name, user_mobile, user_approve, DATE_FORMAT(user_expire, '%d-%m-%Y') as user_expire from  tbUser where `
            if(dataSearch.shop_id==0){
                sqlStatement += `  shop_name like '${shop_name}' `;
            }else{
                sqlStatement += ` shop_id = ${dataSearch.shop_id} `
            }
            console.log(sqlStatement)
            const results = await db.query(sqlStatement)
            //console.log('result : ',results[0])
            console.log(`file:approve-expire.js[ get api:/approve-search ]--> ${dataSearch.shop_id}} `,' ok ')
            res.status(200).json(results[0]);
            db.end();
        
        }catch(err){
            res.status(500).json({
                err : ' มีข้อผิดพลาด ',
                msg : err.message
            })
            db.end();
            console.error('Error,file:approve-expire.js[ delete api:/approve-search] =>',err.message)
        }

    }else{
        res.status(500).json({
        err : 'มีข้อผิดพลาด : ',
        msg : 'Error,file:approve-expire.js[ delete api:/approve-search]|Connection to Database fail ---> Error Access denied'   
        })
    } 

}

