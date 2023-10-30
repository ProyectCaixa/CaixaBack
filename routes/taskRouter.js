const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post('/create', taskController.createTask);
router.get('/priority/:priority', taskController.getTasksByPriority);
router.get('/completed', taskController.getTasksCompleted);
router.patch('/complete/:taskId', taskController.completeTask);

module.exports = router;