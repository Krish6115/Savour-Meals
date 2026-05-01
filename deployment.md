# Savour Meals - Deployment Guide

This guide covers the deployment of the **Savour Meals** project using **Vercel** for the frontend and **Render** for the backend.

---

## 1. Preparation
Before proceeding, ensure your entire project is pushed to a GitHub repository. Both Vercel and Render will connect directly to this repository to automatically build and deploy your code.

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## 2. Backend Deployment (Render)

We have configured a `render.yaml` file in the root directory to make deploying the backend incredibly simple using Render's Blueprint feature.

### Steps:
1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in.
2. Click the **"New +"** button and select **"Blueprint"**.
3. Connect your GitHub account and select your `savour-meals` repository.
4. Render will automatically detect the `render.yaml` file and prepare to deploy a Web Service named `savour-meals-backend`.
5. You will be prompted to enter values for the environment variables that we marked as `sync: false` in the configuration.
6. Click **"Apply"** to start the deployment.

### Required Environment Variables:
Render will prompt you for the following variables:
*   **`MONGODB_URI`**: Your MongoDB Atlas connection string (e.g., `mongodb+srv://<username>:<password>@cluster.mongodb.net/savour-meals...`).
*   **`JWT_SECRET`**: A strong, random string used for signing authentication tokens.
*   **`CORS_ORIGIN`**: Wait until you deploy the frontend (or if you know your Vercel URL, e.g., `https://savour-meals.vercel.app`), put it here to allow cross-origin requests.
*   **`FRONTEND_URL`**: The same URL as your `CORS_ORIGIN`, used by the backend to send email links.

**Note:** Once deployed, Render will provide a URL like `https://savour-meals-backend.onrender.com`. Copy this URL for the next step.

---

## 3. Frontend Deployment (Vercel)

The frontend is a React application built with Create React App. We have added a `client/vercel.json` file to handle React Router navigation correctly.

### Steps:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and sign in.
2. Click **"Add New..."** and select **"Project"**.
3. Import your `savour-meals` repository from GitHub.
4. **Important configuration in the "Configure Project" step:**
    *   **Framework Preset:** Create React App (should be auto-detected).
    *   **Root Directory:** Click "Edit" and select the `client` folder.
5. **Environment Variables:**
    *   Expand the Environment Variables section.
    *   Add a new variable:
        *   **Name:** `REACT_APP_API_URL`
        *   **Value:** Paste your Render backend URL (e.g., `https://savour-meals-backend.onrender.com/api`).
6. Click **"Deploy"**.

---

## 4. Final Steps & Verification

Once both the backend and frontend are successfully deployed:
1. **Update CORS:** If you didn't know your Vercel URL when setting up the backend, go back to your Render Dashboard -> your web service -> **Environment**, and update the `CORS_ORIGIN` and `FRONTEND_URL` with your live Vercel URL (`https://your-app.vercel.app`).
2. **Verify:** Open your live Vercel application URL. Attempt to register a test user or log in to ensure that the frontend can successfully communicate with the backend.

### Troubleshooting
*   **CORS Errors:** Ensure that the `CORS_ORIGIN` on Render perfectly matches the frontend URL (no trailing slash).
*   **Page Not Found on Refresh:** The `client/vercel.json` file ensures that refreshing on routes like `/dashboard` redirects correctly to React Router. If you encounter this, ensure Vercel picked up the configuration.
*   **API Not Responding:** The free tier of Render "spins down" after 15 minutes of inactivity. If the API seems slow or unresponsive on the first load, wait 30-60 seconds for the container to spin back up.
