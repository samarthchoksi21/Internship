const {USER} = require('../Models/user')
const {ROLE} = require('../Models/roles')
const bcrypt = require('bcrypt')
async function ViewAllUser(req,res){
    const users = await USER.find({},{
        password : 0,
        __v : 0
    })
    if(!users){
        return res.status(400).json({message : "NO USER EXIST"})
    }
    return res.status(200).json({
        count : users.length,
        users
    })

}
async function CreateUser(req,res){
    const {username,email,password} = req.body
    if(!username || !email || !password){
        return res.status(400).json({message : "Please enter credentials"})
    }
    const user = await USER.findOne({email})
    if(user){
        return res.status(400).json({message : "The user already exist"})
    }
    
    const hashedpassword = await bcrypt.hash(password,10)
    const userRole = await ROLE.findOne({name : "USER"})
    await USER.create({
        username,
        email,
        password : hashedpassword,
        roleRef : userRole._id
    })
    
    return res.status(200).json({message : "User created successfully"})
}

module.exports = {
    ViewAllUser,
    CreateUser
}