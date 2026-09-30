const axios = require("axios");

// 🔹 Load from centralized config
const { TICKET_SERVICE_URL } = require("../config/services");

/**
 * ==================================================
 * 🎫 Forward ALL /tickets requests to ticket-service
 * ==================================================
 */
async function forwardTicketRequest(req) {
  const url = `${TICKET_SERVICE_URL}${req.originalUrl}`;

  // 🔥 Clone headers & remove hop-by-hop headers
  const headers = { ...req.headers };
  delete headers["content-length"];
  delete headers["host"];
  delete headers["connection"];

  return axios({
    method: req.method,
    url,
    data: req.body,
    headers,
    validateStatus: () => true, // gateway handles status
  });
}

module.exports = {
  forwardTicketRequest,
};
