const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs')
const conn = require('../config/configdb');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

exports.register = async (req,res) =>{
    
    const db = await conn('fposDb');
    //const db = await conn('Cpos_db');
    if(db){
        try{
            let dataUser = req.body
            //console.log(' reg Body : ',dataUser)
            //1 check user
            const results = await db.query(`SELECT * FROM tbUser where user_name = '${dataUser.user_name}';`);
            // select user from DB  check avaible User
            console.log('result row count : ',results[0].length)
            //console.log('result  xxx : ',results[0])
            if(results[0].length==0){
                // not avaiable to register
                // random 4 digit
                const usr_name =dataUser.user_name;
                const pass = dataUser.user_password;
                //console.log(' Password  ddd ; ',pass)
                const getId = await fnGenerateId(db)
                //console.log('Random ',getId);
                const salt = await bcrypt.genSalt(10);
                dataUser.shop_id = getId;
                dataUser.user_password = await bcrypt.hash(dataUser.user_password,salt);
                //console.log(' passw encrpt : ',dataUser.user_password)
                 //insert to tbUser
                const resultIns = await db.query('INSERT INTO tbUser  SET ?',dataUser);
                //console.log('aaaa  : ',resultIns)
                console.log('file:auth.js[ api:/register] register -->','ok')
                const emailINfo =  getId+"!"+usr_name+"!"+pass +"!"+dataUser.user_email
                await sendmail(emailINfo);
                res.status(200).send({
                    shop_id:dataUser.shop_id,
                    user_id:usr_name,
                    password:pass
                })

            }else{
                console.log(' User Name ---> '+dataUser.user_name +' are already ... ')
                // Avaiable User return 1
                return res.status(200).send({
                    data_code : 1,
                    user_name : dataUser.user_name
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
           msg : 'Error:file name->auth.js|path api post[/register]| register fail ---> Error Access denied'   
        })

    }  

}

const fnGenerateId = async(db)=>{
    
    try{
        let val = Math.floor(1000 + Math.random() * 9000);
        const zeroPad = (num, places) => String(num).padStart(places, '0');
        let shopId ='';
        for(let i =0;i<9999;i++){
            shopId = zeroPad(val, 4);
            const results = await db.query(`SELECT * FROM tbUser where shop_id = '${shopId}';`);
            if(results[0].length==0){
                console.log('--> i=', i + " Shop ID : "+shopId);
                break;
            }
        }
        return shopId;

    }catch (err){
        return err;
    }

}

 const sendmail = async(textMail) =>{
        
    try {
       let mailText = textMail.split('!');
       let maillist = [
            'kosinth.bua@outlook.co.th',
            //'kosinth.bua@gmail.com',
            ` ${mailText[3]}`,
        ];

        let transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: "kosinth.bua@gmail.com",
                pass: "iaqz dezx ppiq whvk"
            }
        }));

        let dat_date = new Date();
        dat_date = dat_date.toLocaleString('en-GB',{hour12: false})

        let mailOptions = {
           from: 'kosinth.bua@gmail.com',
            to: maillist,
            cc: 'kosinth.bua@outlook.co.th',
            subject: 'Fast-PoS : ข้อมูลการใช้งานระบบ',
            text: ` ข้อมูลระบบ  Fast-PoS  \n รหัสร้านค้า ID ---> ${mailText[0]} \n User Login (ชื่อสำหรับ Login) ---> ${mailText[1]}  \n Password ( รหัสผ่าน ) ---> ${mailText[2]}  \n  --------------------------------------- \n  วันที่ลงทะเบียน  ${dat_date} \n ขอบคุณที่ลงทะเบียนและใช้บริการ Fast-PoS   \n สงวนสิขสิทธิ บริษัท กระเพรา-ซอฟต์ จำกัด ` 

        };
            
        const mail = await transporter.sendMail(mailOptions, function(error, info){
            if(error) {
                console.log(error);
                //return info ? info.messageId : null;
            }else{
                //console.log('Email sent: ' + info.response + " : ") ;
                //return  info.response
            }
        });  

    }catch(error) {
        console.log(error);
    }
  
}

//iaqz dezx ppiq whvk