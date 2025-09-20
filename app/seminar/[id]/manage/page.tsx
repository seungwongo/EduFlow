'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/Button'
import { toast } from '@/components/Toast'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Users,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Send,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Award,
  TrendingUp
} from 'lucide-react'

type Participant = {
  id: string
  user_id: string
  seminar_id: string
  status: 'pending' | 'approved' | 'rejected'
  joined_at: string
  user: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  }
  attendance_rate: number
}

export default function ManageParticipantsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  useEffect(() => {
    if (params.id) {
      fetchParticipants()
    }
  }, [params.id])

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/seminars/${params.id}/participants`)
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('권한이 없습니다')
          router.push(`/seminar/${params.id}`)
          return
        }
        throw new Error('참가자 목록을 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setParticipants(data.participants)
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast.error('참가자 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (participantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/seminars/${params.id}/participants`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          status: newStatus
        }),
      })

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다')
      }

      toast.success('참가자 상태가 변경되었습니다')
      fetchParticipants()
    } catch (error) {
      toast.error('상태 변경에 실패했습니다')
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm('정말로 이 참가자를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/seminars/${params.id}/participants`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId }),
      })

      if (!response.ok) {
        throw new Error('참가자 삭제에 실패했습니다')
      }

      toast.success('참가자가 삭제되었습니다')
      fetchParticipants()
    } catch (error) {
      toast.error('참가자 삭제에 실패했습니다')
    }
  }

  const handleSelectAll = () => {
    if (selectedParticipants.length === filteredParticipants.length) {
      setSelectedParticipants([])
    } else {
      setSelectedParticipants(filteredParticipants.map(p => p.id))
    }
  }

  const handleSendEmail = () => {
    toast.info('이메일 발송 기능은 준비중입니다')
  }

  const handleExportData = () => {
    const csvContent = [
      ['이름', '이메일', '상태', '가입일', '출석률'],
      ...filteredParticipants.map(p => [
        p.user.name,
        p.user.email,
        p.status,
        formatDate(p.joined_at),
        `${p.attendance_rate}%`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `participants-${params.id}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 필터링된 참가자 목록
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          participant.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || participant.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // 통계 계산
  const stats = {
    total: participants.length,
    approved: participants.filter(p => p.status === 'approved').length,
    pending: participants.filter(p => p.status === 'pending').length,
    avgAttendance: participants.length > 0 
      ? Math.round(participants.reduce((acc, p) => acc + p.attendance_rate, 0) / participants.length)
      : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container-custom py-8">
          <Link href={`/seminar/${params.id}`}>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-5 w-5" />
              세미나로 돌아가기
            </button>
          </Link>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            참가자 관리
          </h1>
          <p className="text-gray-600">
            세미나 참가자를 관리하고 출석 현황을 확인하세요
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container-custom py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 참가자</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">승인됨</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">대기중</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 출석률</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgAttendance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">전체</option>
                <option value="approved">승인됨</option>
                <option value="pending">대기중</option>
                <option value="rejected">거절됨</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                disabled={selectedParticipants.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                이메일 발송
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.length === filteredParticipants.length && filteredParticipants.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    참가자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    출석률
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants([...selectedParticipants, participant.id])
                          } else {
                            setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {participant.user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={participant.user.avatar_url}
                                alt={participant.user.name}
                              />
                            ) : (
                              participant.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {participant.user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${participant.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : participant.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'}`}>
                        {participant.status === 'approved' ? '승인됨' :
                         participant.status === 'pending' ? '대기중' : '거절됨'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(participant.joined_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">{participant.attendance_rate}%</div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                            style={{ width: `${participant.attendance_rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {participant.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(participant.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(participant.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <UserX className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredParticipants.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">참가자가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}