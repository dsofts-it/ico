# Quick Deployment Steps

## 1. Push to GitHub (5 minutes)

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git add .
git commit -m "Prepare for Render deployment"
git push -u origin main
```

## 2. Set Up MongoDB Atlas (10 minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user (save credentials!)
4. Allow access from anywhere (0.0.0.0/0)
5. Get connection string: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/`

## 3. Deploy to Render (5 minutes)

### Option A: Blueprint (Recommended)
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Blueprint**
3. Select your GitHub repository
4. Fill in environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Email settings
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: Twilio settings
5. Click **Apply**

### Option B: Manual Web Service
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select your repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Region**: Singapore
   - **Plan**: Free
5. Add all environment variables (same as above)
6. Click **Create Web Service**

## 4. Test Your Deployment

Your API will be live at: `https://YOUR_SERVICE_NAME.onrender.com`

Test endpoints:
- Health check: `GET https://YOUR_SERVICE_NAME.onrender.com/health`
- API status: `GET https://YOUR_SERVICE_NAME.onrender.com/`
- Signup: `POST https://YOUR_SERVICE_NAME.onrender.com/api/auth/signup`

## Environment Variables Required

| Variable | Example | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/` | MongoDB connection string |
| `JWT_SECRET` | Auto-generated or custom | Secret for JWT tokens |
| `SMTP_HOST` | `smtp.gmail.com` | Email SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `your@email.com` | Email address |
| `SMTP_PASS` | `your-password` | Email password/app password |
| `TWILIO_ACCOUNT_SID` | `ACxxxxx` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | `xxxxx` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | `+1234567890` | Twilio phone number |

## Important Notes

⚠️ **Free Tier**: Service spins down after 15 min of inactivity (30-60s cold start)  
⚠️ **MongoDB**: Use Atlas connection string, not localhost  
⚠️ **Gmail**: Use App Passwords, not regular password  
⚠️ **Auto-Deploy**: Enabled by default on Git push

For detailed instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
