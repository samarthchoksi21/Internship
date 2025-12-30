const mongoose = require('mongoose')
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
}, { timestamps: true });
const OTP = mongoose.model("OTP",otpSchema)
module.exports = {OTP}