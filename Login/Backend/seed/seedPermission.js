const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const {PERMISSION} = require('../Models/permission')
async function seedPermissions() {
  try {
    mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("MONGO CONNECTED");
    });
    const permissions = [
    
      "user:view",
      "user:create",
      "user:update",
      "user:delete",
      "user:change_role",
      "product:view",
      "product:create",
      "product:update",
      "product:delete",
      "product:manage_inventory",
      "order:view",
      "order:update_status",
      "order:cancel",
      "order:refund",
      "order:manage_returns",
      "order:generate_invoice",
      "category:view",
      "category:create",
      "category:update",
      "category:delete",
      "coupon:view",
      "coupon:create",
      "coupon:update",
      "coupon:delete",
      "coupon:disable",
      "dashboard:view",
      "analytics:view",
      "role:manage",
      "permission:manage",
    ];
    for(const permission of permissions){
        const exist = await PERMISSION.findOne({name : permission})
        if(!exist){
            await PERMISSION.create({name : permission})
        }
        console.log("PERMISSION SEEDED")
    }


  } catch (error) {
    console.log(` ERROR : ${error}`)
  }finally{
    mongoose.disconnect()
    process.exit(0)
  }
}
seedPermissions()
