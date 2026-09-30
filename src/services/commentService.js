const axios = require("axios");

// 🔹 Load from centralized config
const { COMMENT_SERVICE_URL } = require("../config/services");

/**
 * ==================================================
 * 💬 Forward ALL /comments requests to comment-service
 * ==================================================
 */
async function forwardCommentRequest(req) {
  const url = `${COMMENT_SERVICE_URL}${req.originalUrl}`;

  // 🔥 Clone headers and remove hop-by-hop headers
  const headers = { ...req.headers };
  delete headers["content-length"];
  delete headers["host"];
  delete headers["connection"];

  return axios({
    method: req.method,
    url,
    data: req.body,
    headers,
    validateStatus: () => true, // 🔑 let gateway handle status
  });
}

module.exports = {
  forwardCommentRequest,
};
