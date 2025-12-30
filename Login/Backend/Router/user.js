const express = require('express')
const router = express.Router()
const {HandleSignupPage,HandleLoginPage,HandleChangePassword,VerifyOtp,HandleResendOtp} = require('../controller/user')
router.post('/signup',HandleSignupPage)
router.post('/login',HandleLoginPage)
router.post('/change',HandleChangePassword)
router.post('/otp',VerifyOtp)
router.post('/re-send',HandleResendOtp)


module.exports = router