const path = require('path');
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const { ROLE } = require("../Models/roles");
async function seedRoles(){
    try {
        await mongoose.connect(process.env.MONGO_URI).then(()=>{
            console.log("CONNECTION STARTED")
        })

        const roles = ["ADMIN", "MANAGER" , "USER"]

        for(const Rolename of roles){
            const exist = await ROLE.findOne({name : Rolename})
            if(!exist){
                await ROLE.create({name : Rolename})
                console.log(`Roles ${Rolename} created successfully`)
            }
        }
    } catch (error) {
        console.log("ERROR :",error)
    }finally{
        await mongoose.disconnect()
        console.log("MONGODB DISCONNECTED")
        process.exit(0)
    }
}
seedRoles()
