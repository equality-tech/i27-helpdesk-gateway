const jwt = require("jsonwebtoken");

const JWT_SECRET = "i27academy-secret-key-which-is-32chars";

//const JWT_SECRET = process.env.JWT_SECRET || "i27academy-secret-key-which-is-32chars";

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ JWT decoded in gateway", decoded);

    req.user = decoded;

    // ✅ Inject user context safely
    if (decoded.userId) {
      req.headers["x-user-id"] = decoded.userId;
    }

    if (decoded.email) {
      req.headers["x-user-email"] = decoded.email;
    }

    // 🔥 FIX: roles is an ARRAY
    if (decoded.roles && decoded.roles.length > 0) {
      req.headers["x-user-role"] = decoded.roles[0]; // ADMIN / AGENT / USER
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authenticate;
