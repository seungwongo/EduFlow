import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('supabase-auth-token')

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 없습니다', user: null },
        { status: 401 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }
    })

    // 토큰으로 사용자 정보 가져오기
    const { data: { user }, error } = await supabase.auth.getUser(token.value)

    if (error || !user) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다', user: null },
        { status: 401 }
      )
    }

    // 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: profile?.name || null,
          avatar_url: profile?.avatar_url || null,
          role: profile?.role || 'student'
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: '세션 확인 중 오류가 발생했습니다', user: null },
      { status: 500 }
    )
  }
}