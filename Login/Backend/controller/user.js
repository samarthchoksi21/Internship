const { USER } = require("../Models/user");
const { OTP } = require("../Models/otp");
const { PENDINGUSER } = require("../Models/pendinguser");
const { ROLE } = require("../Models/roles");
const { PRODUCT } = require("../Models/products");
const { sendOtp } = require("../utils/mailer");
const { GenerateTokens, VerifyUser } = require("../service/auth");
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

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = GenerateOtp();
    const otpHash = await bcrypt.hash(otp.toString(), 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await PENDINGUSER.findOneAndUpdate(
      { email },
      {
        username,
        email,
        passwordHash,
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    await OTP.findOneAndUpdate(
      { email },
      {
        otpHash,
        expiresAt: otpExpiry,
      },
      { upsert: true }
    );
    const text = `Your OTP for signup is ${otp}. Please dont share this OTP with anyone.If you didnt sent this otp please ignore this message.`;
    await sendOtp(email, otp, text);
    return res.status(201).json({
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Signup failed",
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
  const userRole = await ROLE.findOne({ name: "USER" });
  if (!userRole) {
    return res.status(400).json({ message: "Seed role first" });
  }
  await USER.create({
    username: PendingUser.username,
    email: PendingUser.email,
    password: PendingUser.passwordHash,
    roleRef: userRole._id,
  });
  await PENDINGUSER.deleteOne({ email });
  return res.status(200).json({
    status: "VALID OTP",
  });
}
async function GetOtpForChangingPassword(req, res) {
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
    const user = await USER.findOne({ email }).populate("roleRef");
    if (!user) {
      return res.status(400).json({ Message: "Email not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ Message: "Invalid password" });
    }
    const tokens = GenerateTokens(user);
    res.cookie("token", tokens, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    const RoleName = user.roleRef.name;
    return res.status(200).json({
      message: "Login successfully",
      role: RoleName,
      username : user.username
    });
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
async function HandleForgotPasswordEmailSendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ Message: "All fields required" });
    }
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(404).json({ Message: "User not found" });
    }
    const otp = GenerateOtp();
    const otpHash = await bcrypt.hash(otp.toString(), 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.findOneAndUpdate(
      { email },
      {
        otpHash,
        expiresAt: otpExpiry,
      },
      { upsert: true }
    );
    const text = `Your OTP for changing password is ${otp}. Dont share this OTP with anyone. if you didnt send any OTP please ignore this message`;
    await sendOtp(email, otp, text);
    return res.status(200).json({ Message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ Message: "Server error" });
  }
}

async function HandleResendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      console.log("Email not found");
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
    const text = `Your OTP for after resending is ${otp}.`;
    await sendOtp(email, otp, text);
    return res.status(200).json({
      Status: "OTP sent successfully",
    });
  } catch (error) {
    console.log("Resend OTP error :", error);
    return res.status(500).json({
      Status: "SERVER ERROR",
      err: error.message,
    });
  }
}
async function GetAllProductsPublic(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    const [products, total] = await Promise.all([
      PRODUCT.find(filter)
        .populate("categoryRef", "name slug")
        .select(
          "name description images minPrice maxPrice categoryRef variants"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PRODUCT.countDocuments(filter),
    ]);

    // Remove sensitive variant fields
    const sanitizedProducts = products.map((product) => ({
      ...product,
      variants: product.variants
        .filter((v) => v.isActive)
        .map((v) => ({
          label: v.label,
          price: v.price,
          imageUrl: v.imageUrl,
          inStock: v.stock > 0, // boolean only
        })),
    }));

    return res.status(200).json({
      message: "Products fetched successfully",
      pagination: {
        page,
        limit,
        totalProducts: total,
        totalPages: Math.ceil(total / limit),
      },
      products: sanitizedProducts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
async function GetMyDetail(req, res) {
  const user = req.user;

  return res.status(200).json({
    message: "Here is your detail",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.roleRef.name,
      permissions: user.roleRef.permissions.map((p) => p.name),
    },
  });
}
async function Logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  return res.status(200).json({message : "Logout successfullya"})
}

module.exports = {
  HandleSignupPage,
  HandleLoginPage,
  HandleChangePassword,
  VerifyOtp,
  HandleResendOtp,
  GetOtpForChangingPassword,
  HandleForgotPasswordEmailSendOtp,
  GetAllProductsPublic,
  GetMyDetail,
  Logout
};
