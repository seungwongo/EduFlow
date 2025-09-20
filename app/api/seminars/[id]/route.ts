import { NextRequest, NextResponse } from 'next/server'
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

    // 세미나 정보 가져오기
    const { data: seminar, error: seminarError } = await supabaseAdmin
      .from('seminars')
      .select(`
        *,
        profiles!seminars_created_by_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (seminarError || !seminar) {
      return NextResponse.json(
        { error: '세미나를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 세션 정보 가져오기
    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('seminar_id', id)
      .order('session_number', { ascending: true })

    // 참가자 수 가져오기
    const { count: participantCount } = await supabaseAdmin
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('seminar_id', id)
      .eq('status', 'approved')

    // 데이터 조합
    const seminarData = {
      ...seminar,
      instructor: seminar.profiles,
      sessions: sessions || [],
      participant_count: participantCount || 0
    }

    delete seminarData.profiles

    return NextResponse.json(seminarData, { status: 200 })

  } catch (error) {
    console.error('Seminar fetch error:', error)
    return NextResponse.json(
      { error: '세미나 정보를 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()

    // 세미나 업데이트
    const { data, error } = await supabaseAdmin
      .from('seminars')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: '세미나 수정에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error('Seminar update error:', error)
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
    const { id } = await params

    // 세미나 삭제
    const { error } = await supabaseAdmin
      .from('seminars')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: '세미나 삭제에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '세미나가 삭제되었습니다' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Seminar delete error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}