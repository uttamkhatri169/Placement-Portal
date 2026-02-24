# Deployment Guide: UMS Placement Portal

This project is now ready to be hosted publicly on **Render**. Follow these steps to get your project live.

## 1. Push Code to GitHub
Ensure all your local changes are committed and pushed to a GitHub repository.

## 2. Create a Render Account
Go to [render.com](https://render.com) and sign up using your GitHub account.

## 3. Create a New Web Service
1. Click **New +** and select **Web Service**.
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` file (if you use "Blueprint") or you can configure it manually:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`

## 4. Configure Environment Variables
In the Render dashboard, go to the **Environment** tab and add the following keys from your `.env` file:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET` (Use a strong random string)

## 5. View Your Site
Once the build is complete, Render will provide a URL (e.g., `https://ums-placement-portal.onrender.com`). Your project is now public!

---

> [!IMPORTANT]
> **Database Security**: Ensure your Supabase database is properly secured. Since the app is now public, anyone with the URL can access the site. Ensure your RLS (Row Level Security) policies are active in Supabase.

> [!NOTE]
> **SSL Bypass**: The current code includes an SSL bypass patch for local development issues. For a production environment on Render, this is typically not needed but has been kept for compatibility.
