# OAuth Setup Guide - Fix Authentication Error

You're seeing an authentication error because you need to set up real OAuth credentials. Here's how:

## 1. Create/Update `.env.local` file

Create a file named `.env.local` in your project root with:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=SGkGLOVKYJQ9D8VyRxBKhREf/knEnsJNkOHprlLWQ9I=

# Google OAuth
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# GitHub OAuth
GITHUB_ID=your-actual-github-client-id
GITHUB_SECRET=your-actual-github-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

## 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret

## 3. Get GitHub OAuth Credentials

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: `Mass Pension Estimator`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret

## 4. Update `.env.local`

Replace the placeholder values with your actual credentials.

## 5. Restart the server

After updating `.env.local`, restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

The authentication should now work properly! 