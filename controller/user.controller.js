const task = require("../modal/task.modal")
const user = require("../modal/user.modal")
const jwt = require("jsonwebtoken")
const signupui = (req, res) => {
    res.render("signup")
}

const create = async (req, res) => {
    let { username, email, password, role } = req.body
    let users = await user.findOne({ email: email })

    if (users) {
        res.redirect("login")
    }
    else {
        let data = await user.create(req.body)
        res.cookie("id", data.id)
        res.cookie("role", data.role).redirect("login")
    }
}

const loginui = (req, res) => {
    res.render("login")
}

const login = async (req, res) => {
    const { email, password } = req.body;

    const users = await user.findOne({ email: email });

    if (!users) {
        return res.send("user not found");
    } else if (users.password !== password) {
        return res.send("password not match");
    } else {
        let token = jwt.sign({ id: users._id }, "token");
        res.cookie("token", token).cookie("id", users._id).cookie("role", users.role);
        if(users.role=="admin"){
            res.redirect("/user/admin")
        }
        else{
            res.redirect("/user/user")
        }

    }
};

const userui = (req, res) => {
    res.render("user")
}

const adminui = (req , res)=>{
    res.render("admin")
}


const adminupdate = async(req , res) =>{
    let {title , content , category , _id} = req.body
    
    let data = await task.findByIdAndUpdate(_id , req.body)
    res.redirect("/user/admin")
}

module.exports = {
    signupui,
    loginui,
    create,
    userui,
    adminui,
    login,
    adminupdate
}