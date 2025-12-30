const { USER } = require("../Models/user");
const { OTP } = require("../Models/otp");
const { PENDINGUSER } = require("../Models/pendinguser");
const { sendOtp } = require("../utils/mailer");

const bcrypt = require("bcrypt");
function GenerateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function HandleSignupPage(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await USER.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const pending = await PENDINGUSER.findOne({ email });
    if (pending) {
      return res.status(400).json({
        message: "OTP already sent. Please verify email",
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await PENDINGUSER.create({
      username,
      email,
      passwordHash,
    });
    const otp = GenerateOtp();
    const otpHash = await bcrypt.hash(otp.toString(), 10);
    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    await sendOtp(email, otp);

    return res.status(201).json({
      message: "Signup successful. OTP sent to your email",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
}
async function VerifyOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({
      Status: "Please Enter OTP",
    });
  }
  const OtpRecord = await OTP.findOne({ email });
  if (!OtpRecord) {
    return res.status(400).json({
      status: "OTP not found",
    });
  }
  if (OtpRecord.expiresAt < Date.now()) {
    return res.status(400).json({
      Status: "OTP expired",
    });
  }
  const IsOtpValid = await bcrypt.compare(otp.toString(), OtpRecord.otpHash);
  if (!IsOtpValid) {
    return res.status(400).json({
      Status: "Invalid Otp",
    });
  }
  const PendingUser = await PENDINGUSER.findOne({ email });
  if (!PendingUser) {
    return res.status(400).json({ Status: "Session expired" });
  }
  await USER.create({
    username: PendingUser.username,
    email: PendingUser.email,
    password: PendingUser.passwordHash,
  });
  await PENDINGUSER.deleteOne({ email });
  return res.status(200).json({
    status: "VALID OTP",
  });
}

async function HandleLoginPage(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ Message: "Enter credentials" });
    }
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(400).json({ Message: "Email not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ Message: "Invalid password" });
    }
    return res.status(200).json({ Message: "Login successfully" });
  } catch (error) {
    if (error) {
      return res.status(500).json({ Message: "Error while login" });
    }
  }
}
async function HandleChangePassword(req, res) {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ Message: "All fields required" });
    }

    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(404).json({ Message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ Message: "Old password incorrect" });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.status(400).json({
        Message: "New password must be different from old password",
      });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res
        .status(400)
        .json({ Message: "Password should contain at least 1 capital letter" });
    }
    if (newPassword.length < 7) {
      return res
        .status(400)
        .json({ Message: "Password should at least have 6 charachters" });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await USER.updateOne({ email }, { $set: { password: hashedNewPassword } });

    return res.status(200).json({ Message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ Message: "Server error" });
  }
}

async function HandleResendOtp(req, res) {
  try {
    
    const { email } = req.body;
    if (!email) {
      console.log("Email not found")
      return res.status(400).json({
        Status: "Email not found",
      });
    }
    const pendingrequest = await PENDINGUSER.findOne({ email });
    
    if (!pendingrequest) {
      return res.status(400).json({
        Status: "Session expired",
      });
    }
    const existOtp = await OTP.findOne({ email });
    
    if (existOtp) {
      const timediff = (Date.now() - existOtp.createdAt.getTime()) / 1000;
      if (timediff < 60) {
        return res.status(429).json({
          Status: `Please wait ${
            60 - Math.floor(timediff)
          } seconds before resending OTP`,
        });
      }
    }
    const otp = GenerateOtp();
    
    const otpHash = await bcrypt.hash(otp.toString(), 10);
    

    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    await sendOtp(email, otp);
    return res.status(200).json({
      Status: "OTP sent successfully",
    });
  } catch (error) {
    console.log("Resend OTP error :",error)
    return res.status(500).json({
      Status : "SERVER ERROR",
      err : error.message
    })
  }
}

module.exports = {
  HandleSignupPage,
  HandleLoginPage,
  HandleChangePassword,
  VerifyOtp,
  HandleResendOtp
};
