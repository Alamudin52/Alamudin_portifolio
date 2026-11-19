# Alamudin Portfolio

A responsive personal developer portfolio built with HTML, CSS, Bootstrap 5, Bootstrap Icons and vanilla JavaScript. GitHub Pages serves the static website, and Formspree can deliver the contact form to your inbox without a custom server or domain. The project is distributed under the MIT License; see [`LICENSE`](./LICENSE).

## Run locally

1. Open this folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Open `index.html` with Live Server (or select **Go Live** in VS Code).

The site uses CDN-hosted Bootstrap, Bootstrap Icons and Inter from Google Fonts, so an internet connection is needed for those assets.

## Connect the contact form

1. Create a form at [Formspree](https://formspree.io/) and set its notification recipient to `barbaadaajannataa@gmail.com`.
2. Verify the recipient if Formspree asks.
3. Copy the endpoint Formspree gives you. It looks like `https://formspree.io/f/xxxxxxxx`.
4. Open `js/main.js` and set `formspreeEndpoint` to that URL. The endpoint is a public form identifier, not an API secret.
5. Commit and push the change to `main`. GitHub Actions will redeploy the site.
6. Submit a test through the published site and confirm the message arrives in Gmail.

Until a real Formspree endpoint is configured, the form validates the fields and offers to copy a draft; it does not claim to send messages. Formspree handles delivery and notifications. There is no custom API server or database in this setup.

## GitHub Pages

The site is already configured for GitHub Pages and deploys from the `main` branch through the workflow in `.github/workflows/pages.yml`.

- Website: <https://alamudin52.github.io/Alamudin_portifolio/>
- Repository: <https://github.com/Alamudin52/Alamudin_portifolio>

After pushing changes, check the **Actions** tab for a successful **Deploy portfolio to GitHub Pages** run.

## Personalize

- Replace `assets/images/profile.png` and the three project previews with genuine images when available; the included artwork is illustrative placeholder art.
- Replace `assets/cv/Alamudin-CV.pdf` with a current, verified CV before using the download link for applications.
- Update verified contact/social URLs and graduation details in `js/main.js`.
- Update each project’s description, technology tags, GitHub URL and demo URL in `js/projects.js`.
- Add certificates to `window.portfolioCertificates` in `js/main.js`, including title, issuer, date and (optionally) `credentialUrl`.
- Review the biography and education information in `index.html` so it reflects your current details.

## Project structure

```text
alamudin-portfolio/
├── assets/
│   ├── certificates/
│   ├── cv/Alamudin-CV.pdf
│   └── images/
├── css/
│   ├── animations.css
│   ├── responsive.css
│   └── style.css
├── js/
│   ├── contact.js
│   ├── main.js
│   └── projects.js
├── .github/workflows/pages.yml
├── .gitignore
├── index.html
├── tests/contact.test.js
└── LICENSE
```
