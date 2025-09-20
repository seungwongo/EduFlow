'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/store/auth'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { toast } from '@/components/Toast'
import { formatDate } from '@/lib/utils'
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  Edit2,
  X,
  CheckCircle,
  Calendar,
  Star
} from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  bio: z.string().max(200, '소개는 200자 이내로 작성해주세요').optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal(''))
})

type ProfileFormData = z.infer<typeof profileSchema>

type ProfileData = {
  profile: {
    id: string
    name: string
    email: string
    bio: string | null
    avatar_url: string | null
    phone: string | null
    role: string
    created_at: string
  }
  stats: {
    created_seminars: number
    participating_seminars: number
    certificates: number
    total_hours: number
  }
  recent_activities: any[]
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, checkUser } = useAuthStore()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'seminars' | 'certificates'>('overview')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        throw new Error('프로필을 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setProfileData(data)
      
      // 폼 초기값 설정
      reset({
        name: data.profile.name || '',
        bio: data.profile.bio || '',
        phone: data.profile.phone || '',
        avatar_url: data.profile.avatar_url || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('프로필 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('프로필 수정에 실패했습니다')
      }

      toast.success('프로필이 수정되었습니다')
      setIsEditing(false)
      fetchProfile()
      checkUser() // Auth store 업데이트
    } catch (error) {
      toast.error('프로필 수정에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  if (!profileData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <p className="text-gray-600">프로필을 불러올 수 없습니다</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                {profileData.profile.avatar_url ? (
                  <img
                    src={profileData.profile.avatar_url}
                    alt={profileData.profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-white" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <Camera className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                  <div>
                    <input
                      {...register('name')}
                      type="text"
                      className="input-field text-2xl font-bold"
                      placeholder="이름"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <textarea
                      {...register('bio')}
                      rows={2}
                      className="input-field"
                      placeholder="간단한 소개를 작성해주세요"
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>

                  <div>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input-field"
                      placeholder="전화번호"
                    />
                  </div>

                  <div>
                    <input
                      {...register('avatar_url')}
                      type="url"
                      className="input-field"
                      placeholder="프로필 이미지 URL"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="btn-gradient"
                      loading={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        reset()
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      취소
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profileData.profile.name}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{profileData.profile.email}</p>
                  
                  {profileData.profile.bio && (
                    <p className="text-gray-700 mb-4">{profileData.profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {profileData.profile.role === 'instructor' ? '강사' : 
                       profileData.profile.role === 'admin' ? '관리자' : '학생'}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      가입일: {formatDate(profileData.profile.created_at)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container-custom py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">개설한 세미나</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {profileData.stats.created_seminars}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">참여중인 세미나</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {profileData.stats.participating_seminars}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">획득한 인증서</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {profileData.stats.certificates}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 학습 시간</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {profileData.stats.total_hours}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-soft">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {['overview', 'seminars', 'certificates'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' && '개요'}
                  {tab === 'seminars' && '세미나'}
                  {tab === 'certificates' && '인증서'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
                  {profileData.recent_activities.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.recent_activities.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{activity.seminars.title}</p>
                              <p className="text-sm text-gray-500">세미나 참가</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(activity.joined_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">최근 활동이 없습니다</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">스킬 & 관심사</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Node.js', 'Python', 'AI/ML'].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seminars' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">참여 세미나 목록</h3>
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">참여한 세미나가 표시됩니다</p>
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">획득한 인증서</h3>
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">아직 획득한 인증서가 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">세미나를 완료하면 인증서를 받을 수 있습니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}