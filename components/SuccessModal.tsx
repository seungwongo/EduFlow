'use client'

import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  redirectTo?: string
  redirectDelay?: number
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  redirectTo,
  redirectDelay = 3000,
}: SuccessModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen && redirectTo) {
      const timer = setTimeout(() => {
        router.push(redirectTo)
      }, redirectDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, redirectTo, redirectDelay, router])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-scale-up">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto mb-6 relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center animate-pulse-slow">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-200 rounded-full animate-ping" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Title */}
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              {title}
            </h2>

            {/* Message */}
            <p className="mb-6 text-gray-600">
              {message}
            </p>

            {/* Progress bar for redirect */}
            {redirectTo && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">잠시 후 이동합니다...</p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{
                      animation: `progress ${redirectDelay}ms linear forwards`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Decorative gradient border */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}