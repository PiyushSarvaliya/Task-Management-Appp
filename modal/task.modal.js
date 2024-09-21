const { default: mongoose } = require("mongoose")
const moongose = require("mongoose")

const taskschema = new moongose.Schema({
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    duedate: {
        type: Date,
    },
    category: {
        type: String,
    },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "userdata" },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
    }],
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        required : true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required : true
    },
}, { timestamps: true })

const task = moongose.model("taskdata", taskschema)

module.exports = task