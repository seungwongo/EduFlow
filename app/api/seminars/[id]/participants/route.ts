import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('supabase-auth-token')

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 토큰으로 사용자 정보 가져오기
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token.value)

    if (authError || !user) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다' },
        { status: 401 }
      )
    }

    // 세미나 소유자 확인
    const { data: seminar } = await supabaseAdmin
      .from('seminars')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!seminar || seminar.created_by !== user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // 참가자 목록 가져오기
    const { data: participants, error } = await supabaseAdmin
      .from('participants')
      .select(`
        *,
        profiles!participants_user_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('seminar_id', id)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Participants fetch error:', error)
      return NextResponse.json(
        { error: '참가자 목록을 가져오는데 실패했습니다' },
        { status: 500 }
      )
    }

    // 출석 정보 가져오기
    const { data: attendances } = await supabaseAdmin
      .from('attendance')
      .select('user_id, session_id, status')
      .in('user_id', participants?.map(p => p.user_id) || [])

    // 참가자별 출석률 계산
    const participantsWithStats = participants?.map(participant => {
      const userAttendances = attendances?.filter(a => a.user_id === participant.user_id) || []
      const attendanceRate = userAttendances.length > 0
        ? (userAttendances.filter(a => a.status === 'present').length / userAttendances.length) * 100
        : 0

      return {
        ...participant,
        user: participant.profiles,
        attendance_rate: Math.round(attendanceRate)
      }
    })

    return NextResponse.json({
      participants: participantsWithStats || []
    }, { status: 200 })

  } catch (error) {
    console.error('Participants API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('supabase-auth-token')

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const { participantId, status } = await request.json()

    // 참가자 상태 업데이트
    const { error } = await supabaseAdmin
      .from('participants')
      .update({ status })
      .eq('id', participantId)
      .eq('seminar_id', id)

    if (error) {
      return NextResponse.json(
        { error: '참가자 상태 업데이트에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '참가자 상태가 업데이트되었습니다' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update participant error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('supabase-auth-token')

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const { participantId } = await request.json()

    // 참가자 삭제
    const { error } = await supabaseAdmin
      .from('participants')
      .delete()
      .eq('id', participantId)
      .eq('seminar_id', id)

    if (error) {
      return NextResponse.json(
        { error: '참가자 삭제에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '참가자가 삭제되었습니다' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete participant error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}