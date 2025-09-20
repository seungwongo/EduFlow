'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const checkUser = useAuthStore((state) => state.checkUser)

  useEffect(() => {
    setMounted(true)
    checkUser()
  }, [checkUser])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}