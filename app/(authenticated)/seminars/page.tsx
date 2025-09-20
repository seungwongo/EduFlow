'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, Clock, MapPin, Star, ChevronRight, Search, Filter, Sparkles } from 'lucide-react'
import { Button } from '@/components/Button'
import { formatDate } from '@/lib/utils'

type Seminar = {
  id: string
  title: string
  description: string
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  status: 'draft' | 'published' | 'ongoing' | 'completed'
  max_participants: number | null
  created_by: string
  created_at: string
  instructor?: {
    name: string
    avatar_url: string | null
  }
  _count?: {
    participants: number
  }
}

export default function SeminarsPage() {
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchSeminars()
  }, [filterStatus, searchQuery])

  const fetchSeminars = async () => {
    try {
      // 서버 API를 통해 세미나 목록 가져오기
      const params = new URLSearchParams()
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      console.log('Fetching seminars with params:', params.toString())
      const response = await fetch(`/api/seminars?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || '세미나 목록을 불러오는데 실패했습니다')
      }

      const data = await response.json()
      console.log('Received seminars:', data.seminars?.length || 0)
      setSeminars(data.seminars || [])
    } catch (error) {
      console.error('Error fetching seminars:', error)
    } finally {
      setLoading(false)
    }
  }

  // 서버에서 이미 필터링된 결과를 사용
  const filteredSeminars = seminars

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-white rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                세미나 둘러보기
              </h1>
              <p className="text-gray-600">
                다양한 AI 세미나를 탐색하고 관심 있는 주제를 학습하세요
              </p>
            </div>
            <Link href="/seminar/create">
              <button className="btn-gradient">
                <Sparkles className="w-5 h-5 mr-2" />
                세미나 개설하기
              </button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="세미나 제목 또는 설명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterStatus('ongoing')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === 'ongoing' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                진행중
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === 'published' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                모집중
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seminars Grid */}
      <div className="container-custom py-12">
        {filteredSeminars.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSeminars.map((seminar) => (
              <Link key={seminar.id} href={`/seminar/${seminar.id}`}>
                <div className="group bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-2 cursor-pointer">
                  {/* Cover Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden">
                    {seminar.cover_image ? (
                      <img
                        src={seminar.cover_image}
                        alt={seminar.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm
                        ${seminar.status === 'ongoing' 
                          ? 'bg-green-500/80' 
                          : seminar.status === 'published'
                          ? 'bg-blue-500/80'
                          : 'bg-gray-500/80'}`}>
                        {seminar.status === 'ongoing' ? '진행중' :
                         seminar.status === 'published' ? '모집중' : '준비중'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {seminar.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {seminar.description || '세미나 설명이 없습니다.'}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-3">
                      {seminar.start_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(seminar.start_date)}</span>
                        </div>
                      )}
                      
                      {seminar.instructor && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                            {seminar.instructor.avatar_url ? (
                              <img 
                                src={seminar.instructor.avatar_url} 
                                alt={seminar.instructor.name}
                                className="w-full h-full rounded-full"
                              />
                            ) : (
                              <span className="text-white text-xs font-semibold">
                                {seminar.instructor.name?.charAt(0) || 'I'}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {seminar.instructor.name || '강사'}
                          </span>
                        </div>
                      )}

                      {seminar.max_participants && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>최대 {seminar.max_participants}명</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <Star className="h-4 w-4 text-gray-300" />
                          <span className="text-xs text-gray-500 ml-1">4.0</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                          <span>자세히 보기</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
              <Sparkles className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filterStatus !== 'all' 
                ? '검색 결과가 없습니다' 
                : '아직 등록된 세미나가 없습니다'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? '다른 키워드로 검색하거나 필터를 변경해보세요'
                : '첫 번째 세미나를 개설해보세요!'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link href="/seminar/create">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <Sparkles className="w-5 h-5 mr-2" />
                  세미나 개설하기
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}