'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { toast } from '@/components/Toast'
import { formatDate } from '@/lib/utils'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Star,
  ChevronRight,
  Globe,
  User,
  Edit,
  Trash2,
  Share2,
  Heart,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'

type Seminar = {
  id: string
  title: string
  description: string
  category: string
  level: string
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  location: string | null
  online_link: string | null
  format: string
  max_participants: number | null
  status: string
  created_by: string
  curriculum: any
  instructor: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  }
  sessions: any[]
  participant_count: number
}

export default function SeminarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [seminar, setSeminar] = useState<Seminar | null>(null)
  const [loading, setLoading] = useState(true)
  const [isJoined, setIsJoined] = useState(false)
  const [joining, setJoining] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'sessions' | 'reviews'>('overview')

  useEffect(() => {
    if (params.id) {
      fetchSeminar()
      checkJoinStatus()
    }
  }, [params.id])

  const fetchSeminar = async () => {
    try {
      const response = await fetch(`/api/seminars/${params.id}`)
      
      if (!response.ok) {
        throw new Error('세미나를 찾을 수 없습니다')
      }

      const data = await response.json()
      setSeminar(data)
    } catch (error) {
      console.error('Error fetching seminar:', error)
      toast.error('세미나 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const checkJoinStatus = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/seminars/${params.id}/participants/${user.id}`)
      setIsJoined(response.ok)
    } catch (error) {
      console.error('Error checking join status:', error)
    }
  }

  const handleJoin = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다')
      router.push('/login')
      return
    }

    setJoining(true)
    try {
      const response = await fetch(`/api/seminars/${params.id}/join`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      setIsJoined(true)
      toast.success('세미나에 참가 신청되었습니다!')
      fetchSeminar() // 참가자 수 업데이트
    } catch (error: any) {
      toast.error(error.message || '참가 신청에 실패했습니다')
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    setJoining(true)
    try {
      const response = await fetch(`/api/seminars/${params.id}/join`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('참가 취소에 실패했습니다')
      }

      setIsJoined(false)
      toast.success('세미나 참가가 취소되었습니다')
      fetchSeminar() // 참가자 수 업데이트
    } catch (error) {
      toast.error('참가 취소에 실패했습니다')
    } finally {
      setJoining(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 세미나를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/seminars/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('세미나 삭제에 실패했습니다')
      }

      toast.success('세미나가 삭제되었습니다')
      router.push('/seminars')
    } catch (error) {
      toast.error('세미나 삭제에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
          <div className="container-custom py-12">
            <div className="animate-pulse">
              <div className="h-64 md:h-96 bg-gray-200 rounded-2xl mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-full md:w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full md:w-3/4"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!seminar) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
          <div className="container-custom py-12">
            <div className="text-center px-4">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">세미나를 찾을 수 없습니다</h2>
              <Link href="/seminars">
                <Button className="mt-4">세미나 목록으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const isInstructor = user?.id === seminar.created_by
  const isFull = seminar.max_participants ? seminar.participant_count >= seminar.max_participants : false

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section - 반응형 높이 조정 */}
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden mt-16">
        <div className="absolute inset-0">
          {seminar.cover_image ? (
            <img
              src={seminar.cover_image}
              alt={seminar.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative container-custom h-full flex items-end pb-12">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                {seminar.category}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                {seminar.level === 'beginner' ? '입문' : seminar.level === 'intermediate' ? '중급' : '고급'}
              </span>
              {seminar.status === 'ongoing' && (
                <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm rounded-full text-sm">
                  진행중
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{seminar.title}</h1>
            <p className="text-base md:text-lg opacity-90 max-w-3xl">{seminar.description}</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-4 md:py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs - 모바일에서 스크롤 가능 */}
            <div className="bg-white rounded-xl shadow-soft p-1">
              <div className="flex space-x-1 overflow-x-auto">
                {['overview', 'curriculum', 'sessions', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab === 'overview' && '개요'}
                    {tab === 'curriculum' && '커리큘럼'}
                    {tab === 'sessions' && '세션'}
                    {tab === 'reviews' && '리뷰'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content - 모바일 패딩 조정 */}
            <div className="bg-white rounded-xl shadow-soft p-4 md:p-6 lg:p-8">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-4">세미나 소개</h2>
                    <p className="text-gray-700 leading-relaxed">{seminar.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">세부 정보</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">일정</p>
                          <p className="text-sm text-gray-600">
                            {seminar.start_date && formatDate(seminar.start_date)} ~ {seminar.end_date && formatDate(seminar.end_date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">참가자</p>
                          <p className="text-sm text-gray-600">
                            {seminar.participant_count} / {seminar.max_participants || '제한없음'}
                          </p>
                        </div>
                      </div>

                      {seminar.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">장소</p>
                            <p className="text-sm text-gray-600">{seminar.location}</p>
                          </div>
                        </div>
                      )}

                      {seminar.online_link && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">온라인</p>
                            <a href={seminar.online_link} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline">
                              접속 링크
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && seminar.curriculum && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">커리큘럼</h2>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6">
                      <h3 className="font-semibold text-blue-900 mb-2">개요</h3>
                      <p className="text-blue-800">{seminar.curriculum.overview}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">학습 목표</h3>
                        <ul className="space-y-2">
                          {seminar.curriculum.objectives?.map((obj: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">평가 방법</h3>
                        <div className="space-y-2">
                          {seminar.curriculum.evaluation && Object.entries(seminar.curriculum.evaluation).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-700 capitalize">
                                {key === 'attendance' ? '출석' :
                                 key === 'assignments' ? '과제' :
                                 key === 'project' ? '프로젝트' :
                                 key === 'participation' ? '참여도' : key}
                              </span>
                              <span className="font-medium">{String(value)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">세션 일정</h2>
                  {seminar.sessions && seminar.sessions.length > 0 ? (
                    seminar.sessions.map((session: any, index: number) => (
                      <div key={session.id} className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{session.session_number}주차: {session.title}</h3>
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-sm">{session.description}</p>
                        {session.materials && session.materials.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {session.materials.map((material: string, idx: number) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {material}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : seminar.curriculum?.sessions ? (
                    seminar.curriculum.sessions.map((session: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{session.week}주차: {session.title}</h3>
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-sm">{session.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">세션 정보가 없습니다.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">수강 리뷰</h2>
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">아직 리뷰가 없습니다</p>
                    <p className="text-sm text-gray-400 mt-2">첫 리뷰를 작성해보세요!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 모바일에서는 하단에 표시 */}
          <div className="space-y-4 md:space-y-6 lg:sticky lg:top-20">
            {/* Instructor Card */}
            <div className="bg-white rounded-xl shadow-soft p-4 md:p-6">
              <h3 className="font-semibold mb-4">강사 정보</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                  {seminar.instructor.avatar_url ? (
                    <img
                      src={seminar.instructor.avatar_url}
                      alt={seminar.instructor.name}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{seminar.instructor.name}</p>
                  <p className="text-sm text-gray-600">{seminar.instructor.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm text-gray-600 ml-2">4.5 (23 리뷰)</span>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-soft p-4 md:p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text mb-2">
                    {seminar.participant_count} / {seminar.max_participants || '∞'}
                  </p>
                  <p className="text-sm text-gray-600">참가자</p>
                </div>

                {isInstructor ? (
                  <>
                    <Link href={`/seminar/${params.id}/edit`}>
                      <Button className="w-full btn-gradient mb-2">
                        <Edit className="h-5 w-5 mr-2" />
                        세미나 수정
                      </Button>
                    </Link>
                    <Link href={`/seminar/${params.id}/manage`}>
                      <Button variant="outline" className="w-full mb-2">
                        <Users className="h-5 w-5 mr-2" />
                        참가자 관리
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      세미나 삭제
                    </Button>
                  </>
                ) : (
                  <>
                    {isJoined ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleLeave}
                        loading={joining}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        참가 취소
                      </Button>
                    ) : (
                      <Button
                        className="w-full btn-gradient"
                        onClick={handleJoin}
                        loading={joining}
                        disabled={isFull}
                      >
                        {isFull ? (
                          <>정원 마감</>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            세미나 참가하기
                          </>
                        )}
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Heart className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}

                {seminar.status === 'draft' && (
                  <p className="text-xs text-center text-gray-500">
                    * 아직 준비중인 세미나입니다
                  </p>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="font-semibold mb-4">빠른 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>총 {seminar.sessions?.length || seminar.curriculum?.sessions?.length || 0}개 세션</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>주 1회 진행</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>수료증 발급</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}