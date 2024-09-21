const task = require("../modal/task.modal")
const review = require("../modal/comments.modal")
const user = require("../modal/user.modal")
const fs = require("fs")
const path = require("path")
const csvParser = require("csv-parser")
const {Parser} = require("json2csv")
const multer = require("multer")


const taskui = (req, res) => {
    res.render("addtask")
}

const createtask = async (req, res) => {

    try {
        const { title, content, category, duedate , status , priority } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({ message: "Task title cannot be empty." });
        }

        const existingTask = await task.findOne({ title });
        if (existingTask) {
            return res.status(400).json({ message: "Task with this title already exists." });
        }

        const currentDate = new Date();
        const taskDueDate = new Date(duedate);
        if (taskDueDate < currentDate) {
            return res.status(400).json({ message: "Due date cannot be in the past." });
        }

        const taskData = {
            title,
            content,
            category,
            dueDate: taskDueDate,
            status,
            priority
        };

        const newTask = await task.create(taskData);
        req.io.emit("taskcreated", newTask);
        res.redirect("/task/addtask");

    } catch (error) {
        res.status(500).json({ message: "Error creating task", error });
    }
}

const tasks1 = async (req, res) => {
    let tasks = await task.find({ userID: req.body.userID })
    res.send(tasks)

}

const taskdelete = async (req, res) => {
    let { id } = req.params
    let data = await task.findByIdAndDelete(id)
    req.io.emit("taskdelete", { id })
    console.log(id)
    res.redirect("/user/user")
}

const taskupdate = async (req, res) => {
    let { title, content, category, _id } = req.body

    let data = await task.findByIdAndUpdate(_id, req.body)
    req.io.emit("taskupdate", data)
    res.redirect("/user/user")
}


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

const alltask = async (req, res) => {
    let data = await task.find().populate("userID")
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


const homeui = (req, res) => {
    res.render("home")
}

const singletask = async (req, res) => {
    let { id } = req.params

    let singleTask = await task.findById(id).populate({ path: "reviews", populate: { path: "author" } })
    res.render("singletask", { singleTask })
}


const getTasksWithPagination = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const tasks = await task.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await task.countDocuments();

        res.json({
            tasks,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tasks' });
    } i
};

const getTasks = async (req, res) => {
    const { page = 1, limit = 10, status, priority, assignedTo, dueDateSort } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    console.log(query)

    const sortOptions = dueDateSort ? { duedate: dueDateSort === 'asc' ? 1 : -1 } : {};

    try {
        const tasks = await task.find(query)
            .populate("userID", "assignedTo")
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        console.log(query)
        console.log(tasks)

        const totalTasks = await task.countDocuments(query);
        console.log(totalTasks)
        res.json({
            tasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};


const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== "text/csv") {
        return cb(new Error("Only CSV files are allowed!"), false);
      }
      cb(null, true);
    },
  });

  // Export tasks to CSV
const exportTasksToCSV = async (req, res) => {
    try {
      const tasks = await task.find().populate("assignedTo");
  
      const fields = ["title", "des", "category", "duedate", "assignedTo.username"];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(tasks);
  
      res.header("Content-Type", "text/csv");
      res.attachment("tasks.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error exporting tasks to CSV:", error);
      res.status(500).send("Error exporting tasks to CSV");
    }
  };


  // Import tasks from CSV
const importTasksFromCSV = async (req, res) => {
    try {
      const tasks = [];
      const users = await user.find();
  
      // Read CSV file
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (row) => {
          // Validate the task data format
          if (!row.title || !row.content || !row.duedate || !row.assignedTo) {
            throw new Error("Missing required fields in CSV row");
          }
  
          // Validate assigned user exists
          const assignedUser = users.find((user) => user.name === row.assignedTo);
          if (!assignedUser) {
            throw new Error(`Assigned user ${row.assignedTo} not found`);
          }
  
          // Push the valid task data into the array
          tasks.push({
            title: row.title,
            content: row.content,
            category: row.category || "General",
            duedate: new Date(row.duedate)
          });
        })
        .on("end", async () => {
          // Insert the valid tasks in bulk
          await task.insertMany(tasks);
  
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
  
          res.status(200).send("Tasks imported successfully");
        });
    } catch (error) {
      console.error("Error importing tasks from CSV:", error);
      res.status(500).send("Error importing tasks from CSV");
    }
  };


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
    singletask,
    getTasksWithPagination,
    getTasks,
    upload,
    exportTasksToCSV,
    importTasksFromCSV
}