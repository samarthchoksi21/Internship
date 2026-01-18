require('dotenv').config()
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

async function sendOtp(to,otp,text){
    await transporter.sendMail({
        from : process.env.MAIL,
        to,
        subject :  "EMAIL VERIFICATION OTP",
        text
    })

}
module.exports = {sendOtp}