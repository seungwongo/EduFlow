'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/Button'
import { Bell, Menu, User, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!user) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
              EduFlow
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-gray-600 hover:text-gray-900 ${
                  pathname === '/dashboard' ? 'text-primary-600 font-medium' : ''
                }`}
              >
                대시보드
              </Link>
              <Link
                href="/seminars"
                className={`text-gray-600 hover:text-gray-900 ${
                  pathname === '/seminars' ? 'text-primary-600 font-medium' : ''
                }`}
              >
                세미나 목록
              </Link>
              {user.role === 'instructor' && (
                <Link
                  href="/seminar/create"
                  className={`text-gray-600 hover:text-gray-900 ${
                    pathname === '/seminar/create' ? 'text-primary-600 font-medium' : ''
                  }`}
                >
                  세미나 개설
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name || ''} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name || user.email}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    프로필
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    설정
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-3 space-y-2">
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-lg hover:bg-gray-100 ${
                  pathname === '/dashboard' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                대시보드
              </Link>
              <Link
                href="/seminars"
                className={`block px-3 py-2 rounded-lg hover:bg-gray-100 ${
                  pathname === '/seminars' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                세미나 목록
              </Link>
              {user.role === 'instructor' && (
                <Link
                  href="/seminar/create"
                  className={`block px-3 py-2 rounded-lg hover:bg-gray-100 ${
                    pathname === '/seminar/create' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  세미나 개설
                </Link>
              )}
              <hr className="my-2" />
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                프로필
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                로그아웃
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}