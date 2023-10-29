const express = require("express");
const router = express.Router();
const gmailController = require("../controllers/gmailController");

router.get('/readEmails', gmailController.readEmails);
router.get('/searchEmailsAndcreateEvent', gmailController.searchEmailsAndcreateEvent);

module.exports = router;