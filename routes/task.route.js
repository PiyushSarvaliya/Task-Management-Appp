const {Router} = require("express")
const { taskui, createtask, tasks1, taskdelete, taskupdate, searchTasks, alltask, homeui, singletask, reviews } = require("../controller/task.controller")
const { Auth, authorize } = require("../middleware/auth")
const taskroute = Router()


taskroute.get("/addtask" , taskui)
taskroute.post("/createtask" , Auth , createtask)
taskroute.get("/tasks" , Auth , tasks1)
taskroute.delete("/deletetask/:id" , taskdelete)
taskroute.post("/taskupdate" , taskupdate)
taskroute.get("/searchTasks" , searchTasks)
taskroute.get("/alltask",authorize,Auth,alltask)
taskroute.post("/:id/comment" , Auth ,  reviews)            
taskroute.get("/home"  ,homeui)
taskroute.get("/singleTask/:id"  ,singletask)

module.exports = taskroute