// ✅ Auto-load .env for local laptop runs (does nothing in Docker/K8s unless file exists)
const fs = require("fs");
const path = require("path");

// Priority order:
// 1) .env.gateway.local (if you want gateway-specific naming)
// 2) .env.local (standard)
// 3) .env.<APP_ENV> (dev/stage/prod)
const env = process.env.APP_ENV || "local";
const candidates = [
  path.join(process.cwd(), ".env.gateway.local"),
  path.join(process.cwd(), ".env.local"),
  path.join(process.cwd(), `.env.${env}`),
];

for (const file of candidates) {
  if (fs.existsSync(file)) {
    require("dotenv").config({ path: file });
    console.log(`✅ Loaded environment from ${path.basename(file)}`);
    break;
  }
}

const express = require("express");
const app = express();
const cors = require("cors");
const authenticate = require("./middlewares/authMiddleware");

// 🚫 DO NOT parse JSON for attachments
app.use((req, res, next) => {
  if (req.path.startsWith("/attachments")) {
    return next();
  }
  express.json()(req, res, next);
});

// 🔹 Health
app.get("/healthz", (req, res) => res.json({ status: "UP" }));
app.get("/readyz", (req, res) => res.json({ status: "READY" }));

// 🔹 CORS (support single or multiple origins comma-separated)
const uiOriginRaw = process.env.UI_ORIGIN;
const uiOrigins =
  uiOriginRaw === "*"
    ? "*"
    : uiOriginRaw.split(",").map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: uiOrigins,
    credentials: true,
  })
);

// 🔹 PUBLIC ROUTES (NO AUTH)
app.use("/auth", require("./routes/authRoutes"));
app.use("/attachments", require("./routes/attachmentRoutes"));

// 🔐 AUTH MIDDLEWARE (GLOBAL)
app.use((req, res, next) => {
  if (
    req.path.startsWith("/auth") ||
    req.path.startsWith("/healthz") ||
    req.path.startsWith("/readyz") ||
    req.path.startsWith("/attachments")
  ) {
    return next();
  }

  authenticate(req, res, next);
});

// 🔹 PROTECTED ROUTES
app.use("/", require("./routes/ticketRoutes"));
app.use("/", require("./routes/commentRoutes"));

// 🚪 START
const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
});