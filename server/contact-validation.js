const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateContact(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const contact = {
    name: trimmedString(payload.name),
    email: trimmedString(payload.email),
    subject: trimmedString(payload.subject),
    message: trimmedString(payload.message)
  };

  if (
    contact.name.length < 2 ||
    contact.name.length > 100 ||
    contact.email.length > 254 ||
    !EMAIL_PATTERN.test(contact.email) ||
    contact.subject.length < 2 ||
    contact.subject.length > 150 ||
    /[\r\n]/.test(contact.subject) ||
    contact.message.length < 10 ||
    contact.message.length > 5000
  ) {
    return null;
  }

  return contact;
}

module.exports = { validateContact };
