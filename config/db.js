const mongoose = require("mongoose")

const connect = async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/task-management")
    console.log("database is connected")
}

module.exports = connect