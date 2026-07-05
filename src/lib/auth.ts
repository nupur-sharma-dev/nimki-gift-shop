import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt:        "consent",
          access_type:   "offline",
          response_type: "code",
        },
      },
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("No account found with this email.");
        }

        if (!user.password) {
          throw new Error(
            "This account uses Google sign-in. Please sign in with Google."
          );
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        if (!user.isActive) {
          throw new Error(
            "Your account has been deactivated. Please contact support."
          );
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in.");
        }

        return {
          id:            user.id,
          name:          user.name,
          email:         user.email,
          image:         user.image,
          role:          user.role as "USER" | "ADMIN",
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  callbacks: {
    // ── Sign-in guard ──────────────────────────────────────────────────────
    async signIn({ user, account }) {
      // Credentials flow — all checks already done in authorize()
      if (account?.provider === "credentials") return true;

      // Google OAuth flow
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser && !existingUser.isActive) {
            return "/login?error=AccountDeactivated";
          }

          return true;
        } catch {
          return false;
        }
      }

      return true;
    },

    // ── JWT — persist id + role into token ────────────────────────────────
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id            = user.id;
        token.role          = user.role ?? "USER";
        token.emailVerified = user.emailVerified ?? null;
      }

      // Re-fetch role if missing (e.g. OAuth user after server restart)
      if (!token.role && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where:  { id: token.id as string },
            select: { role: true, emailVerified: true },
          });
          if (dbUser) {
            token.role          = dbUser.role as "USER" | "ADMIN";
            token.emailVerified = dbUser.emailVerified;
          }
        } catch {
          // keep existing token as-is
        }
      }

      // Force re-fetch on explicit session update (e.g. role promotion)
      if (trigger === "update" && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where:  { id: token.id as string },
            select: { role: true, emailVerified: true },
          });
          if (dbUser) {
            token.role          = dbUser.role as "USER" | "ADMIN";
            token.emailVerified = dbUser.emailVerified;
          }
        } catch {
          // keep existing token as-is
        }
      }

      return token;
    },

    // ── Session — expose id + role to client ──────────────────────────────
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      if (account?.provider === "google" && isNewUser) {
        await prisma.user.update({
          where: { id: user.id },
          data:  {
            emailVerified: user.emailVerified ?? new Date(),
            isActive:      true,
          },
        });
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug:  process.env.NODE_ENV === "development",
};