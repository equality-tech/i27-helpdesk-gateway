const axios = require("axios");

// 🔹 Load AUTH service URL from centralized config
const { AUTH_SERVICE_URL } = require("../config/services");

/**
 * ==================================================
 * 🔐 Forward ALL /auth/* requests to auth-service
 * ==================================================
 */
async function forwardAuthRequest(req) {
  const url = `${AUTH_SERVICE_URL}${req.originalUrl}`;

  return axios({
    method: req.method,
    url,
    data: req.body,
    headers: {
      ...req.headers,
      host: undefined, // prevent host mismatch
    },
    validateStatus: () => true, // let gateway handle status
  });
}

module.exports = {
  forwardAuthRequest,
};
