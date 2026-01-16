const express = require('express')
const router = express.Router();
const {login} = require('../controller/login')
const {getuser} = require('../controller/user')

const {approveExpire,checkpassword,getApproveUser,
       approveuser,approvedelete,approvesearch,approveaddData} = require('../controller/approve-expire')

router.post('/login',login)
router.get('/getuser',getuser)
router.post('/approve-expire',approveExpire)
router.post('/approve-checkpassword',checkpassword)
router.get('/approve-getuser',getApproveUser)
router.put('/approve-approveuser/:id',approveuser)
router.delete('/approve-delete/:id',approvedelete)
router.post('/approve-search',approvesearch)
router.post('/approve-addData/:id',approveaddData)

module.exports = router;
//test