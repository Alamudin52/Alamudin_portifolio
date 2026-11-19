const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "contact.js"), "utf8");

function createField(value) {
  return {
    value,
    validity: {},
    checkValidity: () => true,
    setAttribute(name, attributeValue) {
      this[name] = attributeValue;
    },
    removeAttribute(name) {
      delete this[name];
    },
    addEventListener() {}
  };
}

function createContactForm(endpoint, fetchResponse = { ok: true }) {
  const fields = {
    name: createField("Jane Doe"),
    email: createField("jane@example.com"),
    subject: createField("Portfolio question"),
    message: createField("I would like to know more about your projects."),
    _gotcha: createField("")
  };
  const errors = {
    "name-error": { textContent: "" },
    "email-error": { textContent: "" },
    "subject-error": { textContent: "" },
    "message-error": { textContent: "" }
  };
  const form = {
    elements: { namedItem: (name) => fields[name] },
    listeners: {},
    addEventListener(name, callback) {
      this.listeners[name] = callback;
    },
    querySelector(selector) {
      if (selector === 'button[type="submit"]') return submitButton;
      return null;
    },
    reset() {
      Object.values(fields).forEach((field) => { field.value = ""; });
    }
  };
  const submitButton = { disabled: false };
  const copyButton = {
    hidden: true,
    addEventListener() {}
  };
  const status = {
    textContent: "",
    classList: {
      values: new Set(),
      add(value) { this.values.add(value); },
      remove(value) { this.values.delete(value); }
    }
  };
  const submitLabel = { textContent: "" };
  const document = {
    getElementById(id) {
      return errors[id] || {
        "contact-form": form,
        "form-status": status,
        "copy-message": copyButton,
        "submit-label": submitLabel
      }[id] || null;
    }
  };
  class TestFormData {
    constructor() {
      this.values = new Map(Object.entries(fields).map(([name, field]) => [name, field.value]));
    }
    set(name, value) {
      this.values.set(name, value);
    }
    get(name) {
      return this.values.get(name);
    }
  }
  const requests = [];
  const context = {
    document,
    window: { portfolioConfig: { formspreeEndpoint: endpoint } },
    URL,
    FormData: TestFormData,
    fetch: async (...args) => {
      requests.push(args);
      return fetchResponse;
    },
    navigator: { clipboard: { writeText: async () => {} } }
  };

  vm.runInNewContext(source, context);
  context.initializeContactForm();
  return { form, fields, status, copyButton, submitButton, submitLabel, requests };
}

test("keeps an unconfigured form honest and offers a copyable draft", async () => {
  const form = createContactForm("");
  await form.form.listeners.submit({ preventDefault() {} });

  assert.equal(form.requests.length, 0);
  assert.match(form.status.textContent, /not connected yet/);
  assert.equal(form.copyButton.hidden, false);
  assert.equal(form.submitLabel.textContent, "Prepare message");
});

test("sends a valid form to a configured Formspree endpoint", async () => {
  const form = createContactForm("https://formspree.io/f/abc123");
  await form.form.listeners.submit({ preventDefault() {} });

  assert.equal(form.requests.length, 1);
  assert.equal(form.requests[0][0], "https://formspree.io/f/abc123");
  assert.equal(form.requests[0][1].method, "POST");
  assert.equal(form.requests[0][1].body.get("email"), "jane@example.com");
  assert.equal(form.requests[0][1].body.get("_subject"), "Portfolio question");
  assert.equal(form.status.textContent, "Your message was sent successfully.");
  assert.equal(form.copyButton.hidden, true);
});

test("rejects an invalid Formspree endpoint without sending", async () => {
  const form = createContactForm("https://example.com/collect");
  await form.form.listeners.submit({ preventDefault() {} });

  assert.equal(form.requests.length, 0);
  assert.match(form.status.textContent, /endpoint is invalid/);
  assert.equal(form.status.classList.values.has("is-error"), true);
  assert.equal(form.copyButton.hidden, false);
});

test("reports provider failure without claiming the message was sent", async () => {
  const form = createContactForm("https://formspree.io/f/abc123", { ok: false });
  await form.form.listeners.submit({ preventDefault() {} });

  assert.equal(form.status.textContent, "Your message could not be sent. Please try again or copy your message.");
  assert.equal(form.status.classList.values.has("is-error"), true);
  assert.equal(form.copyButton.hidden, false);
});

test("does not submit when the anti-spam field is filled", async () => {
  const form = createContactForm("https://formspree.io/f/abc123");
  form.fields._gotcha.value = "bot submission";
  await form.form.listeners.submit({ preventDefault() {} });

  assert.equal(form.requests.length, 0);
  assert.equal(form.status.classList.values.has("is-error"), true);
});
