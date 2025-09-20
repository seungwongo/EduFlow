# EduFlow - AI 세미나 관리 플랫폼

AI 기반 커리큘럼 생성과 체계적인 참가자 관리를 제공하는 세미나 관리 플랫폼입니다.

## 주요 기능

- 🤖 **AI 커리큘럼 생성**: GPT API를 활용한 맞춤형 커리큘럼 자동 생성
- 👥 **참가자 관리**: 신청, 승인, 출석 체크 등 체계적인 참가자 관리
- 📊 **실시간 분석**: 출석률, 과제 제출률 등 다양한 지표 제공
- 📧 **자동 알림**: 이메일을 통한 공지사항 및 일정 안내
- 🔐 **소셜 로그인**: Google, Facebook, Kakao 계정으로 간편 로그인

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT API
- **Deployment**: Vercel

## 설치 방법

### 1. 프로젝트 클론

```bash
git clone https://github.com/seungwongo/EduFlow.git
cd EduFlow
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase/migrations/001_create_tables.sql` 파일의 SQL을 실행하여 테이블 생성
3. Authentication > Providers에서 소셜 로그인 설정 (Google, Facebook, Kakao)
4. Storage에서 `seminar-assets` 버킷 생성

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

## 프로젝트 구조

```
/eduflow
├── app/                     # Next.js App Router 페이지
│   ├── (authenticated)/    # 인증이 필요한 페이지
│   │   ├── dashboard/      # 대시보드
│   │   ├── seminar/       # 세미나 관련 페이지
│   │   └── profile/       # 프로필 관련 페이지
│   ├── login/             # 로그인 페이지
│   ├── signup/            # 회원가입 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 재사용 가능한 컴포넌트
├── lib/                   # 유틸리티 함수 및 설정
├── store/                 # Zustand 상태 관리
├── supabase/             # Supabase 마이그레이션
└── public/               # 정적 파일
```

## 주요 페이지

- `/` - 랜딩 페이지
- `/login` - 로그인
- `/signup` - 회원가입
- `/dashboard` - 대시보드
- `/seminar/create` - 세미나 생성
- `/seminar/[id]` - 세미나 상세
- `/seminar/[id]/curriculum` - 커리큘럼 관리
- `/seminar/[id]/participants` - 참가자 관리
- `/profile` - 프로필 관리

## 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에서 GitHub 저장소 연결
2. 환경 변수 설정
3. Deploy 클릭

```bash
# 또는 CLI 사용
npx vercel --prod
```

## 라이센스

MIT License

## 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

## 문의

- Email: your-email@example.com
- GitHub Issues: [https://github.com/seungwongo/EduFlow/issues](https://github.com/seungwongo/EduFlow/issues)