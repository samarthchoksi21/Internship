const express = require("express");
const router = express.Router();
const {
  HandleSignupPage,
  HandleLoginPage,
  HandleChangePassword,
  VerifyOtp,
  HandleResendOtp,
  GetOtpForChangingPassword,
  HandleForgotPasswordEmailSendOtp
} = require("../controller/user");
router.post("/signup", HandleSignupPage);
router.post("/login", HandleLoginPage);
router.post("/change", HandleChangePassword);
router.post("/otp", VerifyOtp);
router.post("/changepasswordotp", GetOtpForChangingPassword);
router.post('/forgotpasswordemail',HandleForgotPasswordEmailSendOtp);
router.post("/re-send", HandleResendOtp);
module.exports = router;
