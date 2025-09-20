import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 서버에서만 사용하는 Admin 클라이언트
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || null
    const search = searchParams.get('search') || null

    console.log('API: Fetching seminars with params:', { status, search })

    // 기본 쿼리 생성 - 일단 모든 세미나를 가져오도록 수정
    let query = supabaseAdmin
      .from('seminars')
      .select(`
        *,
        profiles!seminars_created_by_fkey (
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    // 상태 필터 적용
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    // published와 ongoing 필터를 일시적으로 제거하여 모든 세미나를 볼 수 있도록 함

    // 검색 필터 적용
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Seminars fetch error:', error)
      return NextResponse.json(
        { error: '세미나 목록을 가져오는데 실패했습니다', details: error.message },
        { status: 500 }
      )
    }

    console.log(`API: Found ${data?.length || 0} seminars`)

    // 데이터 변환
    const seminars = data?.map(seminar => ({
      id: seminar.id,
      title: seminar.title,
      description: seminar.description,
      cover_image: seminar.cover_image,
      start_date: seminar.start_date,
      end_date: seminar.end_date,
      status: seminar.status,
      max_participants: seminar.max_participants,
      created_by: seminar.created_by,
      created_at: seminar.created_at,
      instructor: seminar.profiles ? {
        name: seminar.profiles.name,
        avatar_url: seminar.profiles.avatar_url
      } : null
    })) || []

    return NextResponse.json(
      { seminars },
      { status: 200 }
    )

  } catch (error) {
    console.error('Seminars API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}