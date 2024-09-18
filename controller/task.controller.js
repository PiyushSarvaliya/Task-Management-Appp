const { response } = require("express")
const task = require("../modal/task.modal")
const review = require("../modal/comments.modal")
const user = require("../modal/user.modal")

const taskui = (req , res) =>{
    res.render("addtask")
}

const createtask = async(req , res) =>{
    let {title , content , category} = req.body
    let data = await task.create(req.body)
    req.io.emit("taskcreated" , data)
    res.json(data)
}

const tasks1 = async(req , res) => {
    let tasks = await task.find({userID : req.body.userID})
    res.send(tasks)

}

const taskdelete = async(req , res) =>{
    let{id} = req.params
    let data = await task.findByIdAndDelete(id)
    req.io.emit("taskdelete" , {id})
    console.log(id)
    res.redirect("/user/user")
}

const taskupdate = async(req , res) =>{
    let {title , content , category , _id} = req.body
    
    let data = await task.findByIdAndUpdate(_id , req.body)
    req.io.emit("taskupdate" , data)
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


const reviews = async (req, res) => {

    let listing = await task.findById(req.params.id);
  
    let newReview = new review(req.body.review);
    
    newReview.author = req.body.userID;
    // console.log(newReview);
  
    listing.reviews.push(newReview);
  
    await newReview.save();
    await listing.save();
  
    res.redirect(`/task//singleTask/${req.params.id}`);
    console.log(listing)
  };


const homeui = (req , res) =>{
    res.render("home")
}

const singletask= async (req, res) => {
    let { id } = req.params

    let singleTask = await task.findById(id).populate({path : "reviews" , populate : {path : "author"}})
    res.render("singletask", { singleTask })
}



module.exports = {
    taskui,
    createtask,
    tasks1,
    taskdelete,
    taskupdate,
    searchTasks,
    alltask,
    reviews,
    homeui,
    singletask
}