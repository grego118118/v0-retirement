import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("NextAuth redirect callback:", { url, baseUrl })

      // Handle the callback URL properly
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`
        console.log("Redirecting to relative URL:", redirectUrl)
        return redirectUrl
      }

      // Allow same origin URLs
      if (new URL(url).origin === baseUrl) {
        console.log("Redirecting to same origin URL:", url)
        return url
      }

      // Default redirect to dashboard after successful sign in
      const defaultUrl = `${baseUrl}/dashboard`
      console.log("Redirecting to default URL:", defaultUrl)
      return defaultUrl
    },
    async session({ session, token }) {
      console.log("NextAuth session callback:", { session, token })

      // Add user ID to session if available
      if (token?.sub) {
        session.user.id = token.sub
        console.log("Set session.user.id to:", token.sub)
      } else {
        console.log("No token.sub available")
      }

      console.log("Final session object:", session)
      return session
    },
    async jwt({ token, account, profile }) {
      console.log("NextAuth JWT callback:", { token, account, profile })

      // Persist the OAuth account info to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("NextAuth signIn event:", { user, account, profile })
    },
    async signOut({ session, token }) {
      console.log("NextAuth signOut event:", { session, token })
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }
