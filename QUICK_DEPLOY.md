# ⚡ Quick Deploy Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Get API Key (2 minutes)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy your API key ✅

### Step 2: Choose Platform & Deploy (3 minutes)

#### Option A: Railway (Recommended - Easiest!)

1. **Go to [Railway.app](https://railway.app/)**
2. **Click "Start a New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Authorize Railway to access your repo**
5. **Select this repository**
6. **Add environment variables:**
   - Go to Variables tab
   - Add: `GEMINI_API_KEY` = your_api_key
   - Add: `NODE_ENV` = production
7. **Deploy!** ✅

Your app will be live at: `https://your-app.up.railway.app`

---

#### Option B: Heroku

```bash
# 1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create your-app-name

# 4. Set API key
heroku config:set GEMINI_API_KEY=your_api_key_here
heroku config:set NODE_ENV=production

# 5. Deploy
git push heroku main

# 6. Open
heroku open
```

Done! ✅

---

#### Option C: Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Add API key when prompted
```

Done! ✅

---

### Step 3: Test Your Deployment

1. Visit your app URL
2. Upload an Excel file or wait for default to load
3. Click on a complaint to view details
4. Test AI translation
5. Share with your team! 🎉

---

## 🔧 After Deployment

### Upload Your Production Data

**If you have your own Excel file:**

1. Prepare your Excel file with required columns:
   - Supplier ID
   - Tour ID
   - Tour Title
   - Booking ID
   - Checkout Date
   - Source (Merged)
   - Tags (Merged)
   - Complaint Count
   - Conversation Text (Merged)

2. Upload via dashboard interface

**To set as default file:**

- Railway: Use volume/disk storage
- Heroku: Use Heroku exec to upload
- Vercel: Use Vercel Blob Storage
- See `DEPLOYMENT.md` for details

---

## 💡 Pro Tips

1. **Monitor your API usage** at https://makersuite.google.com/
2. **Set up uptime monitoring** with [UptimeRobot](https://uptimerobot.com/) (free)
3. **Add custom domain** in your platform settings
4. **Enable HTTPS** (automatic on most platforms)
5. **Back up your Excel files** regularly

---

## 🆘 Troubleshooting

### "API key not configured"
→ Add `GEMINI_API_KEY` in platform's environment variables

### "Application Error"
→ Check platform logs for details

### "File upload failed"
→ Ensure `/uploads` directory exists and has write permissions

### Need help?
→ Check `DEPLOYMENT.md` for detailed guides

---

## ✅ Quick Checklist

- [ ] API key obtained
- [ ] Platform chosen
- [ ] Repository pushed to GitHub
- [ ] Environment variables set
- [ ] App deployed
- [ ] App URL accessible
- [ ] Dashboard loads
- [ ] Translation works
- [ ] Team notified

---

## 🎯 Next Steps

1. ✅ Set up monitoring
2. ✅ Add custom domain (optional)
3. ✅ Train your team
4. ✅ Start analyzing complaints!

**Total Time: 5-10 minutes** ⏱️

Happy deploying! 🚀

