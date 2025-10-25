import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// NextAuth configuration for use in other parts of the application
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Handle user creation and token management
      if (user && account) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      // Admin role assignment via env var list
      const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
      const email = (token.email as string | undefined)?.toLowerCase()
      if (email && adminEmails.includes(email)) {
        ;(token as any).role = 'admin'
      }
      return token
    },
    async session({ session, token }) {
      // Pass token data to session
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        ;(session.user as any).role = (token as any).role
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
}
