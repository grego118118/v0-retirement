# OAuth Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Google OAuth

1. **Open Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing
3. **Enable API**: Search for "Google+ API" and enable it
4. **Create credentials**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add to Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Secret

### Step 2: GitHub OAuth

1. **Go to GitHub OAuth Apps**: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - Application name: `MA Pension Estimator`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. Click **"Generate a new client secret"**
6. Copy the Client ID and Secret

### Step 3: Update Your Credentials

Run this PowerShell script:
```powershell
.\setup-oauth.ps1
```

Or manually update `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=SGkGLOVKYJQ9D8VyRxBKhREf/knEnsJNkOHprlLWQ9I=
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-secret-here
GITHUB_ID=your-github-id-here
GITHUB_SECRET=your-github-secret-here
```

### Step 4: Restart and Test

```powershell
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

Visit http://localhost:3000 and click "Sign In"!

## ⚠️ Common Issues

### "Invalid Client" Error
- You're using placeholder values - follow steps above to get real credentials

### "Redirect URI mismatch"
- Make sure the callback URL matches EXACTLY (including http:// and port)

### Port 3001 instead of 3000?
- Update all URLs to use port 3001
- Update `NEXTAUTH_URL=http://localhost:3001` in `.env.local`

Need more help? See the [detailed guide](./oauth-setup-detailed.md) 