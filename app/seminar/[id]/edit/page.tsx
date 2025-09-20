'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/Button'
import { toast } from '@/components/Toast'
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Upload,
  Save,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'

const seminarSchema = z.object({
  title: z.string().min(5, '제목은 최소 5자 이상이어야 합니다'),
  description: z.string().min(20, '설명은 최소 20자 이상이어야 합니다'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  max_participants: z.number().min(1).max(500),
  start_date: z.string().min(1, '시작일을 선택해주세요'),
  end_date: z.string().min(1, '종료일을 선택해주세요'),
  location: z.string().optional(),
  online_link: z.string().optional(),
  format: z.enum(['offline', 'online', 'hybrid']),
  status: z.enum(['draft', 'published', 'ongoing', 'completed']),
})

type SeminarFormData = z.infer<typeof seminarSchema>

export default function EditSeminarPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [seminar, setSeminar] = useState<any>(null)
  const [coverImage, setCoverImage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<SeminarFormData>({
    resolver: zodResolver(seminarSchema),
  })

  const format = watch('format')

  useEffect(() => {
    if (params.id) {
      fetchSeminar()
    }
  }, [params.id])

  const fetchSeminar = async () => {
    try {
      const response = await fetch(`/api/seminars/${params.id}`)
      
      if (!response.ok) {
        throw new Error('세미나를 찾을 수 없습니다')
      }

      const data = await response.json()
      
      // 권한 체크
      if (data.created_by !== user?.id) {
        toast.error('수정 권한이 없습니다')
        router.push(`/seminar/${params.id}`)
        return
      }

      setSeminar(data)
      setCoverImage(data.cover_image || '')
      
      // 폼 데이터 설정
      reset({
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        max_participants: data.max_participants,
        start_date: data.start_date ? data.start_date.split('T')[0] : '',
        end_date: data.end_date ? data.end_date.split('T')[0] : '',
        location: data.location || '',
        online_link: data.online_link || '',
        format: data.format || 'offline',
        status: data.status || 'draft',
      })
    } catch (error) {
      console.error('Error fetching seminar:', error)
      toast.error('세미나 정보를 불러오는데 실패했습니다')
      router.push('/seminars')
    } finally {
      setFetching(false)
    }
  }

  const onSubmit = async (data: SeminarFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/seminars/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          cover_image: coverImage
        }),
      })

      if (!response.ok) {
        throw new Error('세미나 수정에 실패했습니다')
      }

      toast.success('세미나가 성공적으로 수정되었습니다!')
      router.push(`/seminar/${params.id}`)
    } catch (error: any) {
      toast.error(error.message || '세미나 수정에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!seminar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container-custom py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">세미나를 찾을 수 없습니다</h2>
            <Button onClick={() => router.push('/seminars')}>
              세미나 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container-custom py-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push(`/seminar/${params.id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5" />
              세미나로 돌아가기
            </button>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              세미나 수정하기
            </h1>
            <p className="text-gray-600">
              세미나 정보를 수정하고 업데이트하세요
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세미나 제목 *
              </label>
              <input
                {...register('title')}
                type="text"
                className="input-field"
                placeholder="예: AI 기초부터 실전까지 8주 완성"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세미나 설명 *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="input-field"
                placeholder="세미나의 목적, 대상, 학습 내용 등을 자세히 설명해주세요"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  {...register('category')}
                  className="input-field"
                >
                  <option value="">선택하세요</option>
                  <option value="programming">프로그래밍</option>
                  <option value="ai">인공지능/머신러닝</option>
                  <option value="data">데이터 분석</option>
                  <option value="design">디자인</option>
                  <option value="business">비즈니스</option>
                  <option value="marketing">마케팅</option>
                  <option value="language">외국어</option>
                  <option value="other">기타</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도 *
                </label>
                <select
                  {...register('level')}
                  className="input-field"
                >
                  <option value="beginner">입문</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일 *
                </label>
                <div className="relative">
                  <input
                    {...register('start_date')}
                    type="date"
                    className="input-field pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일 *
                </label>
                <div className="relative">
                  <input
                    {...register('end_date')}
                    type="date"
                    className="input-field pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                진행 방식 *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <label className="card cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    {...register('format')}
                    type="radio"
                    value="offline"
                    className="sr-only"
                  />
                  <div className={`text-center ${format === 'offline' ? 'text-blue-600' : ''}`}>
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <span className="font-medium">오프라인</span>
                  </div>
                </label>
                <label className="card cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    {...register('format')}
                    type="radio"
                    value="online"
                    className="sr-only"
                  />
                  <div className={`text-center ${format === 'online' ? 'text-blue-600' : ''}`}>
                    <Globe className="h-8 w-8 mx-auto mb-2" />
                    <span className="font-medium">온라인</span>
                  </div>
                </label>
                <label className="card cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    {...register('format')}
                    type="radio"
                    value="hybrid"
                    className="sr-only"
                  />
                  <div className={`text-center ${format === 'hybrid' ? 'text-blue-600' : ''}`}>
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <span className="font-medium">혼합</span>
                  </div>
                </label>
              </div>
            </div>

            {(format === 'offline' || format === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장소
                </label>
                <div className="relative">
                  <input
                    {...register('location')}
                    type="text"
                    className="input-field pl-10"
                    placeholder="예: 강남역 스터디룸"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {(format === 'online' || format === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  온라인 링크
                </label>
                <div className="relative">
                  <input
                    {...register('online_link')}
                    type="url"
                    className="input-field pl-10"
                    placeholder="예: https://zoom.us/..."
                  />
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 참가자 수 *
                </label>
                <div className="relative">
                  <input
                    {...register('max_participants', { valueAsNumber: true })}
                    type="number"
                    className="input-field pl-10"
                    min="1"
                    max="500"
                  />
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.max_participants && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태 *
                </label>
                <select
                  {...register('status')}
                  className="input-field"
                >
                  <option value="draft">준비중</option>
                  <option value="published">모집중</option>
                  <option value="ongoing">진행중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                커버 이미지 URL
              </label>
              <div className="relative">
                <input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  type="url"
                  className="input-field pl-10"
                  placeholder="https://example.com/image.jpg"
                />
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {coverImage && (
                <div className="mt-2">
                  <img src={coverImage} alt="커버 이미지 미리보기" className="h-32 rounded-lg object-cover" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/seminar/${params.id}`)}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="btn-gradient"
                loading={loading}
              >
                <Save className="h-5 w-5 mr-2" />
                수정 완료
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}