'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, checkUser } = useAuthStore()

  useEffect(() => {
    // Check user session on mount
    checkUser()
  }, [])

  useEffect(() => {
    // Redirect to login if not authenticated after checking
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}