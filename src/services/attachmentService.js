const axios = require("axios");

// 🔹 Load from centralized config
const { ATTACHMENT_SERVICE_URL } = require("../config/services");

/**
 * ==================================================
 * 📎 Forward ALL /attachments requests
 * ==================================================
 * - Supports streaming uploads & downloads
 * - Gateway-safe
 * - Docker & K8s ready
 */
async function forwardAttachmentRequest(req) {
  const url = `${ATTACHMENT_SERVICE_URL}${req.originalUrl}`;

  // 🔥 Clone headers & remove hop-by-hop headers
  const headers = { ...req.headers };
  delete headers["content-length"];
  delete headers["host"];
  delete headers["connection"];

  return axios({
    method: req.method,
    url,
    data: req,
    headers,
    responseType: "stream",     // 🔑 required for file streaming
    maxBodyLength: Infinity,
    validateStatus: () => true, // gateway handles status
  });
}

module.exports = {
  forwardAttachmentRequest,
};
