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

export async function GET(request: NextRequest) {
  try {
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

    // 프로필 정보 가져오기
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 통계 정보 가져오기
    const [seminarsData, participationsData, certificatesData] = await Promise.all([
      // 개설한 세미나
      supabaseAdmin
        .from('seminars')
        .select('*', { count: 'exact' })
        .eq('created_by', user.id),
      
      // 참여중인 세미나
      supabaseAdmin
        .from('participants')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'approved'),
      
      // 획득한 인증서
      supabaseAdmin
        .from('certificates')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
    ])

    const stats = {
      created_seminars: seminarsData.count || 0,
      participating_seminars: participationsData.count || 0,
      certificates: certificatesData.count || 0,
      total_hours: 120 // 임시 값
    }

    // 최근 활동
    const { data: recentActivities } = await supabaseAdmin
      .from('participants')
      .select(`
        joined_at,
        seminars!inner(
          id,
          title,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      profile: {
        ...profile,
        email: user.email
      },
      stats,
      recent_activities: recentActivities || []
    }, { status: 200 })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: '프로필 정보를 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    const updates = await request.json()

    // 프로필 업데이트
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        name: updates.name,
        bio: updates.bio,
        avatar_url: updates.avatar_url,
        phone: updates.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: '프로필 수정에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}