import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { query } from "../db/postgres"

// Custom adapter for PostgreSQL database sessions
const PostgreSQLAdapter = {
  async createUser(user: any) {
    console.log("Creating user:", user)
    try {
      const result = await query(
        "INSERT INTO users (id, email, created_at, updated_at) VALUES (gen_random_uuid(), $1, NOW(), NOW()) RETURNING *",
        [user.email]
      )
      return result.rows[0]
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  },

  async getUser(id: string) {
    console.log("Getting user by ID:", id)
    try {
      const result = await query("SELECT * FROM users WHERE id = $1", [id])
      return result.rows[0] || null
    } catch (error) {
      console.error("Error getting user:", error)
      return null
    }
  },

  async getUserByEmail(email: string) {
    console.log("Getting user by email:", email)
    try {
      const result = await query("SELECT * FROM users WHERE email = $1", [email])
      return result.rows[0] || null
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  },

  async getUserByAccount({ providerAccountId, provider }: any) {
    console.log("Getting user by account:", { providerAccountId, provider })
    try {
      const result = await query(
        `SELECT u.* FROM users u 
         JOIN accounts a ON u.id = a.user_id 
         WHERE a.provider_id = $1 AND a.provider_account_id = $2`,
        [provider, providerAccountId]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error("Error getting user by account:", error)
      return null
    }
  },

  async updateUser(user: any) {
    console.log("Updating user:", user)
    try {
      const result = await query(
        "UPDATE users SET email = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
        [user.id, user.email]
      )
      return result.rows[0]
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  },

  async linkAccount(account: any) {
    console.log("Linking account:", account)
    try {
      await query(
        `INSERT INTO accounts (user_id, provider_id, provider_type, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          account.userId,
          account.provider,
          account.type,
          account.providerAccountId,
          account.refresh_token,
          account.access_token,
          account.expires_at,
          account.token_type,
          account.scope,
          account.id_token,
        ]
      )
    } catch (error) {
      console.error("Error linking account:", error)
      throw error
    }
  },

  async createSession({ sessionToken, userId, expires }: any) {
    console.log("Creating session:", { sessionToken, userId, expires })
    try {
      const result = await query(
        "INSERT INTO sessions (session_token, user_id, expires) VALUES ($1, $2, $3) RETURNING *",
        [sessionToken, userId, expires]
      )
      return result.rows[0]
    } catch (error) {
      console.error("Error creating session:", error)
      throw error
    }
  },

  async getSessionAndUser(sessionToken: string) {
    console.log("Getting session and user:", sessionToken)
    try {
      const result = await query(
        `SELECT s.*, u.* FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.session_token = $1 AND s.expires > NOW()`,
        [sessionToken]
      )
      
      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      return {
        session: {
          sessionToken: row.session_token,
          userId: row.user_id,
          expires: row.expires,
        },
        user: {
          id: row.id,
          email: row.email,
          name: row.email, // Use email as name if no name field
        },
      }
    } catch (error) {
      console.error("Error getting session and user:", error)
      return null
    }
  },

  async updateSession({ sessionToken }: any) {
    console.log("Updating session:", sessionToken)
    try {
      const result = await query(
        "UPDATE sessions SET expires = $2 WHERE session_token = $1 RETURNING *",
        [sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] // 30 days
      )
      return result.rows[0]
    } catch (error) {
      console.error("Error updating session:", error)
      throw error
    }
  },

  async deleteSession(sessionToken: string) {
    console.log("Deleting session:", sessionToken)
    try {
      await query("DELETE FROM sessions WHERE session_token = $1", [sessionToken])
    } catch (error) {
      console.error("Error deleting session:", error)
      throw error
    }
  },
}

export const authOptions: NextAuthOptions = {
  adapter: PostgreSQLAdapter as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const result = await query("SELECT * FROM users WHERE email = $1", [credentials.email])

          if (!result.rows.length) {
            return null
          }

          const user = result.rows[0]

          if (!user || !user.password_hash) {
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split("@")[0],
          }
        } catch (error) {
          console.error("Error in authorize function:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
