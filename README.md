# Portfolio Blog - Deployment Configuration

This project is configured for deployment:

- **Frontend**: Vercel
- **Backend**: Render

## Quick Start

### 1. Backend (Render)

1. Push code to GitHub
2. Create Web Service on Render
3. Set root directory to `server`
4. Add environment variables from `server/.env.example`
5. Deploy

### 2. Frontend (Vercel)

1. Create project on Vercel from GitHub
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=<your-render-backend-url>`
4. Deploy

## Detailed Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

## Files Created

- `client/vercel.json` - Vercel configuration for SPA routing
- `server/render.yaml` - Render service configuration
- `.gitignore` - Git ignore patterns
- `DEPLOYMENT.md` - Complete deployment guide
- `server/.env.example` - Backend environment variables template
- `client/.env.example` - Frontend environment variables template
# Blog-Portfolio
