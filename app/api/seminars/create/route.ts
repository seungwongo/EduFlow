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
    console.log('Seminar creation API called')
    
    const cookieStore = await cookies()
    const token = cookieStore.get('supabase-auth-token')

    if (!token) {
      console.log('No auth token found')
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

    const seminarData = await request.json()
    
    console.log('Received seminar data:', {
      title: seminarData.title,
      format: seminarData.format,
      hasUser: !!user,
      userId: user?.id
    })

    // 세미나 생성
    const { data: seminar, error: seminarError } = await supabaseAdmin
      .from('seminars')
      .insert({
        title: seminarData.title,
        description: seminarData.description,
        category: seminarData.category,
        level: seminarData.level,
        format: seminarData.format, // format 필드 추가
        max_participants: seminarData.max_participants,
        start_date: seminarData.start_date,
        end_date: seminarData.end_date,
        location: seminarData.location,
        online_link: seminarData.online_link,
        cover_image: seminarData.cover_image,
        curriculum: seminarData.curriculum,
        status: 'draft',
        created_by: user.id
      })
      .select()
      .single()

    if (seminarError) {
      console.error('Seminar creation error:', seminarError)
      return NextResponse.json(
        { error: '세미나 생성에 실패했습니다' },
        { status: 500 }
      )
    }

    // 세션 생성 (커리큘럼에 있는 세션들)
    if (seminarData.curriculum?.sessions?.length > 0) {
      const sessions = seminarData.curriculum.sessions.map((session: any, index: number) => ({
        seminar_id: seminar.id,
        title: session.title,
        description: session.description,
        session_number: index + 1,
        materials: session.materials,
        created_by: user.id
      }))

      const { error: sessionsError } = await supabaseAdmin
        .from('sessions')
        .insert(sessions)

      if (sessionsError) {
        console.error('Sessions creation error:', sessionsError)
      }
    }

    return NextResponse.json(
      { 
        message: '세미나가 성공적으로 생성되었습니다',
        seminar
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Seminar creation API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}