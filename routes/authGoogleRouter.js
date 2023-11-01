const express = require("express");
const router = express.Router();
const authGoogleController = require("../controllers/authGoogleController");

router.get('/login', authGoogleController.login);
router.get('/newToken', authGoogleController.newToken);

module.exports = router;