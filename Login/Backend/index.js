const express = require('express')
const app = express()
const cors = require("cors");
app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

const UserRoute = require('./Router/user')
const {MongoConnection} = require('./connection')
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use('/',UserRoute)
MongoConnection()
app.get('/',(req,res)=>{
    res.send("Hello from server")
    
})

app.listen(3000,()=>{
    console.log("SERVER STARTED..!!")
})
