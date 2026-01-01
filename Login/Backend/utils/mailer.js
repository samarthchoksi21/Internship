require('dotenv').config()
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS,
    }

})
async function sendOtp(to,otp,text){
    await transporter.sendMail({
        from : process.env.MAIL,
        to,
        subject :  "EMAIL VERIFICATION OTP",
        text
    })

}
module.exports = {sendOtp}