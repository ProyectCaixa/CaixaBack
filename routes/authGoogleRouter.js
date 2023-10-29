const express = require("express");
const router = express.Router();
const authGoogleController = require("../controllers/authGoogleController");

router.get('/login', authGoogleController.login);

module.exports = router;