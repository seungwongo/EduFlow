import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 입력값 검증
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 로그인 시도
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      
      // 이메일 미확인 오류 처리
      if (error.message === 'Email not confirmed') {
        return NextResponse.json(
          { error: '이메일 인증이 필요합니다. 가입 시 입력한 이메일을 확인해주세요.' },
          { status: 401 }
        )
      }
      
      // 잘못된 인증 정보
      if (error.message === 'Invalid login credentials') {
        return NextResponse.json(
          { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || '로그인에 실패했습니다.' },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: '로그인에 실패했습니다.' },
        { status: 401 }
      )
    }

    // 프로필 정보 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    // 세션 쿠키 설정
    const cookieStore = await cookies()
    cookieStore.set('supabase-auth-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return NextResponse.json(
      {
        message: '로그인 성공',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || null,
          role: profile?.role || 'student',
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}