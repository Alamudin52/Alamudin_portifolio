// Add your verified contact details and Formspree endpoint before publishing.
window.portfolioConfig = {
  formspreeEndpoint: "",
  githubUrl: "",
  linkedinUrl: "",
  email: "",
  graduationInfo: ""
};

window.portfolioCertificates = [
  {
    title: "Diploma in Sales and Distribution Management",
    issuer: "Alison",
    date: "",
    credentialUrl: ""
  },
  {
    title: "Introduction to Cyber Security",
    issuer: "",
    date: "4 June 2026",
    credentialUrl: "assets/certificates/introduction-to-cyber-security.pdf"
  },
  {
    title: "Getting Started with Cisco Packet Tracer",
    issuer: "Cisco Networking Academy",
    date: "13 November 2026",
    credentialUrl: "assets/certificates/cisco-packet-tracer.pdf"
  },
  {
    title: "Android Development",
    issuer: "Udacity",
    date: "",
    credentialUrl: "assets/certificates/android-development.pdf"
  }
];

function initializeSocialLinks() {
  const config = window.portfolioConfig;
  document.querySelectorAll("[data-social]").forEach((link) => {
    const url = config[`${link.dataset.social}Url`];
    if (typeof url === "string" && url.trim()) {
      link.href = url.trim();
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.hidden = false;
    }
  });

  const configuredSocials = Object.values({
    githubUrl: config.githubUrl,
    linkedinUrl: config.linkedinUrl
  }).some((url) => typeof url === "string" && url.trim());
  document.querySelectorAll(".social-unconfigured").forEach((note) => {
    note.hidden = configuredSocials;
  });
}

function initializeContactDetails() {
  const config = window.portfolioConfig;
  const emailLink = document.querySelector(".contact-email");
  const emailNote = document.querySelector(".email-unconfigured");
  if (typeof config.email === "string" && config.email.trim()) {
    emailLink.href = `mailto:${config.email.trim()}`;
    emailLink.querySelector("[data-email-label]").textContent = config.email.trim();
    emailLink.hidden = false;
    emailNote.hidden = true;
  }

  const graduation = document.getElementById("graduation-info");
  if (typeof config.graduationInfo === "string" && config.graduationInfo.trim()) {
    graduation.textContent = config.graduationInfo.trim();
  }
}

function initializeNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("primary-navigation");
  const navLinks = [...document.querySelectorAll('.site-nav .nav-link[href^="#"]')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      toggle.focus();
    }
  });

  function updateScrollState() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    const marker = window.scrollY + Math.min(window.innerHeight * 0.35, 220);
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section;
    });
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${current.id}`;
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
      link.classList.toggle("active", active);
    });
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) closeMenu();
    updateScrollState();
  });
  updateScrollState();
}

function initializeRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  renderCertificates();
  initializeSocialLinks();
  initializeContactDetails();
  initializeNavigation();
  initializeContactForm();
  document.getElementById("current-year").textContent = String(new Date().getFullYear());
  initializeRevealAnimations();
});
