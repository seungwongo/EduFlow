'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { toast } from '@/components/Toast'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  Sparkles,
  ChevronRight,
  Upload,
  Globe,
  Loader2,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  GripVertical,
  FileText
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
})

type SeminarFormData = z.infer<typeof seminarSchema>

export default function CreateSeminarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [aiLoading, setAiLoading] = useState(false)
  const [curriculum, setCurriculum] = useState<any>(null)
  const [coverImage, setCoverImage] = useState<string>('')
  const [editMode, setEditMode] = useState(false)
  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null)
  const [isManualMode, setIsManualMode] = useState(false)
  const [editingOverview, setEditingOverview] = useState(false)
  const [editingObjectives, setEditingObjectives] = useState(false)
  const [editingRequirements, setEditingRequirements] = useState(false)
  const [editingEvaluation, setEditingEvaluation] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger
  } = useForm<SeminarFormData>({
    resolver: zodResolver(seminarSchema),
    defaultValues: {
      format: 'offline',
      level: 'beginner',
      max_participants: 30
    }
  })

  const format = watch('format')
  const startDate = watch('start_date')
  const endDate = watch('end_date')
  
  // 자동 저장 기능
  useEffect(() => {
    // 로컬 스토리지에서 저장된 데이터 불러오기
    const savedData = localStorage.getItem('seminar-draft')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.curriculum) {
          setCurriculum(parsed.curriculum)
        }
        if (parsed.formData) {
          Object.keys(parsed.formData).forEach(key => {
            setValue(key as any, parsed.formData[key])
          })
        }
        toast.info('임시 저장된 데이터를 불러왔습니다')
      } catch (error) {
        console.error('Failed to load saved data:', error)
      }
    }
  }, [setValue])
  
  // 커리큘럼 변경 시 자동 저장
  useEffect(() => {
    if (curriculum) {
      const formData = getValues()
      const dataToSave = {
        curriculum,
        formData,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('seminar-draft', JSON.stringify(dataToSave))
      setLastSaved(new Date())
    }
  }, [curriculum, getValues])
  
  // 세미나 생성 성공 시 임시 저장 데이터 삭제
  const clearDraft = () => {
    localStorage.removeItem('seminar-draft')
  }

  // 새 세션 추가를 위한 기본 템플릿
  const createEmptySession = (weekNumber: number) => ({
    week: weekNumber,
    title: '',
    description: '',
    objectives: ['', '', ''],
    materials: ['강의 슬라이드', '실습 자료', '참고 문헌'],
    assignment: ''
  })

  // AI 커리큘럼 생성
  const generateAICurriculum = async () => {
    setAiLoading(true)
    try {
      const formData = getValues()
      
      // 날짜 차이 계산
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      const response = await fetch('/api/ai/curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.title,
          duration,
          level: formData.level,
          description: formData.description
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI 커리큘럼 생성에 실패했습니다')
      }

      const data = await response.json()
      setCurriculum(data.curriculum)
      setEditMode(false)
      setIsManualMode(false)
      toast.success('AI 커리큘럼이 생성되었습니다! 필요시 수정하실 수 있습니다.')
    } catch (error: any) {
      toast.error(error.message || 'AI 커리큘럼 생성에 실패했습니다')
      console.error('AI curriculum error:', error)
    } finally {
      setAiLoading(false)
    }
  }

  // 수동으로 커리큘럼 생성 시작
  const startManualCurriculum = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / 7)
    
    const manualCurriculum = {
      overview: '',
      objectives: ['', '', '', ''],
      targetAudience: getValues('level') === 'beginner' ? '입문자' : getValues('level') === 'intermediate' ? '중급자' : '고급자',
      sessions: Array.from({ length: Math.min(weeks, 8) }, (_, i) => createEmptySession(i + 1)),
      requirements: ['', '', ''],
      evaluation: {
        attendance: 30,
        assignments: 30,
        project: 30,
        participation: 10
      }
    }
    
    setCurriculum(manualCurriculum)
    setIsManualMode(true)
    setEditMode(true)
    toast.info('수동으로 커리큘럼을 작성할 수 있습니다')
  }

  // 세션 추가
  const addSession = () => {
    if (!curriculum) return
    const newSession = createEmptySession(curriculum.sessions.length + 1)
    setCurriculum({
      ...curriculum,
      sessions: [...curriculum.sessions, newSession]
    })
    setEditingSessionIndex(curriculum.sessions.length)
  }

  // 세션 삭제
  const deleteSession = (index: number) => {
    if (!curriculum || !confirm('이 세션을 삭제하시겠습니까?')) return
    
    const newSessions = curriculum.sessions.filter((_: any, i: number) => i !== index)
    // 주차 번호 재정렬
    newSessions.forEach((session: any, i: number) => {
      session.week = i + 1
    })
    
    setCurriculum({
      ...curriculum,
      sessions: newSessions
    })
    toast.success('세션이 삭제되었습니다')
  }

  // 세션 순서 변경
  const moveSession = (index: number, direction: 'up' | 'down') => {
    if (!curriculum) return
    const sessions = [...curriculum.sessions]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= sessions.length) return
    
    // 순서 교체
    [sessions[index], sessions[newIndex]] = [sessions[newIndex], sessions[index]]
    
    // 주차 번호 재정렬
    sessions.forEach((session: any, i: number) => {
      session.week = i + 1
    })
    
    setCurriculum({
      ...curriculum,
      sessions
    })
  }

  // 세션 수정 저장
  const saveSessionEdit = (index: number, updatedSession: any) => {
    if (!curriculum) return
    
    const newSessions = [...curriculum.sessions]
    newSessions[index] = updatedSession
    
    setCurriculum({
      ...curriculum,
      sessions: newSessions
    })
    setEditingSessionIndex(null)
    toast.success('세션이 수정되었습니다')
  }

  // 커리큘럼 유효성 검사
  const validateCurriculum = () => {
    if (!curriculum) return false
    
    // 개요 확인
    if (!curriculum.overview || curriculum.overview.trim() === '') {
      toast.error('커리큘럼 개요를 입력해주세요')
      return false
    }
    
    // 학습 목표 확인
    const validObjectives = curriculum.objectives.filter((obj: string) => obj && obj.trim() !== '')
    if (validObjectives.length < 2) {
      toast.error('최소 2개 이상의 학습 목표를 입력해주세요')
      return false
    }
    
    // 평가 비중 확인
    const totalEvaluation = curriculum.evaluation.attendance + 
                           curriculum.evaluation.assignments + 
                           curriculum.evaluation.project + 
                           curriculum.evaluation.participation
    if (totalEvaluation !== 100) {
      toast.error('평가 비중의 합은 100%가 되어야 합니다')
      return false
    }
    
    // 세션 확인
    if (!curriculum.sessions || curriculum.sessions.length === 0) {
      toast.error('최소 1개 이상의 세션을 추가해주세요')
      return false
    }
    
    // 각 세션의 필수 정보 확인
    for (let i = 0; i < curriculum.sessions.length; i++) {
      const session = curriculum.sessions[i]
      if (!session.title || session.title.trim() === '') {
        toast.error(`${session.week}주차 세션 제목을 입력해주세요`)
        return false
      }
      if (!session.description || session.description.trim() === '') {
        toast.error(`${session.week}주차 세션 설명을 입력해주세요`)
        return false
      }
    }
    
    return true
  }

  // 전체 커리큘럼 저장
  const saveCurriculumEdits = () => {
    if (!validateCurriculum()) {
      return
    }
    setEditMode(false)
    toast.success('커리큘럼 수정사항이 저장되었습니다')
  }

  // 세미나 생성 함수 (step 3에서만 호출)
  const handleCreateSeminar = async () => {
    console.log('handleCreateSeminar called')
    
    // 폼 유효성 검사 및 데이터 가져오기
    const isValid = await trigger() // react-hook-form 유효성 검사
    if (!isValid) {
      console.log('Form validation failed')
      toast.error('필수 정보를 모두 입력해주세요')
      return
    }
    
    const data = getValues()
    console.log('Form data:', data)
    
    if (!curriculum) {
      console.log('No curriculum found')
      toast.error('커리큘럼을 생성하거나 작성해주세요')
      return
    }
    
    if (!validateCurriculum()) {
      console.log('Curriculum validation failed')
      return
    }

    console.log('Starting seminar creation...')
    setLoading(true)
    try {
      const requestData = {
        ...data,
        curriculum,
        cover_image: coverImage || `https://source.unsplash.com/800x400/?${data.category},education`
      }
      console.log('Sending request data:', requestData)
      
      const response = await fetch('/api/seminars/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)

      if (!response.ok) {
        throw new Error(result.error || '세미나 생성에 실패했습니다')
      }

      toast.success('세미나가 성공적으로 생성되었습니다!')
      clearDraft() // 임시 저장 데이터 삭제
      router.push(`/seminar/${result.seminar.id}`)
    } catch (error: any) {
      console.error('Seminar creation error:', error)
      toast.error(error.message || '세미나 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }
  
  // form의 onSubmit (더 이상 사용하지 않음)
  const onSubmit = async (data: SeminarFormData) => {
    // 이 함수는 더 이상 사용하지 않습니다
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
        {/* Page Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container-custom py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              새 세미나 개설하기
            </h1>
            <p className="text-gray-600">
              AI가 도와드리는 체계적인 세미나 커리큘럼을 만들어보세요
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-2 font-medium">기본 정보</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">상세 설정</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium">커리큘럼</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="card space-y-6">
                <h2 className="text-xl font-semibold">기본 정보 입력</h2>
                
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

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-gradient"
                  >
                    다음 단계
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Detailed Settings */}
            {step === 2 && (
              <div className="card space-y-6">
                <h2 className="text-xl font-semibold">상세 설정</h2>

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
                        min={new Date().toISOString().split('T')[0]}
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
                        min={startDate || new Date().toISOString().split('T')[0]}
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
                      placeholder="30"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.max_participants && (
                    <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    커버 이미지 URL (선택)
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
                  <p className="mt-1 text-xs text-gray-500">
                    이미지를 입력하지 않으면 카테고리에 맞는 기본 이미지가 자동으로 설정됩니다
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    이전 단계
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (startDate && endDate) {
                        setStep(3)
                      } else {
                        toast.error('시작일과 종료일을 모두 선택해주세요')
                      }
                    }}
                    className="btn-gradient"
                  >
                    다음 단계
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: AI Curriculum */}
            {step === 3 && (
              <div className="space-y-6">
                {/* 커리큘럼 생성 옵션 */}
                {!curriculum && !aiLoading && (
                  <div className="card">
                    <h2 className="text-xl font-semibold mb-6">커리큘럼 생성</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={generateAICurriculum}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                      >
                        <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-gray-900 mb-2">AI 커리큘럼 생성</h3>
                        <p className="text-sm text-gray-600">
                          GPT가 세미나 주제에 맞는 체계적인 커리큘럼을 자동으로 생성합니다
                        </p>
                      </button>
                      
                      <button
                        type="button"
                        onClick={startManualCurriculum}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors group"
                      >
                        <FileText className="h-12 w-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-gray-900 mb-2">직접 작성</h3>
                        <p className="text-sm text-gray-600">
                          템플릿을 기반으로 커리큘럼을 직접 작성합니다
                        </p>
                      </button>
                    </div>
                    
                    <div className="mt-6 flex justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                      >
                        이전 단계
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI 커리큘럼 생성 중 */}
                {aiLoading && (
                  <div className="card text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">AI가 커리큘럼을 생성하고 있습니다</h3>
                    <p className="text-gray-600">GPT-4를 사용하여 최적의 커리큘럼을 만들고 있어요...</p>
                    <p className="text-sm text-gray-500 mt-2">약 10-30초 정도 소요됩니다</p>
                  </div>
                )}

                {/* 생성된 커리큘럼 */}
                {curriculum && !aiLoading && (
                  <div className="space-y-6">
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                              {isManualMode ? '커리큘럼 작성' : 'AI 생성 커리큘럼'}
                            </h2>
                            {lastSaved && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>자동 저장됨</span>
                                {curriculum && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm('임시 저장된 데이터를 삭제하시겠습니까?')) {
                                        clearDraft()
                                        setCurriculum(null)
                                        setLastSaved(null)
                                        toast.info('임시 저장 데이터가 삭제되었습니다')
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-600 ml-2"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          {(() => {
                            let completedItems = 0
                            let totalItems = 5 // overview, objectives(2+), evaluation(100%), sessions(1+), requirements(optional)
                            
                            if (curriculum.overview && curriculum.overview.trim()) completedItems++
                            if (curriculum.objectives.filter((obj: string) => obj && obj.trim()).length >= 2) completedItems++
                            if (curriculum.evaluation.attendance + curriculum.evaluation.assignments + 
                                curriculum.evaluation.project + curriculum.evaluation.participation === 100) completedItems++
                            if (curriculum.sessions.length > 0 && 
                                curriculum.sessions.every((s: any) => s.title && s.title.trim() && s.description && s.description.trim())) completedItems++
                            if (curriculum.targetAudience && curriculum.targetAudience.trim()) completedItems++
                            
                            const percentage = Math.round((completedItems / totalItems) * 100)
                            
                            return (
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">완성도</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all ${
                                        percentage === 100 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-medium ${
                                    percentage === 100 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {percentage}%
                                  </span>
                                </div>
                                {percentage < 100 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    커리큘럼을 완성하려면 모든 필수 항목을 입력해주세요
                                  </p>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                        <div className="flex gap-2">
                          {!editMode ? (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditMode(true)}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                수정
                              </Button>
                              {!isManualMode && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={generateAICurriculum}
                                >
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  재생성
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditMode(false)
                                  setEditingSessionIndex(null)
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                취소
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                className="btn-gradient"
                                onClick={saveCurriculumEdits}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                저장
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 커리큘럼 개요 */}
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-blue-900">커리큘럼 개요</h3>
                            {!editingOverview && (
                              <button
                                type="button"
                                onClick={() => setEditingOverview(true)}
                                className="text-blue-600 hover:text-blue-700 p-1"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {editingOverview ? (
                            <div className="space-y-2">
                              <textarea
                                value={curriculum.overview}
                                onChange={(e) => setCurriculum({ ...curriculum, overview: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder="커리큘럼 전체 개요를 입력하세요"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingOverview(false)
                                    toast.success('커리큘럼 개요가 저장되었습니다')
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                  저장
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingOverview(false)}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-blue-800">{curriculum.overview || '커리큘럼 개요를 입력해주세요'}</p>
                          )}
                        </div>

                        {/* 학습 목표 */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-green-900">학습 목표</h3>
                            {!editingObjectives && (
                              <button
                                type="button"
                                onClick={() => setEditingObjectives(true)}
                                className="text-green-600 hover:text-green-700 p-1"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {editingObjectives ? (
                            <div className="space-y-2">
                              {curriculum.objectives.map((objective: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={objective}
                                    onChange={(e) => {
                                      const newObjectives = [...curriculum.objectives]
                                      newObjectives[index] = e.target.value
                                      setCurriculum({ ...curriculum, objectives: newObjectives })
                                    }}
                                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder={`학습 목표 ${index + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newObjectives = curriculum.objectives.filter((_: any, idx: number) => idx !== index)
                                      setCurriculum({ ...curriculum, objectives: newObjectives })
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setCurriculum({ ...curriculum, objectives: [...curriculum.objectives, ''] })
                                }}
                                className="w-full p-2 border-2 border-dashed border-green-300 text-green-600 rounded hover:bg-green-50"
                              >
                                <Plus className="h-4 w-4 inline mr-2" />
                                목표 추가
                              </button>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingObjectives(false)
                                    toast.success('학습 목표가 저장되었습니다')
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                >
                                  저장
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingObjectives(false)}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <ul className="space-y-1">
                              {curriculum.objectives.map((objective: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{objective || `학습 목표 ${index + 1}`}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* 선수 지식 */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-purple-900">선수 지식</h3>
                            {!editingRequirements && (
                              <button
                                type="button"
                                onClick={() => setEditingRequirements(true)}
                                className="text-purple-600 hover:text-purple-700 p-1"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {editingRequirements ? (
                            <div className="space-y-2">
                              {curriculum.requirements && curriculum.requirements.map((req: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => {
                                      const newRequirements = [...curriculum.requirements]
                                      newRequirements[index] = e.target.value
                                      setCurriculum({ ...curriculum, requirements: newRequirements })
                                    }}
                                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder={`선수 지식 ${index + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newRequirements = curriculum.requirements.filter((_: any, idx: number) => idx !== index)
                                      setCurriculum({ ...curriculum, requirements: newRequirements })
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setCurriculum({ ...curriculum, requirements: [...(curriculum.requirements || []), ''] })
                                }}
                                className="w-full p-2 border-2 border-dashed border-purple-300 text-purple-600 rounded hover:bg-purple-50"
                              >
                                <Plus className="h-4 w-4 inline mr-2" />
                                선수 지식 추가
                              </button>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRequirements(false)
                                    toast.success('선수 지식이 저장되었습니다')
                                  }}
                                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                                >
                                  저장
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRequirements(false)}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <ul className="space-y-1">
                              {curriculum.requirements && curriculum.requirements.length > 0 ? (
                                curriculum.requirements.map((req: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{req || `선수 지식 ${index + 1}`}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-500">선수 지식이 없습니다</li>
                              )}
                            </ul>
                          )}
                        </div>

                        {/* 대상 및 평가 */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-yellow-900 mb-2">대상</h3>
                            {editMode ? (
                              <input
                                type="text"
                                value={curriculum.targetAudience}
                                onChange={(e) => setCurriculum({ ...curriculum, targetAudience: e.target.value })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="대상 수강생"
                              />
                            ) : (
                              <p className="text-gray-700">{curriculum.targetAudience}</p>
                            )}
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-orange-900">평가 비중</h3>
                              {!editingEvaluation && (
                                <button
                                  type="button"
                                  onClick={() => setEditingEvaluation(true)}
                                  className="text-orange-600 hover:text-orange-700 p-1"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            {editingEvaluation ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <label className="text-gray-700">출석</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={curriculum.evaluation.attendance}
                                      onChange={(e) => {
                                        setCurriculum({
                                          ...curriculum,
                                          evaluation: { ...curriculum.evaluation, attendance: parseInt(e.target.value) || 0 }
                                        })
                                      }}
                                      className="w-20 p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      min="0"
                                      max="100"
                                    />
                                    <span>%</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-gray-700">과제</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={curriculum.evaluation.assignments}
                                      onChange={(e) => {
                                        setCurriculum({
                                          ...curriculum,
                                          evaluation: { ...curriculum.evaluation, assignments: parseInt(e.target.value) || 0 }
                                        })
                                      }}
                                      className="w-20 p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      min="0"
                                      max="100"
                                    />
                                    <span>%</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-gray-700">프로젝트</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={curriculum.evaluation.project}
                                      onChange={(e) => {
                                        setCurriculum({
                                          ...curriculum,
                                          evaluation: { ...curriculum.evaluation, project: parseInt(e.target.value) || 0 }
                                        })
                                      }}
                                      className="w-20 p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      min="0"
                                      max="100"
                                    />
                                    <span>%</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-gray-700">참여도</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={curriculum.evaluation.participation}
                                      onChange={(e) => {
                                        setCurriculum({
                                          ...curriculum,
                                          evaluation: { ...curriculum.evaluation, participation: parseInt(e.target.value) || 0 }
                                        })
                                      }}
                                      className="w-20 p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      min="0"
                                      max="100"
                                    />
                                    <span>%</span>
                                  </div>
                                </div>
                                <div className="pt-2 border-t">
                                  <div className="flex items-center justify-between font-semibold">
                                    <span>합계</span>
                                    <span className={`${(curriculum.evaluation.attendance + curriculum.evaluation.assignments + curriculum.evaluation.project + curriculum.evaluation.participation) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                                      {curriculum.evaluation.attendance + curriculum.evaluation.assignments + curriculum.evaluation.project + curriculum.evaluation.participation}%
                                    </span>
                                  </div>
                                  {(curriculum.evaluation.attendance + curriculum.evaluation.assignments + curriculum.evaluation.project + curriculum.evaluation.participation) !== 100 && (
                                    <p className="text-sm text-red-600 mt-1">평가 비중의 합은 100%가 되어야 합니다.</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const total = curriculum.evaluation.attendance + curriculum.evaluation.assignments + curriculum.evaluation.project + curriculum.evaluation.participation
                                      if (total === 100) {
                                        setEditingEvaluation(false)
                                        toast.success('평가 비중이 저장되었습니다')
                                      } else {
                                        toast.error('평가 비중의 합은 100%가 되어야 합니다')
                                      }
                                    }}
                                    className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                                  >
                                    저장
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingEvaluation(false)}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-700">출석</span>
                                  <span className="font-medium">{curriculum.evaluation.attendance}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">과제</span>
                                  <span className="font-medium">{curriculum.evaluation.assignments}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">프로젝트</span>
                                  <span className="font-medium">{curriculum.evaluation.project}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">참여도</span>
                                  <span className="font-medium">{curriculum.evaluation.participation}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 주차별 세션 */}
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">주차별 커리큘럼</h3>
                        {editMode && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSession}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            세션 추가
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {curriculum.sessions.map((session: any, index: number) => (
                          <div key={index} className={`border-l-4 ${editingSessionIndex === index ? 'border-yellow-500' : 'border-blue-500'} pl-4 py-2`}>
                            {editingSessionIndex === index ? (
                              // 세션 편집 모드
                              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <input
                                    type="text"
                                    value={session.title}
                                    onChange={(e) => {
                                      const updatedSession = { ...session, title: e.target.value }
                                      const newSessions = [...curriculum.sessions]
                                      newSessions[index] = updatedSession
                                      setCurriculum({ ...curriculum, sessions: newSessions })
                                    }}
                                    className="flex-1 p-2 border rounded font-semibold"
                                    placeholder={`${session.week}주차 제목`}
                                  />
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => saveSessionEdit(index, session)}
                                    >
                                      저장
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingSessionIndex(null)}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                </div>
                                
                                <textarea
                                  value={session.description}
                                  onChange={(e) => {
                                    const updatedSession = { ...session, description: e.target.value }
                                    const newSessions = [...curriculum.sessions]
                                    newSessions[index] = updatedSession
                                    setCurriculum({ ...curriculum, sessions: newSessions })
                                  }}
                                  className="w-full p-2 border rounded"
                                  rows={2}
                                  placeholder="세션 설명"
                                />
                                
                                <div>
                                  <label className="text-sm font-medium text-gray-700">학습 목표</label>
                                  {session.objectives.map((obj: string, objIndex: number) => (
                                    <input
                                      key={objIndex}
                                      type="text"
                                      value={obj}
                                      onChange={(e) => {
                                        const newObjectives = [...session.objectives]
                                        newObjectives[objIndex] = e.target.value
                                        const updatedSession = { ...session, objectives: newObjectives }
                                        const newSessions = [...curriculum.sessions]
                                        newSessions[index] = updatedSession
                                        setCurriculum({ ...curriculum, sessions: newSessions })
                                      }}
                                      className="w-full p-2 border rounded mt-1"
                                      placeholder={`목표 ${objIndex + 1}`}
                                    />
                                  ))}
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium text-gray-700">과제</label>
                                  <input
                                    type="text"
                                    value={session.assignment}
                                    onChange={(e) => {
                                      const updatedSession = { ...session, assignment: e.target.value }
                                      const newSessions = [...curriculum.sessions]
                                      newSessions[index] = updatedSession
                                      setCurriculum({ ...curriculum, sessions: newSessions })
                                    }}
                                    className="w-full p-2 border rounded mt-1"
                                    placeholder="과제 내용"
                                  />
                                </div>
                              </div>
                            ) : (
                              // 세션 보기 모드
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {session.week}주차: {session.title || `세션 ${session.week}`}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {editMode && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => moveSession(index, 'up')}
                                          disabled={index === 0}
                                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                        >
                                          ↑
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveSession(index, 'down')}
                                          disabled={index === curriculum.sessions.length - 1}
                                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                        >
                                          ↓
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingSessionIndex(index)}
                                          className="p-1 hover:bg-gray-100 rounded"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deleteSession(index)}
                                          className="p-1 hover:bg-red-100 rounded text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </>
                                    )}
                                    <Clock className="h-5 w-5 text-gray-400" />
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">
                                  {session.description || '세션 설명을 입력해주세요'}
                                </p>
                                {session.objectives && session.objectives.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {session.objectives.slice(0, 2).map((obj: string, idx: number) => (
                                      obj && (
                                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                          {obj}
                                        </span>
                                      )
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                      >
                        이전 단계
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCreateSeminar}
                        className="btn-gradient"
                        loading={loading}
                        disabled={loading}
                      >
                        <CheckCircle className="ml-2 h-5 w-5" />
                        세미나 개설하기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}