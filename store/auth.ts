import { create } from 'zustand'

type User = {
  id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  role: 'admin' | 'instructor' | 'student'
}

type AuthState = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  checkUser: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  checkUser: async () => {
    try {
      // 서버 API를 통해 세션 확인
      const response = await fetch('/api/auth/session')
      
      if (response.ok) {
        const data = await response.json()
        set({ 
          user: data.user,
          loading: false 
        })
      } else {
        set({ user: null, loading: false })
      }
    } catch (error) {
      console.error('Error checking user:', error)
      set({ user: null, loading: false })
    }
  },
  signOut: async () => {
    try {
      // 서버 API를 통해 로그아웃
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // 로컬 스토리지 클리어
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      
      set({ user: null })
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },
}))