const express = require("express");
const router = express.Router();
const {VerifyUser} = require('../service/auth')
const {
  HandleSignupPage,
  HandleLoginPage,
  HandleChangePassword,
  VerifyOtp,
  HandleResendOtp,
  GetOtpForChangingPassword,
  HandleForgotPasswordEmailSendOtp,
  GetAllProductsPublic,
  GetMyDetail,
  createOrder,
  applyCoupon,
  Logout
} = require("../controller/user");
router.post("/signup", HandleSignupPage);
router.post("/login", HandleLoginPage);
router.post("/change", HandleChangePassword);
router.post("/otp", VerifyOtp);
router.post("/changepasswordotp", GetOtpForChangingPassword);
router.post('/forgotpasswordemail',HandleForgotPasswordEmailSendOtp);
router.post("/re-send", HandleResendOtp);
router.get('/allproduct',VerifyUser,GetAllProductsPublic)
router.get('/me',VerifyUser,GetMyDetail)
router.post('/order',VerifyUser,createOrder)
router.post('/applycoupon',VerifyUser,applyCoupon)
router.get('/logout',VerifyUser,Logout)
router.get("/auth/verify", VerifyUser, (req, res) => {
  res.status(200).json({
    loggedIn: true,
    user: req.user
  });
});
module.exports = router;
