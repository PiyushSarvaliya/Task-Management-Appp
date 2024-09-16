const {Router} =  require("express")
const { signupui, loginui, create, userui, adminui, login, alltask, adminupdate } = require("../controller/user.controller")
const { authorize, Auth } = require("../middleware/auth")
const userrouter = Router()

userrouter.get("/signup" , signupui)
userrouter.post("/create" , create)
userrouter.get("/login" , loginui)
userrouter.post("/login" , login)
userrouter.get("/user",userui)
userrouter.get("/admin" ,authorize , Auth ,adminui)
userrouter.post("/adminupdate" , adminupdate)


module.exports = userrouter
