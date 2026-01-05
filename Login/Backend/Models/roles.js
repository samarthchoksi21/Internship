const mongoose = require('mongoose')
const Roleschema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    permissions : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "PERMISSION"
    }
})
const ROLE = mongoose.model("ROLE",Roleschema)
module.exports = {ROLE}