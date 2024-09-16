const mongoose = require("mongoose")

const connect = async () => {
    await mongoose.connect("mongodb+srv://piyush:piyush@cluster0.mlxbum3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log("database is connected")
}

module.exports = connect