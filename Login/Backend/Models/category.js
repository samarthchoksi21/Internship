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
    slug : {
        type : String,
        required : true,
        unique : true,
        index : true
    },
    parentRef : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "CATEGORY",
        default : null
    },
    isActive : {
        type : Boolean,
        default : true
    }
},{timestamps : true})

const CATEGORY = mongoose.model("CATEGORY",CategorySchema)

module.exports = {CATEGORY}