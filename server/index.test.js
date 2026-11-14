const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

process.env.NODE_ENV = "test";
process.env.ALLOWED_ORIGINS = "https://portfolio.example";
process.env.RESEND_API_KEY = "re_test_key";
process.env.CONTACT_TO_EMAIL = "owner@example.com";
process.env.CONTACT_FROM_EMAIL = "Portfolio <portfolio@example.com>";

const app = require("./index");
const originalFetch = global.fetch;
let server;
let baseUrl;
let resendRequest;

function request(path, { method = "GET", body, origin } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {};
    if (origin) headers.Origin = origin;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const outgoing = http.request(url, { method, headers }, (incoming) => {
      let responseBody = "";
      incoming.setEncoding("utf8");
      incoming.on("data", (chunk) => { responseBody += chunk; });
      incoming.on("end", () => {
        resolve({
          status: incoming.statusCode,
          headers: incoming.headers,
          body: responseBody ? JSON.parse(responseBody) : null
        });
      });
    });
    outgoing.on("error", reject);
    if (body !== undefined) outgoing.write(JSON.stringify(body));
    outgoing.end();
  });
}

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  global.fetch = originalFetch;
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("health endpoint responds without exposing configuration", async () => {
  const response = await request("/api/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("contact endpoint rejects invalid fields and disallowed origins", async () => {
  const invalid = await request("/api/contact", {
    method: "POST",
    origin: "https://portfolio.example",
    body: { name: "A", email: "bad", subject: "Hi", message: "Short" }
  });
  assert.equal(invalid.status, 400);

  const forbidden = await request("/api/contact", {
    method: "POST",
    origin: "https://unexpected.example",
    body: { name: "Jane Doe", email: "jane@example.com", subject: "Hello", message: "A valid message body." }
  });
  assert.equal(forbidden.status, 403);
});

test("valid contact messages are sent to Resend and success follows acceptance", async () => {
  global.fetch = async (url, options) => {
    resendRequest = { url, options };
    return { ok: true, status: 200 };
  };

  const response = await request("/api/contact", {
    method: "POST",
    origin: "https://portfolio.example",
    body: {
      name: " Jane Doe ",
      email: "jane@example.com",
      subject: "Portfolio question",
      message: "I would like to know more about your projects.",
      website: ""
    }
  });

  assert.equal(response.status, 200);
  assert.match(response.body.message, /sent successfully/);
  assert.equal(resendRequest.url, "https://api.resend.com/emails");
  assert.equal(resendRequest.options.headers.Authorization, "Bearer re_test_key");
  const email = JSON.parse(resendRequest.options.body);
  assert.deepEqual(email.to, ["owner@example.com"]);
  assert.equal(email.reply_to, "jane@example.com");
  assert.match(email.text, /Name: Jane Doe/);
});

test("provider rejection is reported as a delivery error, not success", async () => {
  global.fetch = async () => ({ ok: false, status: 401 });
  const response = await request("/api/contact", {
    method: "POST",
    origin: "https://portfolio.example",
    body: {
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Portfolio question",
      message: "I would like to know more about your projects."
    }
  });

  assert.equal(response.status, 502);
  assert.match(response.body.error, /unavailable/);
});
