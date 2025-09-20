import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: '소셜 로그인 제공자를 선택해주세요' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${request.headers.get('origin')}/seminars`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: `${provider} 로그인에 실패했습니다` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { url: data.url },
      { status: 200 }
    )

  } catch (error) {
    console.error('Social login error:', error)
    return NextResponse.json(
      { error: '소셜 로그인 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}