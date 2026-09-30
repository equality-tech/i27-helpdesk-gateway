function required(name) {
  if (!process.env[name]) {
    throw new Error(`❌ Missing required env var: ${name}`);
  }
  return process.env[name];
}

module.exports = {
  AUTH_SERVICE_URL: required("AUTH_SERVICE_URL"),
  TICKET_SERVICE_URL: required("TICKET_SERVICE_URL"),
  COMMENT_SERVICE_URL: required("COMMENT_SERVICE_URL"),
  ATTACHMENT_SERVICE_URL: required("ATTACHMENT_SERVICE_URL"),
};
