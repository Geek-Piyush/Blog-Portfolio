# Deployment Guide

## Backend Deployment (Render)

### Prerequisites

1. Create a [Render](https://render.com) account
2. Have your MongoDB Atlas connection string ready
3. Have your Cloudinary credentials ready

### Steps

1. **Push your code to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: portfolio-backend (or your choice)
     - **Region**: Choose closest to you
     - **Branch**: main
     - **Root Directory**: `server`
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Set Environment Variables on Render**
   Go to "Environment" tab and add:

   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your_admin_password
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your service URL (e.g., `https://portfolio-backend-xyz.onrender.com`)

### Notes

- Free tier may spin down after inactivity (cold start ~30s)
- Your backend URL will be: `https://your-service-name.onrender.com`

---

## Frontend Deployment (Vercel)

### Prerequisites

1. Create a [Vercel](https://vercel.com) account
2. Have your backend URL from Render ready

### Steps

1. **Install Vercel CLI (optional)**

   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard (Recommended)**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Set Environment Variables on Vercel**
   In "Environment Variables" section, add:

   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

   Replace `your-backend-url.onrender.com` with your actual Render backend URL.

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your frontend will be live at: `https://your-project.vercel.app`

### Alternative: Deploy via CLI

```bash
cd client
vercel
# Follow the prompts
# Set environment variable: VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Post-Deployment

### 1. Update CORS Settings

Make sure your backend allows requests from your Vercel domain:

In `server/src/app.js`, the CORS is already configured to allow all origins in production. If you want to restrict it:

```javascript
const corsOptions = {
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
};
```

Then add `CLIENT_URL` environment variable on Render with your Vercel URL.

### 2. Test Your Deployment

1. Visit your Vercel URL
2. Try logging in with your admin credentials
3. Create a test blog post
4. Upload images
5. Verify all features work

### 3. Custom Domain (Optional)

- **Vercel**: Project Settings → Domains → Add your domain
- **Render**: Service Settings → Custom Domain → Add your domain

---

## Troubleshooting

### Backend Issues

- **500 errors**: Check Render logs for error details
- **MongoDB connection**: Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Render IPs
- **Environment variables**: Double-check all env vars are set correctly

### Frontend Issues

- **API errors**: Verify `VITE_API_URL` is set correctly on Vercel
- **404 on refresh**: The `vercel.json` file handles this with rewrites
- **Image upload fails**: Check Cloudinary credentials and CORS settings

### Common Issues

- **CORS errors**: Update backend CORS to allow your Vercel domain
- **Cold start delays**: Free tier on Render spins down after inactivity
- **Build fails**: Check build logs for missing dependencies or errors

---

## Environment Variables Summary

### Backend (Render)

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<admin-password>
```

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Monitoring

- **Render**: View logs in real-time from the Render dashboard
- **Vercel**: View deployment logs and analytics in Vercel dashboard
- **MongoDB Atlas**: Monitor database performance and connections

---

## Updates

### Updating Backend

1. Push changes to GitHub
2. Render will auto-deploy (if enabled) or manually deploy from dashboard

### Updating Frontend

1. Push changes to GitHub
2. Vercel will auto-deploy
3. Or run `vercel --prod` from CLI

---

## Cost Considerations

- **Render Free Tier**: 750 hours/month, spins down after inactivity
- **Vercel Free Tier**: Unlimited bandwidth for personal projects
- **MongoDB Atlas Free Tier**: 512MB storage

Consider upgrading to paid tiers for production apps with higher traffic.
