const { default: mongoose } = require("mongoose")
const moongose = require("mongoose")

const taskschema = new moongose.Schema({
    title: String,
    content: String,
    category: String,
    duedate: { type: Date },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
    }]
}, { timestamps: true })

const task = moongose.model("taskdata", taskschema)

module.exports = task