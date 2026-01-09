const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const app = express()
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:5500",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials : true
}));
app.options("/", cors());
const {VerifyUser} = require('./service/auth')
const AdminRoute = require('./Router/admin')
const UserRoute = require('./Router/user')
const {MongoConnection} = require('./connection')
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(path.join(__dirname,"uploads")))
require('./Models/permission')
require('./Models/roles')
require('./Models/user')
require('./Models/category')
require('./Models/products')
app.use('/admin',VerifyUser,AdminRoute)
app.use('/',UserRoute)
MongoConnection()
app.listen(3000,()=>{
    console.log("SERVER STARTED..!!")
})
