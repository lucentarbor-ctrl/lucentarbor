# 🤖 AI 자동 블로그 시스템 (Next.js 14)

> 멀티 AI 모델을 활용한 차세대 블로그 자동화 플랫폼

## ✨ 주요 기능

### 1. 멀티 AI 모델 라우터
- **Gemini 2.5 Flash**: 빠른 작업, 비용 최소화 ($0.19/1M tokens)
- **GPT-4o Mini**: 창의적 작업, 균형잡힌 성능 ($0.38/1M tokens)
- **Gemini 2.5 Pro**: 복잡한 분석, 최고 품질 ($3.75/1M tokens)
- **Claude 3.5 Sonnet**: 최고급 품질 ($9.45/1M tokens)

작업 유형에 따라 자동으로 최적의 모델을 선택하며, 에러 발생 시 무료 모델로 자동 폴백합니다.

### 2. SEO 최적화
- AI 기반 제목 생성
- 실시간 SEO 분석
- 키워드 최적화

### 3. 자동 배포
- WordPress 연동
- Naver 블로그 연동
- Tistory 연동

## 🏗️ 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **AI**: OpenAI, Anthropic Claude, Google Gemini
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 환경 설정

`.env.local` 파일에 다음 API 키들을 설정하세요:

```bash
# Database
DATABASE_URL="file:./dev.db"

# AI APIs
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-claude-key"
GOOGLE_API_KEY="your-gemini-key"

# App
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 설정

```bash
npx prisma generate
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요!

## 📁 프로젝트 구조

```
ai-auto-blog-nextjs/
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   ├── ai/                   # AI 관련 API
│   │   │   ├── generate/         # 콘텐츠 생성
│   │   │   └── titles/           # 제목 생성
│   │   ├── posts/                # 포스트 CRUD
│   │   └── seo/                  # SEO 분석
│   ├── dashboard/                # 대시보드 페이지
│   ├── page.tsx                  # 메인 페이지
│   └── layout.tsx                # 루트 레이아웃
├── lib/                          # 라이브러리
│   └── ai/                       # AI 통합
│       └── multi-model-router.ts # 멀티 모델 라우터
├── prisma/                       # 데이터베이스
│   └── schema.prisma            # Prisma 스키마
└── package.json                  # 프로젝트 설정
```

## 🎯 API 엔드포인트

### AI 생성
```http
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "블로그 글 내용",
  "taskType": "simple" | "creative" | "complex" | "seo",
  "model": "gemini-flash" (선택)
}
```

### 제목 생성
```http
POST /api/ai/titles
Content-Type: application/json

{
  "topic": "주제",
  "keywords": ["키워드1", "키워드2"]
}
```

### SEO 분석
```http
POST /api/seo/analyze
Content-Type: application/json

{
  "title": "제목",
  "content": "본문 내용"
}
```

### 포스트 CRUD
```http
GET    /api/posts          # 목록 조회
POST   /api/posts          # 생성
GET    /api/posts/[id]     # 상세 조회
PUT    /api/posts/[id]     # 업데이트
DELETE /api/posts/[id]     # 삭제
```

## 🚀 배포

### Vercel로 배포

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에서 Import
3. 환경 변수 설정
4. 배포!

### 환경 변수 (프로덕션)

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

- `DATABASE_URL`: Vercel Postgres URL
- `OPENAI_API_KEY`: OpenAI API 키
- `ANTHROPIC_API_KEY`: Anthropic API 키
- `GOOGLE_API_KEY`: Google AI API 키

## 📊 데이터베이스 스키마

### Post (포스트)
- 제목, 내용, 발췌문
- 카테고리, 태그
- 상태 (draft/published)
- 조회수, 좋아요

### PostVersion (버전 관리)
- 포스트 변경 이력 추적

### Blog (블로그 연동)
- 플랫폼별 연동 정보
- WordPress, Naver, Tistory

### PublishHistory (발행 이력)
- 각 플랫폼 발행 기록
- 성공/실패 상태

### MediaFile (미디어 파일)
- 이미지, 비디오 관리
- AI 생성 이미지 추적

### Setting (설정)
- 앱 설정 key-value 저장

## 🤖 멀티 모델 전략

### Smart (기본)
- 간단한 작업 → Gemini Flash (빠르고 저렴)
- 창의적 작업 → GPT-4o Mini (균형)
- 복잡한 SEO → Gemini Pro (품질)

### Cost (비용 최소화)
- 모든 작업 → Gemini Flash

### Quality (품질 최대화)
- 모든 작업 → Claude Sonnet

### Speed (속도 최대화)
- 모든 작업 → Gemini Flash

## 💰 예상 비용

월 300개 포스트 생성 시:
- 90% 간단한 작업 (Gemini Flash): $0.05/month
- 10% 복잡한 작업 (Gemini Pro): $0.15/month
- **총 AI 비용: ~$0.20/month**

호스팅 (Vercel Pro):
- Vercel Pro: $20/month
- Postgres: $20/month
- Blob Storage: $5/month
- **총 호스팅: $45/month**

**전체 운영 비용: ~$45.20/month**

## ✅ 구현 완료

### 백엔드 (40+ API 엔드포인트)
- ✅ 포스트 CRUD 및 버전 관리
- ✅ 시리즈 관리
- ✅ 아이디어 메모
- ✅ AI 콘텐츠 생성 (8가지 기능)
- ✅ SEO 및 콘텐츠 분석
- ✅ 태그 및 해시태그 생성
- ✅ WordPress 연동
- ✅ 블로그 및 카테고리 관리
- ✅ 미디어 파일 관리
- ✅ 설정 관리
- ✅ 대시보드 통계

### 프론트엔드
- ✅ 홈페이지
- ✅ 대시보드 (실시간 통계)
- ✅ 포스트 목록 및 관리
- ✅ 미디어 라이브러리
- ✅ 블로그 연동 UI
- ✅ 설정 페이지
- ✅ 공통 레이아웃 컴포넌트

### 데이터베이스
- ✅ 20개 테이블 완전 구현
- ✅ 관계 설정 및 Cascade 규칙
- ✅ 인덱스 최적화

## 📝 향후 개선 사항

- ⏳ 리치 텍스트 에디터 (Tiptap)
- ⏳ 이미지 생성 (DALL-E, Stable Diffusion)
- ⏳ 뉴스 크롤링
- ⏳ 예약 발행 스케줄러
- ⏳ 실시간 AI 스트리밍
- ⏳ 차트 및 분석 대시보드

## 🙏 기여

이슈와 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스

MIT License

---

**Made with ❤️ using Next.js 14 and Multi-AI Router**
