const test = require("node:test");
const assert = require("node:assert/strict");
const { validateContact } = require("./contact-validation");

test("validates and trims a complete contact message", () => {
  assert.deepEqual(
    validateContact({
      name: "  Jane Doe ",
      email: " jane@example.com ",
      subject: " Portfolio question ",
      message: " I would like to discuss your work. "
    }),
    {
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Portfolio question",
      message: "I would like to discuss your work."
    }
  );
});

test("rejects malformed email and header-injection subjects", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Question",
    message: "A sufficiently long message."
  };

  assert.equal(validateContact({ ...valid, email: "not-an-email" }), null);
  assert.equal(validateContact({ ...valid, subject: "Hello\r\nBcc: other@example.com" }), null);
});

test("rejects missing and oversized fields", () => {
  assert.equal(validateContact(null), null);
  assert.equal(validateContact({}), null);
  assert.equal(
    validateContact({
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Question",
      message: "x".repeat(5001)
    }),
    null
  );
});
