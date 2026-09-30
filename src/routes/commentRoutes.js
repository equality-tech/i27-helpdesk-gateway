const express = require("express");
const router = express.Router();
const { forwardCommentRequest } = require("../services/commentService");

// POST /comments
router.post("/comments", async (req, res) => {
  try {
    const response = await forwardCommentRequest(req);
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ error: "Comment service unreachable" });
    }
  }
});

// GET /comments/:ticketId
router.get("/comments/:ticketId", async (req, res) => {
  try {
    const response = await forwardCommentRequest(req);
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ error: "Comment service unreachable" });
    }
  }
});

module.exports = router;
