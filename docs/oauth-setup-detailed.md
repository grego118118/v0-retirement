# Complete OAuth Setup Guide for Massachusetts Pension Estimator

## Prerequisites
- A Google account
- A GitHub account
- Access to Google Cloud Console
- Your local development server running at `http://localhost:3000`

## Step 1: Generate a Secure NextAuth Secret

First, generate a secure secret for NextAuth.js:

```bash
# Option 1: Using OpenSSL (if available)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using PowerShell
[System.Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

Copy the generated string and update your `.env.local` file:
```
NEXTAUTH_SECRET=your-generated-secret-here
```

## Step 2: Set Up Google OAuth

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "New Project"
4. Name your project: "MA Pension Estimator" (or similar)
5. Click "Create"

### 2.2 Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 2.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Massachusetts Pension Estimator
   - **User support email**: Your email
   - **App logo**: Optional
   - **Application home page**: http://localhost:3000 (for now)
   - **Application privacy policy**: http://localhost:3000/privacy (optional)
   - **Application terms of service**: http://localhost:3000/terms (optional)
   - **Authorized domains**: Leave empty for now
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Select these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
8. Click "Update" then "Save and Continue"
9. Skip test users for now and click "Save and Continue"

### 2.4 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Select "Web application" as the application type
4. Name: "MA Pension Estimator Web Client"
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3000`
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/api/auth/callback/google`
7. Click "Create"
8. **IMPORTANT**: Copy the Client ID and Client Secret immediately

### 2.5 Update Your Environment Variables

Update your `.env.local` file:
```
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-google-client-secret
```

## Step 3: Set Up GitHub OAuth

### 3.1 Create a GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/profile)
2. Scroll down to "Developer settings" in the left sidebar
3. Click "OAuth Apps"
4. Click "New OAuth App"
5. Fill in the form:
   - **Application name**: Massachusetts Pension Estimator
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: A pension calculator for Massachusetts state employees
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
6. Click "Register application"

### 3.2 Get Your Credentials

1. After creating the app, you'll see your **Client ID**
2. Click "Generate a new client secret"
3. **IMPORTANT**: Copy the client secret immediately (it won't be shown again)

### 3.3 Update Your Environment Variables

Update your `.env.local` file:
```
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

## Step 4: Final Environment File

Your complete `.env.local` file should look like this:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-32-character-secret

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-actualGoogleClientSecret

# GitHub OAuth
GITHUB_ID=Ov23liABCDEFGHIJKLMN
GITHUB_SECRET=actualGitHubClientSecretHere
```

## Step 5: Test Your Setup

1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev`
3. Go to `http://localhost:3000`
4. Click "Sign In"
5. Try both Google and GitHub sign-in options

## Troubleshooting

### "Error 401: invalid_client"
- Double-check your Client ID and Secret are copied correctly
- Ensure there are no extra spaces or line breaks
- Make sure you're using the correct callback URLs

### "Redirect URI mismatch"
- The callback URL must match EXACTLY what you configured
- Check for http vs https
- Check for trailing slashes
- Ensure port number matches (3000 vs 3001)

### "Access blocked: Authorization Error"
- Make sure your OAuth consent screen is properly configured
- For Google, you may need to add test users while in development
- Check that required APIs are enabled

### Different Port Issues
If your app runs on port 3001 instead of 3000:
1. Update `.env.local`: `NEXTAUTH_URL=http://localhost:3001`
2. Update OAuth callback URLs to use port 3001
3. Update authorized JavaScript origins to use port 3001

## Production Deployment

When deploying to production:
1. Update `NEXTAUTH_URL` to your production domain
2. Generate a new, secure `NEXTAUTH_SECRET`
3. Add production URLs to your OAuth apps:
   - Google: Add production domain to authorized origins and callback URLs
   - GitHub: Create a separate OAuth app for production
4. Update environment variables in your hosting platform

## Security Notes

- **NEVER** commit `.env.local` to Git
- **NEVER** share your client secrets publicly
- Use different OAuth apps for development and production
- Regularly rotate your secrets
- Monitor OAuth app usage in the respective dashboards 