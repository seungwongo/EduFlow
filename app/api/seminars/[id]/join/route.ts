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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: seminarId } = await params

    // 이미 참가 신청했는지 확인
    const { data: existing } = await supabaseAdmin
      .from('participants')
      .select('*')
      .eq('seminar_id', seminarId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: '이미 참가 신청한 세미나입니다' },
        { status: 400 }
      )
    }

    // 세미나 정보 확인
    const { data: seminar } = await supabaseAdmin
      .from('seminars')
      .select('max_participants')
      .eq('id', seminarId)
      .single()

    if (!seminar) {
      return NextResponse.json(
        { error: '세미나를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 현재 참가자 수 확인
    const { count } = await supabaseAdmin
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('seminar_id', seminarId)
      .eq('status', 'approved')

    if (seminar.max_participants && count && count >= seminar.max_participants) {
      return NextResponse.json(
        { error: '정원이 모두 찼습니다' },
        { status: 400 }
      )
    }

    // 참가 신청
    const { error: joinError } = await supabaseAdmin
      .from('participants')
      .insert({
        seminar_id: seminarId,
        user_id: user.id,
        status: 'approved', // 자동 승인
        joined_at: new Date().toISOString()
      })

    if (joinError) {
      console.error('Join error:', joinError)
      return NextResponse.json(
        { error: '참가 신청에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '세미나에 참가 신청되었습니다' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Join seminar error:', error)
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

    const { id: seminarId } = await params

    // 참가 취소
    const { error } = await supabaseAdmin
      .from('participants')
      .delete()
      .eq('seminar_id', seminarId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: '참가 취소에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '세미나 참가가 취소되었습니다' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Leave seminar error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}