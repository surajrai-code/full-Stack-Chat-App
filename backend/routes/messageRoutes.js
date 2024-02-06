const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/messageController");

router.get("/:userId", MessageController.fetchMessages);
router.post("/", MessageController.sendMessage);

module.exports = router;
