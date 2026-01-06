const { USER } = require("../Models/user");
const { ROLE } = require("../Models/roles");
const bcrypt = require("bcrypt");
async function ViewAllUser(req, res) {
  try {
    const users = await USER
      .find({}, { password: 0, __v: 0 })
      .populate("roleRef", "name"); 

    return res.status(200).json({
      count: users.length,
      users,
    });

  } catch (error) {
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
      error: error.message,
    });
  }
}

async function CreateUser(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please enter credentials" });
  }
  const user = await USER.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "The user already exist" });
  }

  const hashedpassword = await bcrypt.hash(password, 10);
  const userRole = await ROLE.findOne({ name: "USER" });
  await USER.create({
    username,
    email,
    password: hashedpassword,
    roleRef: userRole._id,
  });

  return res.status(200).json({ message: "User created successfully" });
}
async function DeleteUser(req, res) {
  try {
    const { id } = req.params;
    if (req.user._id.equals(id)) {
      return res.status(400).json({
        message: "Admin cannot delete itself",
      });
    }
    const user = await USER.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "User deleted successfully",
      deletedUser: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
async function ChangeRole(req, res) {
  try {
    const { id } = req.params;
    const {roleName} = req.body;

    if (req.user._id.equals(id)) {
      return res.status(400).json({
        message: "Admin cannot delete itself",
      });
    }
 

    const role = await ROLE.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ message: "Invalid Role" });
    }
   
    const user = await USER.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }


    user.roleRef = role._id;
    await user.save();

    return res.status(200).json({
      message: "ROLE changed SUCESSFULLY",
      userid: id,
      NewRole: role.name,
    });
  } catch (error) {
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
}

module.exports = {
  ViewAllUser,
  CreateUser,
  DeleteUser,
  ChangeRole,
};
