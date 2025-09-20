'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/Button'
import { formatDate } from '@/lib/utils'
import { Calendar, Users, BookOpen, TrendingUp, Plus } from 'lucide-react'

type Seminar = {
  id: string
  title: string
  description?: string
  cover_image?: string | null
  start_date?: string | null
  end_date?: string | null
  status: string
  participant_count?: number
}

type DashboardData = {
  stats: {
    created: number
    participating: number
    completed: number
    certificates: number
  }
  mySeminars: Seminar[]
  participatingSeminars: any[]
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: { created: 0, participating: 0, completed: 0, certificates: 0 },
    mySeminars: [],
    participatingSeminars: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // 서버 API를 통해 대시보드 데이터 가져오기
      const response = await fetch('/api/dashboard')
      
      if (!response.ok) {
        throw new Error('대시보드 데이터를 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {user?.name || user?.email}님! 👋
        </h1>
        <p className="text-gray-600 mt-2">오늘도 성공적인 교육을 위해 EduFlow와 함께하세요.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">진행 중인 세미나</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.stats.created}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">참여 중인 세미나</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.stats.participating}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">이번 주 일정</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 출석률</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">92%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* My Seminars */}
      {user?.role === 'instructor' && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">내가 개설한 세미나</h2>
            <Link href="/seminar/create">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                새 세미나 개설
              </Button>
            </Link>
          </div>

          {dashboardData.mySeminars.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {dashboardData.mySeminars.map((seminar) => (
                <Link key={seminar.id} href={`/seminar/${seminar.id}`}>
                  <div className="card hover:shadow-xl transition-shadow cursor-pointer">
                    {seminar.cover_image && (
                      <img
                        src={seminar.cover_image}
                        alt={seminar.title}
                        className="w-full h-48 object-cover rounded-t-lg -m-6 mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {seminar.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {seminar.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {seminar.start_date ? formatDate(seminar.start_date) : '날짜 미정'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${seminar.status === 'ongoing' ? 'bg-green-100 text-green-700' : 
                          seminar.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'}`}>
                        {seminar.status === 'ongoing' ? '진행중' :
                         seminar.status === 'completed' ? '완료' : '준비중'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">아직 개설한 세미나가 없습니다.</p>
              <Link href="/seminar/create">
                <Button>첫 세미나 개설하기</Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Participating Seminars */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">참여 중인 세미나</h2>
          <Link href="/seminars">
            <Button variant="outline" size="sm">
              모든 세미나 보기
            </Button>
          </Link>
        </div>

        {dashboardData.participatingSeminars.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {dashboardData.participatingSeminars.map((seminar: any) => (
              <Link key={seminar.id} href={`/seminar/${seminar.id}`}>
                <div className="card hover:shadow-xl transition-shadow cursor-pointer">
                  {seminar.cover_image && (
                    <img
                      src={seminar.cover_image}
                      alt={seminar.title}
                      className="w-full h-48 object-cover rounded-t-lg -m-6 mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {seminar.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {seminar.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {seminar.start_date ? formatDate(seminar.start_date) : '날짜 미정'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${seminar.status === 'ongoing' ? 'bg-green-100 text-green-700' : 
                        seminar.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {seminar.status === 'ongoing' ? '진행중' :
                       seminar.status === 'completed' ? '완료' : '준비중'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">참여 중인 세미나가 없습니다.</p>
            <Link href="/seminars">
              <Button>세미나 둘러보기</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}