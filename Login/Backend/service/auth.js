const jwt = require('jsonwebtoken')

function GenerateTokens(user){
    jwt.sign({
        _id : user._id,
        email : user.email,
        role : user.roleRef
    },process.env.JWT_SECRET,{ expiresIn : '30m'})
} 
module.exports = {GenerateTokens}  