const jwt = require('jsonwebtoken')
const {USER} = require('../Models/user')

function GenerateTokens(user){
    const payload = {
        _id : user._id,
        email : user.email,
        role : user.roleRef
    }
    const token = jwt.sign(payload , process.env.JWT_SECRETKEY,{expiresIn : '1d'})
    return token
}
async function VerifyUser(req,res,next){
    const token = req.cookies?.token
    if(!token){
        return res.status(400).json({message : "Not authanticated"})
    }
    const decode = jwt.verify(token , process.env.JWT_SECRETKEY);
    const user = await USER.findById(decode._id).populate({
        path : 'roleRef',
        populate : {path : 'permissions'}
    })
    if(!user){
        return res.status(400).json({message : "User not found"})
    }
    req.user = user
    next()
}
module.exports = {GenerateTokens,VerifyUser}  