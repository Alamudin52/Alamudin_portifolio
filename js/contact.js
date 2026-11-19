function initializeContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    name: { input: form.elements.namedItem("name"), error: document.getElementById("name-error"), message: "Enter your name (at least 2 characters)." },
    email: { input: form.elements.namedItem("email"), error: document.getElementById("email-error"), message: "Enter a valid email address." },
    subject: { input: form.elements.namedItem("subject"), error: document.getElementById("subject-error"), message: "Enter a subject (at least 2 characters)." },
    message: { input: form.elements.namedItem("message"), error: document.getElementById("message-error"), message: "Enter a message (at least 10 characters)." }
  };
  const status = document.getElementById("form-status");
  const copyButton = document.getElementById("copy-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel = document.getElementById("submit-label");
  const config = window.portfolioConfig || {};
  const configuredEndpoint = typeof config.formspreeEndpoint === "string" && config.formspreeEndpoint.trim();
  const formspreeEndpoint = getFormspreeEndpoint(config.formspreeEndpoint);
  let preparedMessage = "";
  submitLabel.textContent = formspreeEndpoint ? "Send message" : "Prepare message";

  function getFormspreeEndpoint(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const endpoint = new URL(value.trim());
      if (endpoint.origin !== "https://formspree.io" || !/^\/f\/[A-Za-z0-9]+$/.test(endpoint.pathname)) return "";
      return endpoint.href;
    } catch {
      return "";
    }
  }

  function validateField(name, field) {
    const value = field.input.value.trim();
    let valid = field.input.checkValidity() && value.length > 0;
    if (name === "email") {
      valid = valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (name === "name" || name === "subject") valid = valid && value.length >= 2;
    if (name === "message") valid = valid && value.length >= 10;

    field.input.setAttribute("aria-invalid", String(!valid));
    field.error.textContent = valid ? "" : field.message;
    return valid;
  }

  Object.entries(fields).forEach(([name, field]) => {
    field.input.addEventListener("input", () => {
      validateField(name, field);
      status.textContent = "";
      status.classList.remove("is-error");
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.classList.remove("is-error");
    const valid = Object.entries(fields).map(([name, field]) => validateField(name, field)).every(Boolean);
    if (!valid) {
      status.textContent = "Please correct the highlighted fields before continuing.";
      status.classList.add("is-error");
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      copyButton.hidden = true;
      return;
    }

    preparedMessage = `From: ${fields.name.input.value.trim()} <${fields.email.input.value.trim()}>\nSubject: ${fields.subject.input.value.trim()}\n\n${fields.message.input.value.trim()}`;
    if (configuredEndpoint && !formspreeEndpoint) {
      status.textContent = "The Formspree endpoint is invalid. Check js/main.js; you can also copy your message draft.";
      status.classList.add("is-error");
      copyButton.hidden = false;
      return;
    }

    if (!formspreeEndpoint) {
      status.textContent = "The contact form is not connected yet. You can copy your message draft.";
      copyButton.hidden = false;
      return;
    }

    if (form.elements.namedItem("_gotcha").value.trim()) {
      status.textContent = "Your message could not be sent. Please try again later.";
      status.classList.add("is-error");
      return;
    }

    submitButton.disabled = true;
    copyButton.hidden = true;
    status.textContent = "Sending your message...";
    try {
      const payload = new FormData(form);
      payload.set("_subject", fields.subject.input.value.trim());
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload
      });
      if (!response.ok) throw new Error("The contact form service rejected the message.");

      status.textContent = "Your message was sent successfully.";
      form.reset();
      preparedMessage = "";
      Object.values(fields).forEach((field) => {
        field.input.removeAttribute("aria-invalid");
        field.error.textContent = "";
      });
    } catch {
      status.textContent = "Your message could not be sent. Please try again or copy your message.";
      status.classList.add("is-error");
      copyButton.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!preparedMessage) return;
    try {
      await navigator.clipboard.writeText(preparedMessage);
      status.textContent = "Message copied to your clipboard. It has not been sent.";
      status.classList.remove("is-error");
    } catch {
      status.textContent = "Clipboard access is unavailable. Select and copy the message from your form.";
      status.classList.add("is-error");
    }
  });
}
