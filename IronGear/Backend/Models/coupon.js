const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["percentage", "flat"],
      required: true
    },

    value: {
      type: Number,
      required: true,
      min: 1
    },

    minOrderValue: {
      type: Number,
      default: 0
    },

    maxDiscount: {
      type: Number
    },

    expiryDate: {
      type: Date,
      required: true
    },

    usageLimit: {
      type: Number,
      default: 0 // 0 = unlimited
    },

    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const COUPON = mongoose.model("COUPON", CouponSchema);
module.exports = {COUPON}
