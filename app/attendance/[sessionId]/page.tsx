'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/Button'
import { toast } from '@/components/Toast'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  QrCode,
  Sparkles,
  RefreshCw,
  Copy,
  Download
} from 'lucide-react'

// QR 코드 컴포넌트 동적 임포트 (SSR 비활성화)
const QRCode = dynamic(() => import('react-qr-code'), { ssr: false })

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [isInstructor, setIsInstructor] = useState(false)
  const [attendanceCode, setAttendanceCode] = useState('')
  const [qrValue, setQrValue] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [checkStatus, setCheckStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (params.sessionId) {
      generateAttendanceCode()
      checkIfInstructor()
    }
  }, [params.sessionId])

  const generateAttendanceCode = () => {
    // 세션 ID와 날짜를 조합한 간단한 코드 생성
    const today = new Date().toISOString().split('T')[0]
    const code = `${params.sessionId}-${today}`.substring(0, 8).toUpperCase()
    setAttendanceCode(code)
    
    // QR 코드용 URL 생성
    const qrUrl = `${window.location.origin}/attendance/${params.sessionId}?code=${code}`
    setQrValue(qrUrl)
  }

  const checkIfInstructor = async () => {
    // 실제로는 세션 정보를 가져와서 강사인지 확인
    // 여기서는 간단히 URL 파라미터로 처리
    const urlParams = new URLSearchParams(window.location.search)
    setIsInstructor(urlParams.get('instructor') === 'true')
    
    // URL에 코드가 있으면 자동으로 입력
    const codeFromUrl = urlParams.get('code')
    if (codeFromUrl) {
      setInputCode(codeFromUrl)
    }
  }

  const handleAttendanceCheck = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다')
      router.push('/login')
      return
    }

    if (!inputCode.trim()) {
      toast.error('출석 코드를 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: params.sessionId,
          code: inputCode.toUpperCase()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setCheckStatus('success')
      toast.success('출석 체크가 완료되었습니다!')
      
      // 3초 후 세미나 페이지로 이동
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error: any) {
      setCheckStatus('error')
      toast.error(error.message || '출석 체크에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceCode)
    toast.success('출석 코드가 복사되었습니다')
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `attendance-qr-${params.sessionId}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  if (checkStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">출석 완료!</h1>
          <p className="text-gray-600">성공적으로 출석 체크되었습니다</p>
          <p className="text-sm text-gray-500 mt-4">잠시 후 대시보드로 이동합니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {isInstructor ? (
          // 강사 화면: QR 코드 생성
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold gradient-text mb-2">
                출석 체크 QR 코드
              </h1>
              <p className="text-gray-600">
                학생들이 스캔할 수 있도록 QR 코드를 보여주세요
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* QR 코드 */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                  {showQR && qrValue ? (
                    <QRCode
                      id="qr-code"
                      value={qrValue}
                      size={256}
                      level="H"
                    />
                  ) : (
                    <button
                      onClick={() => setShowQR(true)}
                      className="w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex flex-col items-center justify-center hover:from-blue-100 hover:to-indigo-100 transition-colors"
                    >
                      <QrCode className="h-16 w-16 text-blue-600 mb-4" />
                      <span className="text-blue-600 font-medium">QR 코드 생성하기</span>
                    </button>
                  )}
                </div>
                
                {showQR && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        generateAttendanceCode()
                        toast.success('QR 코드가 새로 생성되었습니다')
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      새로고침
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadQR}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      다운로드
                    </Button>
                  </div>
                )}
              </div>

              {/* 출석 코드 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">출석 코드</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="text-3xl font-mono font-bold text-center text-blue-600 mb-4">
                      {attendanceCode}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      코드 복사하기
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * 이 코드는 오늘 하루만 유효합니다
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">출석 현황</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">전체 참가자</span>
                      <span className="font-semibold">30명</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">출석</span>
                      <span className="font-semibold text-green-600">25명</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">미출석</span>
                      <span className="font-semibold text-red-600">5명</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 학생 화면: 출석 체크
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold gradient-text mb-2">
                출석 체크
              </h1>
              <p className="text-gray-600">
                강사가 제공한 출석 코드를 입력하세요
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출석 코드
                </label>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="input-field text-center text-2xl font-mono font-bold"
                  placeholder="XXXX-XXXX"
                  maxLength={8}
                />
              </div>

              <Button
                className="w-full btn-gradient"
                onClick={handleAttendanceCheck}
                loading={loading}
                disabled={!inputCode.trim() || checkStatus === 'success'}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                출석 체크하기
              </Button>

              {checkStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-5 w-5" />
                    <span>출석 체크에 실패했습니다. 코드를 다시 확인해주세요.</span>
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  QR 코드가 있다면 카메라로 스캔하세요
                </p>
                <button className="text-blue-600 hover:text-blue-700 text-sm mt-2">
                  QR 스캐너 열기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}