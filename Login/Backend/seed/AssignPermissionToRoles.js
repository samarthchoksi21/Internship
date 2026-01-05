const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const {ROLE} = require('../Models/roles')
const {PERMISSION} = require('../Models/permission')
/**
 * Define which permissions each role should have
 * Permission names MUST already exist in permissions collection
 */
const ROLE_PERMISSION_MAP = {
  ADMIN: [
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
    "permission:manage"
  ],

  MANAGER: [
    "product:view",
    "product:create",
    "product:update",
    "product:manage_inventory",

    "order:view",
    "order:update_status",

    "category:view",
    "category:create",
    "category:update"
  ],

  USER: [
    "product:view",
    "order:view"
  ]
};

async function assignPermissionsToRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB connected");

    for (const roleName of Object.keys(ROLE_PERMISSION_MAP)) {
      const permissionNames = ROLE_PERMISSION_MAP[roleName];

      const permissionDocs = await PERMISSION.find({
        name: { $in: permissionNames }
      });

      if (permissionDocs.length !== permissionNames.length) {
        console.error(` Permission mismatch for role: ${roleName}`);
        continue;
      }

      const role = await ROLE.findOneAndUpdate(
        { name: roleName },
        { permissions: permissionDocs.map(p => p._id) },
        { new: true }
      );

      if (!role) {
        console.error(` Role not found: ${roleName}`);
      } else {
        console.log(` Permissions assigned to role: ${roleName}`);
      }
    }
  } catch (error) {
    console.error(" Error assigning permissions:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

assignPermissionsToRoles();
