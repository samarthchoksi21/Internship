const express = require('express')
const Router = express.Router()
const {ViewAllUser,CreateUser,DeleteUser,ChangeRole} = require('../controller/admin')

const {checkAuth} = require('../middlewares/auth');
Router.get('/allusers',checkAuth("user:view"),ViewAllUser)
Router.post('/createUser',checkAuth("user:create"),CreateUser)
Router.delete('/user/:id',checkAuth("user:delete"),DeleteUser)
Router.post('/changerole/:id',checkAuth("user:change_role"),ChangeRole)
module.exports = Router;