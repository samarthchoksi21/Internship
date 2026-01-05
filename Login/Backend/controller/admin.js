const {USER} = require('../Models/user')
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

module.exports = {
    ViewAllUser
}