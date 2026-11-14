require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { validateContact } = require("./contact-validation");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(isProduction ? [] : ["http://localhost:5500", "http://127.0.0.1:5500"])
]);

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use((request, response, next) => {
  const origin = request.get("Origin");
  if (!origin) return next();
  if (!allowedOrigins.has(origin)) {
    return response.status(403).json({ error: "This website origin is not allowed." });
  }

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") return response.sendStatus(204);
  return next();
});
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many messages. Please try again later." }
  }),
  async (request, response) => {
    if (typeof request.body?.website === "string" && request.body.website.trim()) {
      return response.status(400).json({ error: "Invalid submission." });
    }

    const contact = validateContact(request.body);
    if (!contact) {
      return response.status(400).json({ error: "Please check the contact form fields." });
    }

    let delivery;
    try {
      delivery = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL,
          to: [process.env.CONTACT_TO_EMAIL],
          reply_to: contact.email,
          subject: `Portfolio message: ${contact.subject}`,
          text: `Name: ${contact.name}\nEmail: ${contact.email}\n\n${contact.message}`
        }),
        signal: AbortSignal.timeout(10000)
      });
    } catch (error) {
      console.error("Contact email delivery request failed:", error.message);
      return response.status(502).json({ error: "Message delivery is temporarily unavailable." });
    }

    if (!delivery.ok) {
      console.error("Resend rejected the contact message with status:", delivery.status);
      return response.status(502).json({ error: "Message delivery is temporarily unavailable." });
    }

    return response.status(200).json({ message: "Your message was sent successfully." });
  }
);

app.use((error, _request, response, next) => {
  if (response.headersSent) return next(error);
  if (error.type === "entity.too.large") {
    return response.status(413).json({ error: "The submitted message is too large." });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({ error: "The request body must be valid JSON." });
  }
  console.error("Unhandled API error:", error.message);
  return response.status(500).json({ error: "The server could not process this request." });
});

function validateEnvironment() {
  const required = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (isProduction && configuredOrigins.length === 0) {
    throw new Error("Set ALLOWED_ORIGINS to the published portfolio origin before production startup.");
  }
}

if (require.main === module) {
  validateEnvironment();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Portfolio API listening on port ${port}`);
  });
}

module.exports = app;
