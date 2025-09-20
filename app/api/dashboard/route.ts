import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
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
    const cookieStore = await cookies()
    const token = cookieStore.get('supabase-auth-token')

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다', data: null },
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
        { error: '유효하지 않은 세션입니다', data: null },
        { status: 401 }
      )
    }

    // 대시보드 데이터 가져오기
    const [seminarsData, participatingData] = await Promise.all([
      // 내가 만든 세미나
      supabaseAdmin
        .from('seminars')
        .select('id, title, status')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false }),
      
      // 참여 중인 세미나
      supabaseAdmin
        .from('participants')
        .select(`
          seminars (
            id,
            title,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ])

    // 통계 데이터 계산
    const stats = {
      created: seminarsData.data?.filter(s => s.status === 'published' || s.status === 'ongoing').length || 0,
      participating: participatingData.data?.length || 0,
      completed: seminarsData.data?.filter(s => s.status === 'completed').length || 0,
      certificates: 0 // 인증서 기능은 추후 구현
    }

    return NextResponse.json(
      {
        stats,
        mySeminars: seminarsData.data?.slice(0, 5) || [],
        participatingSeminars: participatingData.data?.slice(0, 5) || []
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: '대시보드 데이터를 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}