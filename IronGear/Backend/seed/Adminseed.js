const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const bcrypt = require("bcrypt");
const { USER } = require("../Models/user");
const { ROLE } = require("../Models/roles");
const mongoose = require("mongoose");
async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("MONGODB CONNECTED");
    });
    const adminRole = await ROLE.findOne({ name: "ADMIN" });
    if (adminRole) {
        console.log("ADMIN ROLE DOESNT EXIST")
    }
    console.log("FUNCTION AT MID")
    const existingAdmin = await USER.findOne({
      email: process.env.ADMIN_EMAIL,
    });
    if (existingAdmin) {
        console.log("ADMIN ALREADY EXIST")
    }
    console.log("FUNCTION AT MID 2")
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD,10)
    await USER.create({
      username: "Samarth",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      roleRef: adminRole._id,
    });
    console.log("ADMIN CREATED SUCESSFULLY");
  } catch (error) {
    console.log("ERROR while seeding :",error)
  }finally{
    mongoose.disconnect()
    process.exit(0)
  }
}
seedAdmin()