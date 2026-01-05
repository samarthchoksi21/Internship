const express = require('express')
const Router = express.Router()
const {ViewAllUser,CreateUser} = require('../controller/admin')
const {VerifyUser} = require('../service/auth')
const {checkAuth} = require('../middlewares/auth');
Router.get('/allusers',VerifyUser,checkAuth("user:view"),ViewAllUser)
Router.post('/createUser',VerifyUser,checkAuth("user:create"),CreateUser)
module.exports = Router;