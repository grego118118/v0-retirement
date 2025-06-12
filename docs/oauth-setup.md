# OAuth Authentication Setup Guide

This guide will help you set up OAuth authentication for your Massachusetts Pension Estimator application.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3001
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
7. Add authorized JavaScript origins:
   - `http://localhost:3001`
   - `http://10.0.0.119:3001` (replace with your actual IP)
   - `http://127.0.0.1:3001`
8. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google` (for development)
   - `http://10.0.0.119:3001/api/auth/callback/google` (replace with your actual IP)
   - `http://127.0.0.1:3001/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
9. Copy the Client ID and Client Secret to your `.env.local` file

### Important Notes for IP Address Access:
- Google OAuth requires explicit configuration for each IP address
- You must add your specific IP address (10.0.0.119) to both origins and redirect URIs
- If your IP address changes, you'll need to update the Google OAuth configuration
- For production, use HTTPS and domain names instead of IP addresses

## 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: "Massachusetts Pension Estimator"
   - Homepage URL: `http://localhost:3001` (for development)
   - Authorization callback URL: `http://localhost:3001/api/auth/callback/github`
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
2. Navigate to `http://localhost:3001` or `http://10.0.0.119:3001`
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
5. **"OAuth works on localhost but not IP address"**:
   - Add your IP address to Google OAuth authorized origins and redirect URIs
   - Update `NEXTAUTH_URL` in `.env.local` to match your current access method
   - Restart your development server after making changes

### IP Address Authentication Issues:

If authentication works on `http://localhost:3001` but fails on `http://10.0.0.119:3001`:

1. **Update Google OAuth Configuration**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to your OAuth 2.0 Client ID
   - Add `http://10.0.0.119:3001` to "Authorized JavaScript origins"
   - Add `http://10.0.0.119:3001/api/auth/callback/google` to "Authorized redirect URIs"

2. **Update Environment Variables**:
   - Set `NEXTAUTH_URL=http://10.0.0.119:3001` when accessing via IP
   - Or use the dynamic URL handling (already implemented in the auth configuration)

3. **Restart Development Server**:
   ```bash
   npm run dev
   ```

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