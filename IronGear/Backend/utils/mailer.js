const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtp(to, otp, text) {
  try {
    await resend.emails.send({
      from: "IronGear <onboarding@resend.dev>", 
      to,
      subject: "EMAIL VERIFICATION OTP",
      text: text || `Your OTP is ${otp}. Do not share this code.`,
    });

    console.log("OTP email sent via Resend");
  } catch (err) {
    console.error("OTP email failed via Resend:", err.message);
  }
}

module.exports = { sendOtp };
