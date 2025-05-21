import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Create the simplest possible NextAuth configuration
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see detailed logs
})

export { handler as GET, handler as POST }
