'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/Button'
import { toast } from '@/components/Toast'
import { SuccessModal } from '@/components/SuccessModal'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  passwordConfirm: z.string(),
  terms: z.boolean().refine(val => val === true, '이용약관에 동의해주세요'),
  privacy: z.boolean().refine(val => val === true, '개인정보처리방침에 동의해주세요'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    try {
      // 서버 API를 통해 회원가입 처리
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '회원가입에 실패했습니다')
      }

      // 성공 모달 표시
      setShowSuccessModal(true)
    } catch (error: any) {
      toast.error(error.message || '회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'kakao') => {
    setLoading(true)
    try {
      // 서버 API를 통해 소셜 회원가입 처리
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      // OAuth URL로 리디렉션
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error: any) {
      toast.error(`${provider} 회원가입에 실패했습니다`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary-600">
            EduFlow
          </Link>
          <p className="mt-2 text-gray-600">AI 세미나 관리 플랫폼에 가입하세요</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <div className="relative">
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="input-field pl-10"
                  placeholder="홍길동"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="input-field pl-10"
                  placeholder="email@example.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  {...register('passwordConfirm')}
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="passwordConfirm"
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  {...register('terms')}
                  type="checkbox"
                  className="mt-1 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700">이용약관</Link>에 동의합니다 (필수)
                </span>
              </label>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms.message}</p>
              )}

              <label className="flex items-start">
                <input
                  {...register('privacy')}
                  type="checkbox"
                  className="mt-1 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700">개인정보처리방침</Link>에 동의합니다 (필수)
                </span>
              </label>
              {errors.privacy && (
                <p className="text-sm text-red-600">{errors.privacy.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              회원가입
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSocialSignup('google')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 회원가입
              </button>

              <button
                onClick={() => handleSocialSignup('facebook')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook으로 회원가입
              </button>

              <button
                onClick={() => handleSocialSignup('kakao' as any)}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-[#FEE500] rounded-lg shadow-sm text-sm font-medium text-[#000000D9] hover:bg-[#FDD835]"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#000000" d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.939-.123.49.18.483.376.351.156-.103 2.466-1.674 3.464-2.353.541.08 1.1.12 1.67.12 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z"/>
                </svg>
                카카오로 회원가입
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">이미 계정이 있으신가요?</span>{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
              로그인
            </Link>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="회원가입 성공! 🎉"
        message="EduFlow에 오신 것을 환영합니다. 이제 로그인하여 다양한 세미나를 둘러보세요!"
        redirectTo="/login"
        redirectDelay={3000}
      />
    </div>
  )
}