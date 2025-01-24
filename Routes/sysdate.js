const express = require('express')
const router = express.Router();

router.get('/systemdate/getdate', async(req, res) => {
    
    try{
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        const dateSys = date + "/" + month + "/" + year
        //console.log('Sysdate : ',dateSys)
        let result =  date_ob
        res.json(result);
        console.log(`file:sysdate.js[ api:/systemdate/getdate ] get system date ok -->${dateSys}`)

    }catch(err){
        console.error('Error : file:sysdate.js[ api:/systemdate/getdate ]-->' ,err.message);
        res.status(500).json({
            err : 'มีข้อผิดพลาด : ',
            msg : err.message
        })
    }

});

module.exports = router;
