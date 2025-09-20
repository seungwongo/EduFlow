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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('supabase-auth-token')

    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
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

    const { sessionId, code } = await request.json()

    // 코드 검증 (sessionId와 현재 날짜를 조합한 간단한 코드)
    const today = new Date().toISOString().split('T')[0]
    const expectedCode = `${sessionId}-${today}`.substring(0, 8).toUpperCase()

    if (code !== expectedCode) {
      return NextResponse.json(
        { error: '유효하지 않은 출석 코드입니다' },
        { status: 400 }
      )
    }

    // 세션 정보 확인
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*, seminars!inner(id)')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 참가자 확인
    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('*')
      .eq('seminar_id', session.seminars.id)
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single()

    if (!participant) {
      return NextResponse.json(
        { error: '이 세미나의 참가자가 아닙니다' },
        { status: 403 }
      )
    }

    // 이미 출석 체크했는지 확인
    const { data: existingAttendance } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (existingAttendance) {
      return NextResponse.json(
        { error: '이미 출석 체크를 완료했습니다' },
        { status: 400 }
      )
    }

    // 출석 기록
    const { error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        status: 'present',
        checked_at: new Date().toISOString()
      })

    if (attendanceError) {
      console.error('Attendance error:', attendanceError)
      return NextResponse.json(
        { error: '출석 체크에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '출석 체크가 완료되었습니다!' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Attendance check error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}