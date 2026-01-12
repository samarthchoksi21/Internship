const mongoose = require("mongoose");
const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PRODUCT",
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  variantLabel: {
    type: String,
    required: true
  },
  priceAtPurchase: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true
    },

    items: {
      type: [OrderItemSchema],
      required: true
    },

    subtotal: {
      type: Number,
      required: true
    },

    discount: {
      type: Number,
      default: 0
    },

    finalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "placed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid"
    }
  },
  { timestamps: true }
);

const ORDER = mongoose.model("ORDER", OrderSchema);
module.exports = { ORDER };
