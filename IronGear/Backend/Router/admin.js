const express = require("express");
const {PRODUCT} = require('../Models/products')
const Router = express.Router();
const {
  ViewAllUser,
  CreateUser,
  DeleteUser,
  UpdateUser,
  ChangeRole,
  CreateCategory,
  GetAllCategories,
  DeleteCategory,
  CreateProduct,
  GetAllProducts,
  GetUserById,
  EditProduct,
  DeleteProduct,
  createCoupon,
  getAllOrders,
  getAllCoupons
} = require("../controller/admin");

const { checkAuth } = require("../middlewares/auth");
Router.get("/allusers", checkAuth("user:view"), ViewAllUser);
Router.get('/user/:id',checkAuth("user:view"),GetUserById);
Router.post("/createUser", checkAuth("user:create"), CreateUser);
Router.delete("/user/:id", checkAuth("user:delete"), DeleteUser);
Router.post('/updateuser/:id',checkAuth("user:update"),UpdateUser)
Router.post("/changerole/:id", checkAuth("user:change_role"), ChangeRole);
Router.post("/createCategory", checkAuth("category:create"), CreateCategory);
Router.get("/getAllcategories", checkAuth("category:view"), GetAllCategories);
Router.delete('/category/:id',checkAuth("category:delete"),DeleteCategory)
Router.post('/product',checkAuth("product:create"),CreateProduct)
Router.get('/product',checkAuth("product:view"),GetAllProducts)
Router.post('/product/:productId',checkAuth("product:update"),EditProduct)
Router.delete('/product/:id',checkAuth("product:delete"),DeleteProduct)
Router.get('/product/:productId', checkAuth("product:view"), async (req, res) => {
    const product = await PRODUCT.findById(req.params.productId).populate('categoryRef');
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
});
Router.post('/coupons',checkAuth("coupon:create"),createCoupon)
Router.get('/getAllorders',checkAuth("order:update_status"),getAllOrders)
Router.get('/getAllcoupons',checkAuth("coupon:view"),getAllCoupons)
module.exports = Router;
