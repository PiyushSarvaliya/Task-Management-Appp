const { response } = require("express")
const task = require("../modal/task.modal")

const taskui = (req , res) =>{
    res.render("addtask")
}

const createtask = async(req , res) =>{
    let {title , content , category} = req.body
    let data = await task.create(req.body)
    res.send(data)
}

const tasks1 = async(req , res) => {
    let tasks = await task.find({userID : req.body.userID})
    res.send(tasks)

}

const taskdelete = async(req , res) =>{
    let{id} = req.params
    let data = await task.findByIdAndDelete(id)
    res.redirect("/user/user")
}

const taskupdate = async(req , res) =>{
    let {title , content , category , _id} = req.body
    
    let data = await task.findByIdAndUpdate(_id , req.body)
    res.redirect("/user/user")
}

// SEARCH TASK

const searchTasks = async (req, res) => {
    const { category } = req.query;
    try {
        let data;
        if (category) {
            
            data = await task.find({ category: { $regex: new RegExp(category, "i") } });
        } else {
            data = await task.find(); 
        }
        res.json(data);  
    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks" });
    }
};

const alltask=async(req,res)=>{
    let data=await task.find().populate("userID")
    res.json(data)
}

module.exports = {
    taskui,
    createtask,
    tasks1,
    taskdelete,
    taskupdate,
    searchTasks,
    alltask
}