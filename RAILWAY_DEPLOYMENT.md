# 🚂 Railway Deployment Guide

## ✅ Issue Fixed!

Railway was detecting the project as Python because of the `requirements.txt` file (which was actually project documentation, not a Python requirements file).

### What We Fixed:
1. ✅ Renamed `requirements.txt` → `PROJECT_REQUIREMENTS.md`
2. ✅ Renamed `requirements_2..txt` → `DASHBOARD_REQUIREMENTS.md`
3. ✅ Added `railway.json` - Railway-specific configuration
4. ✅ Added `nixpacks.toml` - Build configuration for Nixpacks

Now Railway will correctly detect it as a **Node.js** project!

---

## 🚀 Quick Deploy to Railway

### Step 1: Sign Up / Login
Go to [Railway.app](https://railway.app/) and sign up with GitHub

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `gyg-performance-review`
4. Select branch: `production`

### Step 3: Configure Environment Variables
1. Go to your project → **Variables** tab
2. Add these variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=production
   PORT=3000
   ```

### Step 4: Deploy!
Railway will automatically:
- ✅ Detect it as Node.js
- ✅ Run `npm install`
- ✅ Start with `npm start` (from Procfile)
- ✅ Provide a public URL

---

## 📊 Expected Build Output

You should now see:

```
╭─────────────────╮
│ Railpack 0.15.2 │
╰─────────────────╯

↳ Detected Node.js
↳ Using npm
↳ Found web command in Procfile

Packages
──────────
nodejs  │  18.x.x  │  railpack default

Steps
──────────
▸ install
$ npm install

Deploy
──────────
$ npm start

Successfully prepared Railpack plan for build
```

---

## 🔧 Configuration Files

### `railway.json`
Tells Railway how to build and deploy the project.

### `nixpacks.toml`
Specifies Node.js version and build commands.

### `Procfile`
Defines the start command: `web: npm start`

### `package.json`
Contains all dependencies and scripts.

---

## 🎯 Post-Deployment Checklist

After successful deployment:

- [ ] Visit your Railway URL
- [ ] Check that dashboard loads
- [ ] Test file upload (or auto-load)
- [ ] Test AI translation
- [ ] Share URL with team

---

## 🐛 Troubleshooting

### Still detecting as Python?
1. Make sure you pushed the latest changes
2. In Railway, go to Settings → **Redeploy**
3. Check that `requirements.txt` doesn't exist in repo

### Build fails?
1. Check Railway logs
2. Verify environment variables are set
3. Ensure Node.js version is >=18.0.0

### App crashes on start?
1. Check `GEMINI_API_KEY` is set
2. Verify `uploads/test.xlsx` exists
3. Check Railway logs for errors

---

## 📝 Environment Variables

Required:
```bash
GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
```

Optional:
```bash
PORT=3000  # Railway sets this automatically
CORS_ORIGIN=*  # Or your specific domain
```

---

## 🔗 Useful Railway Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open dashboard
railway open
```

---

## 💰 Pricing

**Railway Free Tier:**
- ✅ $5 free credits per month
- ✅ Enough for 24/7 hosting
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ SSL certificates

**If you exceed free tier:**
- Pay only for what you use
- ~$5-10/month for small apps

---

## 🎉 Success!

Your Customer Voice Dashboard is now deployed on Railway!

**Your URL:** `https://your-project.up.railway.app`

Share it with your team and start analyzing complaints! 🚀

---

## 📞 Support

**Railway Issues:**
- Dashboard: https://railway.app/
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

**App Issues:**
- Check `DEPLOYMENT.md`
- Check `README.md`
- Review Railway logs

