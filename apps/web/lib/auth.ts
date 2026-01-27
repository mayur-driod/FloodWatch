import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcrypt"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            roles: {
              include: { role: true },
            },
          },
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        if (!user.isActive) {
          throw new Error("Account is disabled")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        // Update lastSeen
        await prisma.user.update({
          where: { id: user.id },
          data: { lastSeen: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          roles: user.roles.map((r) => r.role.name),
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.roles = (user as { roles?: string[] }).roles || []
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.name = session.name
        token.image = session.image
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.roles = (token.roles as string[]) || []
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, handle account linking and role assignment
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { roles: true, accounts: true },
        })

        if (existingUser) {
          // Check if this OAuth account is already linked
          const existingAccount = existingUser.accounts.find(
            (acc) => acc.provider === account?.provider && acc.providerAccountId === account?.providerAccountId
          )

          // If the account isn't linked yet, link it
          if (!existingAccount && account) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state as string | null,
              },
            })
          }

          // Assign default "user" role if no roles exist
          if (existingUser.roles.length === 0) {
            const userRole = await prisma.role.findUnique({
              where: { name: "user" },
            })

            if (userRole) {
              await prisma.userRole.create({
                data: {
                  userId: existingUser.id,
                  roleId: userRole.id,
                },
              })
            }
          }

          // Update user info from OAuth profile if missing
          if (!existingUser.name || !existingUser.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: existingUser.name || user.name,
                image: existingUser.image || user.image,
              },
            })
          }
        }
      }

      return true
    },
  },
}
