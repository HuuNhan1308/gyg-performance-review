# 🚀 Production Deployment Guide

## Customer Voice Dashboard - Deployment Instructions

This guide covers deploying the Customer Voice Dashboard to various production environments.

---

## 📋 Pre-Deployment Checklist

- [ ] Set up Google Gemini API key
- [ ] Test the application locally
- [ ] Prepare your production Excel file (`uploads/test.xlsx`)
- [ ] Review environment variables
- [ ] Choose your deployment platform

---

## 🔧 Environment Setup

### Required Environment Variables

```bash
PORT=3000                          # Server port
NODE_ENV=production               # Environment mode
GEMINI_API_KEY=your_api_key_here  # Google Gemini API key
CORS_ORIGIN=*                     # CORS origin (set to your domain)
```

### Get Google Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Create API key
4. Copy the key for deployment

---

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Easiest)

**Why Railway:**
- ✅ Free tier available
- ✅ Automatic deployments from Git
- ✅ Built-in PostgreSQL (if needed later)
- ✅ Easy environment variables
- ✅ Custom domains

**Steps:**

1. **Sign up at [Railway.app](https://railway.app/)**

2. **Create New Project**
   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize
   railway init
   ```

3. **Connect GitHub Repository**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js

4. **Set Environment Variables**
   - Go to project settings → Variables
   - Add:
     - `GEMINI_API_KEY`
     - `NODE_ENV=production`
     - `PORT=3000`

5. **Deploy**
   - Railway auto-deploys on push to main
   - Get your URL: `https://your-app.up.railway.app`

6. **Upload Default File**
   - Use Railway's file system or mount a volume
   - Upload `test.xlsx` to `/uploads/`

---

### Option 2: Heroku

**Why Heroku:**
- ✅ Mature platform
- ✅ Good documentation
- ✅ Add-ons ecosystem
- ⚠️ No free tier anymore ($7/month minimum)

**Steps:**

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create customer-voice-dashboard
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set GEMINI_API_KEY=your_api_key_here
   heroku config:set NODE_ENV=production
   ```

4. **Create `Procfile`** (already created below)

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

7. **Upload Files**
   ```bash
   # Upload your test file
   heroku ps:exec
   mkdir -p uploads
   # Then use SCP or Heroku's file upload
   ```

---

### Option 3: Vercel

**Why Vercel:**
- ✅ Excellent for Next.js/React
- ✅ Free tier with good limits
- ✅ Automatic HTTPS
- ⚠️ Serverless (need to adjust for persistent uploads)

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Create `vercel.json`** (already created below)

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add NODE_ENV production
   ```

5. **Note on File Uploads**
   - Vercel is serverless, so file uploads are ephemeral
   - Consider using external storage (S3, Cloudinary)
   - Or use Vercel Blob Storage

---

### Option 4: DigitalOcean App Platform

**Why DigitalOcean:**
- ✅ $5/month tier available
- ✅ Full control
- ✅ Persistent storage
- ✅ Good performance

**Steps:**

1. **Go to [DigitalOcean](https://www.digitalocean.com/)**

2. **Create App**
   - Click "Create" → "Apps"
   - Connect GitHub repository
   - Select branch (main/production)

3. **Configure**
   - Build Command: `npm install`
   - Run Command: `npm start`
   - HTTP Port: `3000`

4. **Environment Variables**
   - Add in App Settings:
     - `GEMINI_API_KEY`
     - `NODE_ENV=production`

5. **Add Persistent Storage**
   - Create volume for `/uploads`
   - Mount point: `/uploads`

6. **Deploy**
   - Click "Create Resources"
   - Wait for build and deployment

---

### Option 5: AWS EC2 (Advanced)

**Why AWS:**
- ✅ Full control
- ✅ Scalable
- ✅ Industry standard
- ⚠️ More complex setup
- ⚠️ Requires server management

**Steps:**

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (1 GB RAM, 1 vCPU)
   - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/customer-voice-dashboard.git
   cd customer-voice-dashboard
   npm install
   ```

5. **Set Environment Variables**
   ```bash
   nano .env
   # Add your variables
   ```

6. **Start with PM2**
   ```bash
   pm2 start server.js --name customer-voice-dashboard
   pm2 save
   pm2 startup
   ```

7. **Set up Nginx (optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/dashboard
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 📁 Required Files for Deployment

### Procfile (for Heroku)
```
web: npm start
```

### vercel.json (for Vercel)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### ecosystem.config.js (for PM2 on VPS)
```javascript
module.exports = {
  apps: [{
    name: 'customer-voice-dashboard',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to Git
   - Use platform's secret management
   - Rotate API keys regularly

2. **HTTPS**
   - Always use HTTPS in production
   - Most platforms provide this automatically
   - For custom domains, use Let's Encrypt

3. **CORS**
   - Set `CORS_ORIGIN` to your frontend domain
   - Don't use `*` in production

4. **File Uploads**
   - Limit file size (already set to 50MB)
   - Validate file types
   - Consider virus scanning for public deployments

5. **Rate Limiting**
   - Consider adding rate limiting for API routes
   - Protect translation endpoint from abuse

---

## 📊 Monitoring & Logging

### Logging

The app uses console logging. For production:

**Option 1: Winston (File Logging)**
```bash
npm install winston
```

**Option 2: Platform Logging**
- Railway: Built-in logs in dashboard
- Heroku: `heroku logs --tail`
- Vercel: Real-time logs in dashboard
- AWS: CloudWatch

### Monitoring

**Free Options:**
- UptimeRobot: https://uptimerobot.com/
- Pingdom Free: https://www.pingdom.com/
- StatusCake: https://www.statuscake.com/

**Paid Options:**
- Datadog
- New Relic
- Sentry (for error tracking)

---

## 🧪 Testing Before Deployment

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env
# Edit .env with your values

# 3. Test locally
npm start

# 4. Test in production mode
npm run prod

# 5. Check endpoints
curl http://localhost:3000/
curl http://localhost:3000/api/dashboard/load-default
```

---

## 🚨 Troubleshooting

### "Cannot find module '@google/generative-ai'"
```bash
npm install @google/generative-ai
```

### "GEMINI_API_KEY not configured"
- Check environment variables on platform
- Ensure `.env` file exists locally
- Verify API key is valid

### "File upload failed"
- Check `/uploads` directory exists
- Ensure write permissions
- Verify disk space

### "Port already in use"
```bash
# Find process using port
lsof -i :3000
# Kill it
kill -9 PID
```

### Build fails on platform
- Check Node.js version (>=18.0.0)
- Verify `package.json` is valid
- Check platform logs for specific errors

---

## 📈 Performance Optimization

1. **Enable Compression** (✅ Already added)
2. **Use CDN** for static assets
3. **Implement Caching** for API responses
4. **Optimize Excel Processing** for large files
5. **Consider Redis** for translation cache in multi-instance setups

---

## 🔄 CI/CD Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ production ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test # if you have tests
      # Add deployment steps for your platform
```

---

## 📞 Support

If you encounter issues:
1. Check platform documentation
2. Review error logs
3. Verify environment variables
4. Test locally first
5. Check API quotas (Gemini API)

---

## 🎉 Post-Deployment

- [ ] Test all features
- [ ] Upload your Excel file
- [ ] Test AI translation
- [ ] Share URL with team
- [ ] Set up monitoring
- [ ] Document custom domain setup (if applicable)
- [ ] Schedule regular backups

---

**Recommended Platform for Your Use Case:**
- **Small team, quick setup**: Railway
- **Enterprise, need control**: AWS EC2 or DigitalOcean
- **Already using Heroku**: Heroku
- **Static + API**: Vercel (with external storage)

Good luck with your deployment! 🚀

