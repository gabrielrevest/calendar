import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import AppleProvider from 'next-auth/providers/apple'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET ? [
      AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
      })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id || token.sub
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    },
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 jours par défaut
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/auth/signin',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

export async function getSession() {
  try {
    return await auth()
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}



