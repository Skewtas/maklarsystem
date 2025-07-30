import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: string
    }
    supabaseAccessToken?: string
  }

  interface User {
    id: string
    email: string
    name?: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

export type UserRole = 'admin' | 'agent' | 'coordinator' | 'assistant'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: UserRole
} 