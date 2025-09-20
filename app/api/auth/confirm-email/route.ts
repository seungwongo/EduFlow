import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 서버 사이드에서만 사용하는 Supabase Admin 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 개발용: 이메일 확인 상태를 강제로 업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 조회
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('List users error:', listError)
      return NextResponse.json(
        { error: '사용자 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 이메일로 사용자 찾기
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: '해당 이메일의 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이메일 확인 상태 업데이트
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true
      }
    )

    if (updateError) {
      console.error('Update user error:', updateError)
      return NextResponse.json(
        { error: '사용자 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: '이메일 확인이 완료되었습니다. 이제 로그인할 수 있습니다.',
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email,
          email_confirmed_at: updatedUser.user.email_confirmed_at
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Confirm email error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}