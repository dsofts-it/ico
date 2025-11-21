# Render Deployment Guide

This guide will walk you through deploying your authentication backend to Render.

## Prerequisites

Before deploying, ensure you have:
- A GitHub account
- A Render account (sign up at [render.com](https://render.com))
- A MongoDB Atlas account for cloud database (sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

## Step 1: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Account** (if you haven't already)
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose the FREE tier (M0)
   - Select a cloud provider and region (preferably close to Singapore for Render)
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Your Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<username>` and `<password>` with your database user credentials

## Step 2: Push Code to GitHub

1. **Create a New GitHub Repository**
   - Go to [github.com](https://github.com)
   - Click the "+" icon → "New repository"
   - Name it (e.g., `ico-backend`)
   - Choose public or private
   - **Do NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

2. **Push Your Code**
   ```bash
   # Add the new remote (replace with your repository URL)
   git remote add origin https://github.com/YOUR_USERNAME/ico-backend.git
   
   # Verify the remote was added
   git remote -v
   
   # Push your code
   git push -u origin main
   ```

## Step 3: Deploy to Render

### Option A: Using render.yaml (Recommended - Infrastructure as Code)

1. **Connect Your Repository**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub account if not already connected
   - Select your `ico-backend` repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**
   - Render will show you the environment variables from `render.yaml`
   - Fill in the following values:
     - `MONGO_URI`: Your MongoDB Atlas connection string
     - `SMTP_HOST`: Your email SMTP host (e.g., `smtp.gmail.com`)
     - `SMTP_PORT`: SMTP port (e.g., `587`)
     - `SMTP_USER`: Your email address
     - `SMTP_PASS`: Your email password or app-specific password
     - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
     - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
     - `TWILIO_PHONE_NUMBER`: Your Twilio phone number
   - `JWT_SECRET` will be auto-generated

3. **Deploy**
   - Click "Apply"
   - Render will start building and deploying your service
   - Wait for the deployment to complete (usually 2-5 minutes)

### Option B: Manual Web Service Creation

1. **Create a New Web Service**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your `ico-backend` repository

2. **Configure the Service**
   - **Name**: `ico-backend` (or your preferred name)
   - **Region**: Singapore (or closest to your users)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

3. **Add Environment Variables**
   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable" for each:
     - `NODE_ENV` = `production`
     - `PORT` = `10000`
     - `MONGO_URI` = Your MongoDB Atlas connection string
     - `JWT_SECRET` = Generate a random string (e.g., use [randomkeygen.com](https://randomkeygen.com))
     - `SMTP_HOST` = Your SMTP host
     - `SMTP_PORT` = Your SMTP port
     - `SMTP_USER` = Your email
     - `SMTP_PASS` = Your email password
     - `TWILIO_ACCOUNT_SID` = Your Twilio SID
     - `TWILIO_AUTH_TOKEN` = Your Twilio token
     - `TWILIO_PHONE_NUMBER` = Your Twilio number

4. **Deploy**
   - Click "Create Web Service"
   - Render will start building and deploying
   - Wait for deployment to complete

## Step 4: Verify Deployment

1. **Check Service Status**
   - Once deployed, you'll see a green "Live" status
   - Your service URL will be: `https://ico-backend.onrender.com` (or similar)

2. **Test Your API**
   - Use the provided URL to test your endpoints
   - Example: `https://ico-backend.onrender.com/api/auth/signup`
   - You can use Postman or curl to test

3. **View Logs**
   - Click on "Logs" tab in Render dashboard
   - Check for any errors or issues
   - You should see "Server running on port 10000" and "MongoDB Connected"

## Important Notes

### Free Tier Limitations
- **Spin Down**: Free services spin down after 15 minutes of inactivity
- **Cold Start**: First request after spin down takes 30-60 seconds
- **Monthly Hours**: 750 hours/month (enough for one service)

### Environment Variables
- Never commit `.env` file to Git
- Always use Render's environment variable settings
- Update variables in Render dashboard if needed

### MongoDB Atlas
- Free tier has 512MB storage limit
- Connection string must allow connections from anywhere (0.0.0.0/0)
- Use strong passwords for database users

### Auto-Deploy
- Render automatically redeploys when you push to GitHub
- You can disable auto-deploy in service settings if needed

### Custom Domain (Optional)
- You can add a custom domain in Render dashboard
- Go to Settings → Custom Domains
- Follow the DNS configuration instructions

## Troubleshooting

### Service Won't Start
- Check logs for error messages
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

### Database Connection Failed
- Verify MongoDB Atlas network access allows 0.0.0.0/0
- Check database user credentials
- Ensure connection string format is correct

### Email/SMS Not Working
- Verify SMTP credentials are correct
- For Gmail, use App Passwords instead of regular password
- Check Twilio account balance and phone number verification

## Next Steps

After successful deployment:
1. Update your frontend to use the Render URL
2. Test all authentication flows (signup, login, OTP)
3. Monitor logs for any issues
4. Consider upgrading to paid plan for production use

## Support

- Render Documentation: [render.com/docs](https://render.com/docs)
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Twilio Docs: [twilio.com/docs](https://www.twilio.com/docs)
