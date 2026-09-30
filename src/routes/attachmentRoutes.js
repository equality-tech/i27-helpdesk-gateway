const express = require("express");
const router = express.Router();
const axios = require("axios");

// 🔹 Load service URLs from centralized config
const {
  ATTACHMENT_SERVICE_URL
} = require("../config/services");

/**
 * ======================================
 * 📎 POST /attachments
 * Stream upload → attachment-service
 * ======================================
 */
router.post("/", async (req, res) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${ATTACHMENT_SERVICE_URL}/attachments`,
      headers: {
        ...req.headers,
        host: undefined, // prevent host mismatch
      },
      data: req, // stream request directly
      responseType: "stream",
      maxBodyLength: Infinity,
      validateStatus: () => true,
    });

    res.status(response.status);

    // Forward headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Pipe stream response
    response.data.pipe(res);

  } catch (err) {
    console.error("❌ Attachment upload gateway error:", err.message);
    res.status(502).json({ error: "Attachment upload failed" });
  }
});

/**
 * ======================================
 * 📎 GET /attachments/:id
 * Stream download → attachment-service
 * ======================================
 */
router.get("/:id", async (req, res) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${ATTACHMENT_SERVICE_URL}/attachments/${req.params.id}`,
      headers: {
        ...req.headers,
        host: undefined,
      },
      responseType: "stream",
      validateStatus: () => true,
    });

    res.status(response.status);

    // Forward headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Pipe stream response
    response.data.pipe(res);

  } catch (err) {
    console.error("❌ Attachment download gateway error:", err.message);
    res.status(502).json({ error: "Attachment download failed" });
  }
});

module.exports = router;
