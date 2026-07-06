const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getStats,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/stats/summary", getStats);
router.route("/").post(createTask).get(getTasks);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);
router.post("/:id/comments", addComment);

module.exports = router;