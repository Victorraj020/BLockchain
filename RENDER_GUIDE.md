# Hosting on Render.com — Complete Guide

This repository is pre-configured for **Render.com** deployment. You can deploy it using either **Method 1 (Automatic Blueprint)** or **Method 2 (Manual Web Service)**.

---

## Method 1: Automatic Blueprint (Recommended — 1 Click)

Render automatically detects the [`render.yaml`](./render.yaml) file in this repository.

1. Push your code to **GitHub** or **GitLab**.
2. Go to your [Render Dashboard](https://dashboard.render.com/).
3. Click **"New +"** (top right) ➜ Select **"Blueprint"**.
4. Connect your repository.
5. Render will automatically read `render.yaml` and configure:
   - **Service Name**: `dead-man-switch-vault`
   - **Environment**: Node 20
   - **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build`
   - **Start Command**: `npm --prefix frontend run start`
   - **Port**: `10000`
6. Click **"Apply"**. Render will build and deploy your app with a free `https://your-app.onrender.com` URL.

---

## Method 2: Manual Web Service Setup

If you prefer to configure it manually:

1. In Render Dashboard, click **"New +"** ➜ **"Web Service"**.
2. Connect your Git repository.
3. Fill in these settings:
   - **Name**: `dead-man-switch-vault` (or your choice)
   - **Region**: Any (e.g., Oregon / Frankfurt)
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: **Node**
   - **Build Command**:
     ```bash
     npm --prefix frontend install && npm --prefix frontend run build
     ```
   - **Start Command**:
     ```bash
     npm --prefix frontend run start
     ```
   - **Instance Type**: **Free**

4. **Environment Variables** (Under the "Environment" tab):

   | Key | Value | Description |
   |---|---|---|
   | `NODE_VERSION` | `20.12.2` | Ensures Node 20 is used |
   | `NEXT_TELEMETRY_DISABLED` | `1` | Disables telemetry for faster builds |
   | `PORT` | `10000` | Port Render listens on |
   | `NEXT_PUBLIC_DEFAULT_CHAIN_ID` | `11155111` | Sepolia Testnet (or `31337` for local) |
   | `NEXT_PUBLIC_SEPOLIA_RPC` | `https://rpc.sepolia.org` | Public RPC or your Alchemy/Infura URL |

5. Click **"Create Web Service"**.

---

## Method 3: Docker Deployment (Alternative)

Render can also build directly from the included [`Dockerfile`](./Dockerfile):

1. Click **"New +"** ➜ **"Web Service"**.
2. Connect your repository.
3. Select **Docker** as the Runtime.
4. Render will automatically use `Dockerfile` to build and serve the app.

---

## After Deployment: Add Render URL to Firebase

Once Render gives you your live URL (e.g. `https://dead-man-switch-vault.onrender.com`):

1. Go to [Firebase Console](https://console.firebase.google.com/) for project `blockchain-59831`.
2. Go to **Authentication** ➜ **Settings** ➜ **Authorized domains**.
3. Click **"Add domain"** and enter your Render domain:
   ```
   dead-man-switch-vault.onrender.com
   ```
*(This allows Google and Email logins to work on your live Render site).*
