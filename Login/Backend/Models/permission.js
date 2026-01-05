const mongoose = require('mongoose')
const PermissionSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    }
})
const PERMISSION = mongoose.model("PERMISSION",PermissionSchema)

module.exports = {PERMISSION}