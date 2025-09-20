# 🔧 세미나 생성 오류 수정 가이드

## 문제
세미나 개설하기 버튼이 작동하지 않는 문제

## 원인
seminars 테이블에 필요한 컬럼들이 누락되어 있었습니다:
- category
- level
- format
- location  
- online_link
- curriculum

## 해결 방법

### 1. Supabase 대시보드에서 SQL 실행

1. [Supabase 대시보드](https://supabase.com/dashboard)로 이동
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. 아래 SQL 코드를 복사하여 붙여넣기:

```sql
-- Add missing columns to seminars table
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS level text CHECK (level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS format text CHECK (format IN ('online', 'offline', 'hybrid'));
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS online_link text;
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS curriculum jsonb;
```

5. **Run** 버튼 클릭하여 실행

### 2. 앱 테스트

1. 브라우저를 새로고침
2. 로그인 상태 확인
3. `/seminar/create` 페이지로 이동
4. 세미나 정보 입력:
   - 기본 정보 (제목, 설명, 카테고리, 난이도)
   - 상세 설정 (시작일, 종료일, 진행 방식, 참가자 수)
   - 커리큘럼 (AI 생성 또는 직접 작성)
5. "세미나 개설하기" 버튼 클릭

## 수정된 내용

### ✅ API 수정 (/app/api/seminars/create/route.ts)
- `format` 필드 추가
- 디버깅 로그 추가
- 에러 처리 개선

### ✅ 데이터베이스 스키마 업데이트
- seminars 테이블에 누락된 컬럼들 추가
- 제약 조건(constraints) 설정

## 확인 사항

### 성공적인 세미나 생성 시:
- 세미나가 데이터베이스에 저장됨
- 세미나 상세 페이지로 리다이렉트
- 성공 토스트 메시지 표시

### 여전히 문제가 있다면:
1. 브라우저 개발자 도구 콘솔 확인
2. Network 탭에서 API 요청/응답 확인
3. 서버 로그 확인 (터미널에서 npm run dev 실행 중인 창)

## 추가 디버깅

문제가 계속되면 브라우저 콘솔에서 다음 확인:
- 401 에러: 로그인 세션 만료 → 다시 로그인
- 500 에러: 서버 에러 → 서버 로그 확인
- 네트워크 에러: API 엔드포인트 확인

---
수정 완료: 2025-01-20