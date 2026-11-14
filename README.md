# Alamudin Portfolio

A responsive personal developer portfolio built with HTML, CSS, Bootstrap 5, Bootstrap Icons and vanilla JavaScript. The contact form uses a small Node.js/Express API that delivers messages through Resend; the API does not save submissions to a database.

This project is distributed under the MIT License; see [`LICENSE`](./LICENSE).

## Run locally

1. Install Node.js 20 or newer.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env` and set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`. The sender address must be verified with Resend. Never commit `.env` or paste API keys into source files.
4. Run `npm run dev` to start the API on `http://localhost:3000`.
5. In VS Code, open `index.html` with Live Server. Live Server normally uses `http://127.0.0.1:5500`.
6. To test real form delivery locally, set `apiBaseUrl` in `js/main.js` to `http://localhost:3000` and add the Live Server origin to `ALLOWED_ORIGINS` if you use a non-default port.

Run the API tests with `npm test`. The `/api/health` endpoint can be used to check the running API.

## Configure before deploying

- On localhost, `js/main.js` automatically uses the local API at `http://localhost:3000`. Before deployment, set `apiBaseUrl` to the Render API origin. Keep it empty to retain the draft/copy-only form behavior.
- `CONTACT_TO_EMAIL` is the inbox that receives messages. `CONTACT_FROM_EMAIL` must be a sender address verified by your Resend account.
- Configure `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `NODE_ENV=production` and `ALLOWED_ORIGINS` in the API host’s environment/secrets dashboard. For GitHub Pages, `ALLOWED_ORIGINS` is the site origin, such as `https://your-user.github.io` (no repository path).
- Never expose the Resend key in JavaScript, GitHub Pages files, or a committed `.env` file. `.env` is ignored by Git.
- The Cyber Security PDF does not state its issuer; no Android certificate award date was available in the supplied PDF.

The API validates submissions, limits repeated requests and forwards valid messages to Resend. The website reports success only after the email provider accepts the request. Messages are not stored in a project database.

## Deploy the website and API

GitHub Pages hosts the static portfolio only; it cannot run the Express API. Host the API separately (for example, as a Render Web Service):

1. Create a GitHub repository and push this project. Keep `.env` out of the repository.
2. In Render, create a Blueprint from the repository and use the included `render.yaml` to configure the Web Service. Alternatively, create a Web Service manually with `npm install` as the build command and `npm start` as the start command.
3. Add the required Resend settings and `ALLOWED_ORIGINS` as Render environment variables. Use a Resend-verified sender address.
4. Once Render gives the API its public URL, set `apiBaseUrl` in `js/main.js` to that origin (for example, `https://your-api.onrender.com`) and push the update.
5. In GitHub, open **Settings → Pages** and set the build source to **GitHub Actions**. The included workflow deploys the static site on pushes to `main`.
6. After the first Pages deployment, set `ALLOWED_ORIGINS` in Render to the published site's origin, then check the API health endpoint and test that a message reaches the configured inbox.

Do not add API keys or passwords to this repository. A GitHub repository and hosting account must be created/configured before the project can be published or email delivery can be activated.

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
├── server/
│   ├── contact-validation.js
│   ├── contact-validation.test.js
│   └── index.js
├── .env.example
├── .gitignore
├── index.html
└── package.json
```
