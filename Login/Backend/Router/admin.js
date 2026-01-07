const express = require("express");
const Router = express.Router();
const {
  ViewAllUser,
  CreateUser,
  DeleteUser,
  ChangeRole,
  CreateCategory,
  GetAllCategories,
  CreateProduct,
  GetAllProducts,
  GetUserById
} = require("../controller/admin");

const { checkAuth } = require("../middlewares/auth");
Router.get("/allusers", checkAuth("user:view"), ViewAllUser);
Router.get('/user/:id',checkAuth("user:view"),GetUserById)
Router.post("/createUser", checkAuth("user:create"), CreateUser);
Router.delete("/user/:id", checkAuth("user:delete"), DeleteUser);
Router.post("/changerole/:id", checkAuth("user:change_role"), ChangeRole);
Router.post("/createCategory", checkAuth("category:create"), CreateCategory);
Router.get("/getAllcategories", checkAuth("category:view"), GetAllCategories);
Router.post('/product',checkAuth("product:create"),CreateProduct)
Router.get('/product',checkAuth("product:view"),GetAllProducts)
module.exports = Router;
