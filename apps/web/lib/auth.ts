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
    async signIn({ user, account }) {
      // For OAuth providers, assign default "user" role if new user
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { roles: true },
        })

        if (existingUser && existingUser.roles.length === 0) {
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
      }

      return true
    },
  },
}
