# OAuth Authentication Setup Guide

This guide will help you set up OAuth authentication for your Massachusetts Pension Estimator application.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

## 1. Generate NextAuth Secret

Generate a secure secret for NextAuth.js:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

## 2. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set the application type to "Web application"
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
8. Copy the Client ID and Client Secret to your `.env.local` file

## 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: "Massachusetts Pension Estimator"
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Add both to your `.env.local` file

## 4. Production Setup

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain
2. Update OAuth app settings with production URLs
3. Ensure all environment variables are set in your hosting platform

## 5. Testing Authentication

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign In" in the header
4. Test both Google and GitHub authentication flows

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong, unique secrets for production
- Regularly rotate your OAuth credentials
- Monitor your OAuth app usage in the respective consoles

## Troubleshooting

### Common Issues:

1. **"OAuth app not found"**: Check your Client ID and Secret
2. **"Redirect URI mismatch"**: Ensure your callback URLs match exactly
3. **"Invalid client"**: Verify your OAuth app is properly configured
4. **"Access denied"**: Check your OAuth consent screen configuration

### Debug Mode:

Add `debug: true` to your NextAuth configuration for detailed logs:

```typescript
const handler = NextAuth({
  debug: true, // Add this for debugging
  providers: [
    // ... your providers
  ],
})
``` 