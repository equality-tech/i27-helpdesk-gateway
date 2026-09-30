const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "jsonwebtoken") {
    return {
      verify(token) {
        if (token === "valid-token") return { userId: 9, email: "agent@example.com", roles: ["AGENT"] };
        throw new Error("invalid token");
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const authenticate = require("../src/middlewares/authMiddleware");

function responseRecorder() {
  return {
    statusCode: undefined,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("rejects a request without an authorization header", () => {
  const res = responseRecorder();
  authenticate({ headers: {} }, res, () => assert.fail("next must not run"));
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, "Authorization header missing");
});

test("rejects a bearer scheme with no token", () => {
  const res = responseRecorder();
  authenticate({ headers: { authorization: "Bearer" } }, res, () => assert.fail("next must not run"));
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, "Token missing");
});

test("rejects an invalid token", () => {
  const res = responseRecorder();
  authenticate({ headers: { authorization: "Bearer invalid" } }, res, () => assert.fail("next must not run"));
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, "Invalid or expired token");
});

test("adds authenticated user data to downstream headers", () => {
  const req = { headers: { authorization: "Bearer valid-token" } };
  authenticate(req, responseRecorder(), () => {});
  assert.equal(req.headers["x-user-id"], 9);
  assert.equal(req.headers["x-user-email"], "agent@example.com");
  assert.equal(req.headers["x-user-role"], "AGENT");
});

test("calls next for a valid token", () => {
  let nextCalled = false;
  authenticate({ headers: { authorization: "Bearer valid-token" } }, responseRecorder(), () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});
