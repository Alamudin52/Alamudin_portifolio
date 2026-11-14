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
  const apiBaseUrl = typeof config.apiBaseUrl === "string" ? config.apiBaseUrl.trim().replace(/\/+$/, "") : "";
  let preparedMessage = "";
  submitLabel.textContent = apiBaseUrl ? "Send message" : "Prepare message";

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
    if (apiBaseUrl) {
      submitButton.disabled = true;
      copyButton.hidden = true;
      status.textContent = "Sending your message...";
      try {
        const response = await fetch(`${apiBaseUrl}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fields.name.input.value.trim(),
            email: fields.email.input.value.trim(),
            subject: fields.subject.input.value.trim(),
            message: fields.message.input.value.trim(),
            website: form.elements.namedItem("website").value
          })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error("The contact API rejected the message.");

        status.textContent = result.message || "Your message was sent successfully.";
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
      return;
    }

    const recipient = config.email;
    copyButton.hidden = false;
    if (typeof recipient === "string" && recipient.trim()) {
      const mailto = `mailto:${encodeURIComponent(recipient.trim())}?subject=${encodeURIComponent(fields.subject.input.value.trim())}&body=${encodeURIComponent(preparedMessage)}`;
      status.textContent = "Your message is ready in your email app. It has not been sent by this website.";
      window.location.href = mailto;
    } else {
      status.textContent = "Your message is validated and ready to copy. This website does not send or store messages.";
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!preparedMessage) return;
    try {
      await navigator.clipboard.writeText(preparedMessage);
      status.textContent = "Message copied to your clipboard. It has not been sent.";
      status.classList.remove("is-error");
    } catch (error) {
      status.textContent = "Clipboard access is unavailable. Select and copy the message from your form.";
      status.classList.add("is-error");
    }
  });
}
