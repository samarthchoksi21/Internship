function checkAuth(permission){
  return function(req,res,next){
    if(!req.user || !req.user.roleRef){
      return res.status(400).json({message : "Access denied"})
    }
    const permissions = req.user.roleRef.permissions.map(p=>p.name)
    if(!permissions.includes(permission)){
      return res.status(400).json({message : "You are unauthorized to use this"})
    }
    next()
  }
}
module.exports = {checkAuth}