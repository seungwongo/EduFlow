import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 쿠키 삭제
    const cookieStore = await cookies()
    cookieStore.delete('supabase-auth-token')
    
    return NextResponse.json(
      { message: '로그아웃 되었습니다' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}