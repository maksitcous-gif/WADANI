# WADANI

WADANI is a React + Vite web application for managing community events, news, polls, volunteer signups, and admin operations.

## Features
- Public-facing pages for events, news, leaders, gallery, and contact info
- Admin dashboard for managing content
- Volunteer and user management workflows
- Firebase-backed authentication and data access

## Prerequisites
- Node.js 18 or newer
- npm
- A Firebase project
- A GitHub repository with GitHub Pages enabled

## Local setup
1. Clone the repository
   ```bash
   git clone https://github.com/maksitcous-gif/WADANI.git
   cd WADANI
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root and add your Firebase configuration values:
   ```env
   VITE_API_KEY=your_api_key
   VITE_AUTH_DOMAIN=your_auth_domain
   VITE_PROJECT_ID=your_project_id
   VITE_STORAGE_BUCKET=your_storage_bucket
   VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_APP_ID=your_app_id
   VITE_APPCHECK_SITE_KEY=optional_app_check_key
   ```
4. Start the development server
   ```bash
   npm run dev
   ```

## Build for production
```bash
npm run build
```

## GitHub Pages deployment
This project is configured for GitHub Pages using a Vite base path of `/WADANI/`.

To publish automatically:
1. Push the repository to GitHub.
2. In GitHub, open the repository settings.
3. Go to **Pages** and select **GitHub Actions** as the source.
4. The workflow in `.github/workflows/deploy.yml` will build and deploy the site on every push to `main`.

## Useful scripts
- `npm run dev` — run locally
- `npm run build` — create production output
- `npm run preview` — preview the production build locally

## Notes
- The `.env` file is ignored by Git for security.
- If your Firebase project uses App Check, set `VITE_APPCHECK_SITE_KEY` in your environment variables.
