const express = require('express')
const router = express.Router();
const {login} = require('../controller/login')
const {getuser} = require('../controller/user')

router.post('/login',login)
router.get('/getuser',getuser)

module.exports = router;