const express = require("express");
const router = express.Router();
const { forwardAuthRequest } = require("../services/authService");

/**
 * Forward ALL /auth/* requests to auth-service
 * Example:
 *  POST /auth/login  → auth-service /auth/login
 */
router.use(async (req, res) => {
  try {
    const response = await forwardAuthRequest(req);
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Auth gateway error:", err?.response?.data || err.message);

    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: "Auth service unreachable" });
    }
  }
});

module.exports = router;
