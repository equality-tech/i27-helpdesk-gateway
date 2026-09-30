const express = require("express");
const proxy = require("express-http-proxy");
const axios = require("axios");

const router = express.Router();

const TICKET_SERVICE = process.env.TICKET_SERVICE_URL;
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;

/**
 * =========================================================
 * 🔐 ADMIN: Get ALL tickets with CREATED-BY NAME enrichment
 * =========================================================
 */
router.get("/tickets", async (req, res) => {
  try {
    // 🔎 DEBUG (keep for now, remove later)
    console.log("ADMIN /tickets headers:", {
      authorization: req.headers["authorization"],
      userId: req.headers["x-user-id"],
      role: req.headers["x-user-role"],
    });

    const ticketRes = await axios.get(`${TICKET_SERVICE}/tickets`, {
      headers: {
        Authorization: req.headers["authorization"],
        "X-User-Id": req.headers["x-user-id"],
        "X-User-Role": req.headers["x-user-role"],
      },
    });

    const tickets = ticketRes.data || [];
    if (tickets.length === 0) return res.json([]);

    const userIds = [...new Set(tickets.map(t => t.createdBy))];
    const userMap = {};

    for (const userId of userIds) {
      try {
        const userRes = await axios.get(
          `${AUTH_SERVICE}/users/${userId}`,
          {
            headers: {
              Authorization: req.headers["authorization"],
            },
          }
        );

        userMap[userId] =
          userRes.data.full_name ||
          userRes.data.fullName ||
          userRes.data.email ||
          "Unknown";
      } catch {
        userMap[userId] = "Unknown";
      }
    }

    const enrichedTickets = tickets.map(ticket => ({
      ...ticket,
      createdByName: userMap[ticket.createdBy] || "Unknown",
    }));

    res.json(enrichedTickets);

  } catch (err) {
    console.error(
      "❌ Ticket enrichment failed:",
      err.response?.data || err.message
    );
    res.status(err.response?.status || 500).json({
      error: "Failed to load tickets",
    });
  }
});

/**
 * =====================================
 * 🔐 ADMIN: Assign / Unassign ticket
 * =====================================
 */
router.put("/tickets/:id/assign", async (req, res) => {
  try {
    const ticketId = req.params.id;

    const response = await axios.put(
      `${TICKET_SERVICE}/tickets/${ticketId}/assign`,
      req.body,
      {
        headers: {
          Authorization: req.headers["authorization"],
          "X-User-Id": req.headers["x-user-id"],
          "X-User-Role": req.headers["x-user-role"],
        },
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error(
      "❌ Ticket assign failed:",
      err.response?.data || err.message
    );

    res.status(err.response?.status || 500).json({
      error: "Failed to assign ticket",
    });
  }
});

/**
 * ==================================================
 * 🔁 ALL OTHER /tickets ROUTES → PASS THROUGH
 * ==================================================
 */
router.use(
  "/tickets",
  proxy(TICKET_SERVICE, {
    proxyReqPathResolver: req => req.originalUrl,

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // 🔐 FORCE HEADER FORWARDING
      if (srcReq.headers["authorization"]) {
        proxyReqOpts.headers["Authorization"] =
          srcReq.headers["authorization"];
      }

      if (srcReq.headers["x-user-id"]) {
        proxyReqOpts.headers["X-User-Id"] =
          srcReq.headers["x-user-id"];
      }

      if (srcReq.headers["x-user-role"]) {
        proxyReqOpts.headers["X-User-Role"] =
          srcReq.headers["x-user-role"];
      }

      return proxyReqOpts;
    },
  })
);

module.exports = router;
