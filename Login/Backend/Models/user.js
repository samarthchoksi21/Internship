const mongoose = require('mongoose')
const userschema = new mongoose.Schema({
    username :{
        type : String,
    },
    email : {
        type : String,
        require : true,
    },
    password : {
        type : String,
        require : true
    },
    isVerified :{
        type : Boolean,
        default : false
    }
    
},{timestamps : true})


const USER = mongoose.model("USER",userschema)

module.exports={
    USER
}