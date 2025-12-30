require('dotenv').config()
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS,
    }

})
async function sendOtp(to,otp){
    await transporter.sendMail({
        from : process.env.MAIL,
        to,
        subject :  "EMAIL VERIFICATION OTP",
        text: `Your OTP for authentication is ${otp}`
    })

}
module.exports = {sendOtp}