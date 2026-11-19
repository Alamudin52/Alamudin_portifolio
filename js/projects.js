// Add verified URLs and update technology tags to match each project before publishing.
window.portfolioProjects = [
  {
    title: "BusApp",
    category: "Transport & booking",
    description: "A bus reservation and management application for exploring trips and managing bookings.",
    image: "assets/images/project-busapp.png",
    imageAlt: "Abstract blue placeholder artwork for the BusApp project",
    technologies: ["Reservation", "Trip management", "Web application"],
    githubUrl: "",
    liveUrl: ""
  }
];

function createProjectLink(label, url, icon) {
  if (typeof url === "string" && url.trim()) {
    const link = document.createElement("a");
    link.className = "project-link";
    link.href = url.trim();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i> ${label}`;
    return link;
  }

  const unavailable = document.createElement("span");
  unavailable.className = "project-link-unavailable";
  unavailable.textContent = `${label} not configured`;
  return unavailable;
}

function renderProjects() {
  const grid = document.getElementById("project-grid");
  const projects = Array.isArray(window.portfolioProjects) ? window.portfolioProjects : [];
  if (!grid) return;

  if (projects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "surface-card empty-state col-12";
    empty.textContent = "Projects will be added here soon.";
    grid.append(empty);
    return;
  }

  projects.forEach((project, index) => {
    const column = document.createElement("div");
    column.className = "col-md-6 col-lg-4 reveal";

    const card = document.createElement("article");
    card.className = "surface-card project-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "project-image-wrap";
    const image = document.createElement("img");
    image.className = "project-image";
    image.src = project.image;
    image.alt = project.imageAlt || `${project.title} project preview`;
    image.loading = "lazy";
    image.width = 640;
    image.height = 380;
    imageWrap.append(image);

    const content = document.createElement("div");
    content.className = "project-content";

    const category = document.createElement("span");
    category.className = "project-index";
    category.textContent = `${String(index + 1).padStart(2, "0")} / ${project.category || "Project"}`;

    const heading = document.createElement("h3");
    heading.textContent = project.title;
    const description = document.createElement("p");
    description.textContent = project.description;
    const tags = document.createElement("div");
    tags.className = "project-tags";
    (Array.isArray(project.technologies) ? project.technologies : []).forEach((technology) => {
      const tag = document.createElement("span");
      tag.textContent = technology;
      tags.append(tag);
    });

    const links = document.createElement("div");
    links.className = "project-links";
    links.append(
      createProjectLink("GitHub", project.githubUrl, "bi-github"),
      createProjectLink("Live demo", project.liveUrl, "bi-box-arrow-up-right")
    );

    content.append(category, heading, description, tags, links);
    card.append(imageWrap, content);
    column.append(card);
    grid.append(column);
  });
}

function renderCertificates() {
  const grid = document.getElementById("certificate-grid");
  const certificates = Array.isArray(window.portfolioCertificates) ? window.portfolioCertificates : [];
  if (!grid) return;

  if (certificates.length === 0) {
    const empty = document.createElement("p");
    empty.className = "surface-card empty-state col-12";
    empty.textContent = "No certificates have been added yet.";
    grid.append(empty);
    return;
  }

  certificates.forEach((certificate) => {
    const column = document.createElement("div");
    column.className = "col-md-6 col-lg-4 reveal";
    const card = document.createElement("article");
    card.className = "surface-card certificate-card";
    const icon = document.createElement("span");
    icon.className = "certificate-icon";
    icon.innerHTML = '<i class="bi bi-award" aria-hidden="true"></i>';
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = certificate.title;
    details.append(title);
    if (typeof certificate.issuer === "string" && certificate.issuer.trim()) {
      const issuer = document.createElement("p");
      issuer.textContent = certificate.issuer.trim();
      details.append(issuer);
    }
    if (typeof certificate.date === "string" && certificate.date.trim()) {
      const date = document.createElement("p");
      date.textContent = `Awarded ${certificate.date.trim()}`;
      details.append(date);
    }
    if (typeof certificate.credentialUrl === "string" && certificate.credentialUrl.trim()) {
      const link = document.createElement("a");
      link.className = "certificate-link";
      link.href = certificate.credentialUrl.trim();
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View credential";
      link.setAttribute("aria-label", `View ${certificate.title} credential`);
      link.insertAdjacentHTML("beforeend", ' <i class="bi bi-arrow-up-right" aria-hidden="true"></i>');
      details.append(link);
    }
    card.append(icon, details);
    column.append(card);
    grid.append(column);
  });
}
