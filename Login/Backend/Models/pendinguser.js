const mongoose = require('mongoose')
const pendinguserschema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,  
    expires: 600,
  },
});
const PENDINGUSER = mongoose.model("PENDINGUSER",pendinguserschema)
module.exports = {PENDINGUSER}