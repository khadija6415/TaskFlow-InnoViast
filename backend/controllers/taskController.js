const Task = require("../models/Task");

// @desc   Create a new task
// @route  POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, priority, labels, deadline, assignedTo, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      labels,
      deadline,
      assignedTo,
      status: status || "todo",
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email avatarColor")
      .populate("createdBy", "name email avatarColor");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get all tasks (with optional filters)
// @route  GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, priority, label, assignedTo, search } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (label) filter.labels = label;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: "i" };

    // Members only see tasks assigned to them or created by them
    if (req.user.role !== "admin") {
      filter.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email avatarColor")
      .populate("createdBy", "name email avatarColor")
      .populate("comments.author", "name avatarColor")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get single task by ID
// @route  GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email avatarColor")
      .populate("createdBy", "name email avatarColor")
      .populate("comments.author", "name avatarColor");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Update task (title, description, priority, labels, deadline, assignedTo, status)
// @route  PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const fields = ["title", "description", "priority", "labels", "deadline", "assignedTo", "status"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email avatarColor")
      .populate("createdBy", "name email avatarColor")
      .populate("comments.author", "name avatarColor");

    res.status(200).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Delete task
// @route  DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Add comment to a task
// @route  POST /api/tasks/:id/comments
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.comments.push({ text, author: req.user._id });
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email avatarColor")
      .populate("createdBy", "name email avatarColor")
      .populate("comments.author", "name avatarColor");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get dashboard stats
// @route  GET /api/tasks/stats/summary
const getStats = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== "admin") {
      filter.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    const allTasks = await Task.find(filter);

    const stats = {
      total: allTasks.length,
      todo: allTasks.filter((t) => t.status === "todo").length,
      inProgress: allTasks.filter((t) => t.status === "in-progress").length,
      review: allTasks.filter((t) => t.status === "review").length,
      done: allTasks.filter((t) => t.status === "done").length,
      highPriority: allTasks.filter((t) => t.priority === "high").length,
      overdue: allTasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "done").length,
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getStats,
};