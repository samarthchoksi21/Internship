const mongoose = require('mongoose')
const userschema = new mongoose.Schema({
    username :{
        type : String,
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    roleRef : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "ROLE",
        required : true
    }
},{timestamps : true})
const USER = mongoose.model("USER",userschema)
module.exports={
    USER
}