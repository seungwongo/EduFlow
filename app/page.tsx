import Link from 'next/link'
import { ArrowRight, Sparkles, Users, BookOpen, BarChart3, Clock, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <header className="navbar">
        <nav className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">EduFlow</span>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <button className="btn-secondary">
                  로그인
                </button>
              </Link>
              <Link href="/signup">
                <button className="btn-gradient">
                  무료로 시작하기
                </button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 badge-primary mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>AI 기반 세미나 관리 플랫폼</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 animate-slide-up">
              교육의 미래를
              <span className="animated-gradient-text block mt-2">AI와 함께</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 animate-slide-up" style={{animationDelay: '0.1s'}}>
              AI가 설계하는 맞춤형 커리큘럼부터<br />
              스마트한 참가자 관리까지, 모든 교육 운영을 한 곳에서
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Link href="/signup">
                <button className="btn-gradient group">
                  <span>무료로 시작하기</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/demo">
                <button className="btn-secondary">
                  데모 체험하기
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>안전한 데이터 보호</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>24/7 지원</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>빠른 설정</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-white/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              강력한 기능으로 <span className="gradient-text">교육을 혁신</span>하세요
            </h2>
            <p className="text-lg text-gray-600">
              EduFlow가 제공하는 스마트한 교육 관리 솔루션
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-hover group">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI 커리큘럼 생성</h3>
              <p className="text-gray-600 mb-4">
                최신 AI 기술을 활용한 맞춤형 커리큘럼 자동 생성. 주제만 입력하면 완벽한 교육 과정이 완성됩니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-primary">AI 기술</span>
                <span className="badge-primary">자동화</span>
                <span className="badge-primary">맞춤형</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover group">
              <div className="w-14 h-14 rounded-2xl gradient-success flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">스마트 참가자 관리</h3>
              <p className="text-gray-600 mb-4">
                신청부터 출석, 과제 제출까지 모든 과정을 자동화. QR코드로 간편한 출석 체크.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-success">자동화</span>
                <span className="badge-success">QR체크</span>
                <span className="badge-success">실시간</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover group">
              <div className="w-14 h-14 rounded-2xl gradient-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">실시간 분석 대시보드</h3>
              <p className="text-gray-600 mb-4">
                출석률, 과제 제출률, 참여도를 한눈에. 데이터 기반 교육 운영이 가능합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-danger">실시간</span>
                <span className="badge-danger">시각화</span>
                <span className="badge-danger">인사이트</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card card-hover group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI 과제 평가</h3>
              <p className="text-gray-600 mb-4">
                제출된 과제를 AI가 자동 평가하고 상세한 피드백 제공. 교육자의 시간을 절약합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-warning">AI평가</span>
                <span className="badge-warning">피드백</span>
                <span className="badge-warning">자동화</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card card-hover group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">자동 알림 시스템</h3>
              <p className="text-gray-600 mb-4">
                일정 안내, 과제 마감일, 공지사항을 이메일과 카카오톡으로 자동 발송합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-primary">이메일</span>
                <span className="badge-primary">카카오톡</span>
                <span className="badge-primary">예약발송</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card card-hover group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">안전한 데이터 보호</h3>
              <p className="text-gray-600 mb-4">
                Supabase 기반 엔터프라이즈급 보안. 모든 데이터는 암호화되어 안전하게 보호됩니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge-success">암호화</span>
                <span className="badge-success">백업</span>
                <span className="badge-success">GDPR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              신용카드 없이 14일 무료 체험. 언제든 취소 가능합니다.
            </p>
            <Link href="/signup">
              <button className="btn-gradient group">
                <span>무료로 시작하기</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-gray-200">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">EduFlow</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-gray-900">이용약관</Link>
              <Link href="/privacy" className="hover:text-gray-900">개인정보처리방침</Link>
              <Link href="/help" className="hover:text-gray-900">도움말</Link>
              <Link href="/contact" className="hover:text-gray-900">문의하기</Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 EduFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}