const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");

router.get('/today', calendarController.todayEvents);
router.post('/create', calendarController.createEvent);

module.exports = router;