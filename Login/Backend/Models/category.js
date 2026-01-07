const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    description : {
        type : String
    },
    isActive : {
        type : Boolean,
        default : true
    }
},{timestamps : true})

const CATEGORY = mongoose.model("CATEGORY",CategorySchema)

module.exports = {CATEGORY}