const express = require("express")
const connect = require("./config/db")
const userrouter = require("./routes/user.route")
const app = express()
app.use(express.urlencoded({ limit: '10mb', extended: true }))
const cookie = require("cookie-parser")
const taskroute = require("./routes/task.route")

const http = require("http")
const socketio = require("socket.io")

const server = http.createServer(app);
const io = socketio(server);

// Middleware to use socket.io in requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

require("dotenv").config()
app.use(express.json({ limit: '10mb' }))
app.set("view engine", "ejs")
app.set("views", __dirname + "/view")
app.use(cookie())
app.use("/user", userrouter)
app.use("/task", taskroute)

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use("/", (req, res) => {
    res.redirect("/user/signup")
})
app.listen(process.env.PORT, () => {
    connect()
    console.log(`port is start ${process.env.PORT}`)
})