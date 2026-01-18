const mongoose = require('mongoose')
require('dotenv').config()
function MongoConnection() {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("MONGODB CONNECTED..!!")
    })

}
module.exports = {MongoConnection}
