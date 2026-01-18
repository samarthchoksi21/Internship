const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    imageUrl: {
      type: String,
    },
    sku : {
      type : String,
      required : true,
      trim : true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CATEGORY",
      required: true,
    },

    variants: {
      type: [VariantSchema],
      validate: [
        v => v.length > 0,
        "Product must have at least one variant",
      ],
    },
    slug : {
      type : String,
      required : true,
      unique : true,
      index : true
    },
    images : [
      {
        type : String
      }
    ],
    minPrice : {
      type : Number,
      required : true,
      min : 0
    },
    maxPrice : {
      type : Number,
      required : true,
      min : 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PRODUCT = mongoose.model("PRODUCT", ProductSchema);
module.exports = {PRODUCT}
