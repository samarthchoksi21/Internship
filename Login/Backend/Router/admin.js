const express = require('express')
const Router = express.Router()
const {ViewAllUser} = require('../controller/admin')
const {VerifyUser} = require('../service/auth')
const {checkAuth} = require('../middlewares/auth');
Router.get('/allusers',VerifyUser,checkAuth("user:view"),ViewAllUser)
module.exports = Router;