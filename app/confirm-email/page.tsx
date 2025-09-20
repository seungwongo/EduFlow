'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { toast } from '@/components/Toast'
import { Mail } from 'lucide-react'

export default function ConfirmEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirmEmail = async () => {
    if (!email) {
      toast.error('이메일을 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '이메일 확인에 실패했습니다')
      }

      toast.success(result.message)
      setEmail('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">이메일 확인</h2>
            <p className="text-gray-600 mt-2">
              개발 환경용: 이메일 확인을 수동으로 완료합니다
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="email@example.com"
              />
            </div>

            <Button
              onClick={handleConfirmEmail}
              loading={loading}
              className="w-full"
            >
              이메일 확인 완료하기
            </Button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>주의:</strong> 이 페이지는 개발 환경에서만 사용하세요. 
              실제 운영 환경에서는 이메일 인증 링크를 통해 확인해야 합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}