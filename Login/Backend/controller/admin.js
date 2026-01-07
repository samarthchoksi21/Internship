const { USER } = require("../Models/user");
const { ROLE } = require("../Models/roles");
const {CATEGORY} = require('../Models/category')
const {PRODUCT} = require('../Models/products')
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
async function CreateCategory(req,res){
  const {name , description} = req.body
  if(!name || !description){
    return res.status(400).json({message : "Please enter all details"})
  }
  const exist = await CATEGORY.findOne({
    name : new RegExp(`^${name}$`,"i")
  })
  if(exist){
    return res.status(400).json({message : "The category already exist"})
  }
  await CATEGORY.create({
    name,
    description
  })
  return res.status(200).json({message : "Category created successfully"})
}
async function GetAllCategories(req,res){
  try {
    const categories = await CATEGORY.find({})
    if(!categories){
      return res.status(400).json({message : "No categories found"})
    }
    return res.status(200).json({
      Counts : categories.length,
      categories
    })
    
  } catch (error) {
    return res.status(500).json({message : "SERVER ERROR"})
  }
}
async function CreateProduct(req,res){
  const {
    name,
    description,
    categoryId,
    variants
  } = req.body
  if(!name || !categoryId || !Array.isArray(variants) || variants.length === 0){
    return res.status(400).json({message : "name , categoryId , at least 1 variant is required"})
  }
  const category = await CATEGORY.findById(categoryId)
  if(!category || !category.isActive){
    return res.status(400).json({message : "Category doesnt exist or it is inactive"})
  }
  for(const v of variants){
    if(
      !v.label || typeof v.price !== "number" || typeof v.stock !== "number"
    ){
      return res.status(400).json({message : "Each variant must have label and valid stock and price"})
    }
  }

  const product = await PRODUCT.create({
    name,
    description,
    categoryRef : categoryId,
    variants,
    createdBy : req.user._id
  })
  return res.status(200).json({
    message : "Product created successfully here is your product",
    product
  })

}
async function GetallProducts(req,res){
  const products = await PRODUCT.find({}).populate("categoryRef" , "name")

  if(!products){
    return res.status(400).json({message : "There are no products available"})
  }
  return res.status(200).json({
    message : "Here are your products",
    products
  })
}
module.exports = {
  ViewAllUser,
  CreateUser,
  DeleteUser,
  ChangeRole,
  CreateCategory,
  GetAllCategories,
  CreateProduct,
  GetallProducts
};
