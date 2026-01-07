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
async function CreateCategory(req, res) {
  try {
    const { name, description, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    } 
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

 
    const existing = await CATEGORY.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }
    let parentRef = null;
    if (parentId) {
      const parentCategory = await CATEGORY.findById(parentId);
      if (!parentCategory || !parentCategory.isActive) {
        return res.status(400).json({
          message: "Parent category does not exist or is inactive",
        });
      }
      parentRef = parentId;
    }
    const category = await CATEGORY.create({
      name,
      slug,
      description,
      parentRef,
    });
    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
async function GetAllCategories(req, res) {
  try {
    const categories = await CATEGORY.find({ isActive: true })
      .select("name slug parentRef description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function CreateProduct(req, res) {
  try {
    const { name, description, categoryId, variants, images } = req.body;

   
    if (!name || !categoryId || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        message: "name, categoryId and at least one variant are required",
      });
    }


    const category = await CATEGORY.findById(categoryId);
    if (!category || !category.isActive) {
      return res.status(400).json({
        message: "Category does not exist or is inactive",
      });
    }

    const skuSet = new Set();
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const v of variants) {
      if (
        !v.sku ||
        !v.label ||
        typeof v.price !== "number" ||
        typeof v.stock !== "number"
      ) {
        return res.status(400).json({
          message: "Each variant must have sku, label, valid price and stock",
        });
      }

      if (skuSet.has(v.sku)) {
        return res.status(400).json({
          message: `Duplicate SKU found: ${v.sku}`,
        });
      }

      skuSet.add(v.sku);

      minPrice = Math.min(minPrice, v.price);
      maxPrice = Math.max(maxPrice, v.price);
    }

   
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    const existingProduct = await PRODUCT.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({
        message: "Product with similar name already exists",
      });
    }
    const product = await PRODUCT.create({
      name : name,
      slug : slug,
      descrition : description,
      images : images,
      categoryRef : categoryId,
      variants : variants,
      minPrice : minPrice,
      maxPrice : maxPrice,
      createdBy : req.user_id
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function GetAllProducts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      PRODUCT.find({ isActive: true })
        .populate("categoryRef", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PRODUCT.countDocuments({ isActive: true }),
    ]);

    return res.status(200).json({
      message: "Products fetched successfully",
      pagination: {
        page,
        limit,
        totalProducts: total,
        totalPages: Math.ceil(total / limit),
      },
      products,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  ViewAllUser,
  CreateUser,
  DeleteUser,
  ChangeRole,
  CreateCategory,
  GetAllCategories,
  CreateProduct,
  GetAllProducts
};
