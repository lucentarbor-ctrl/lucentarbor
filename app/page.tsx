import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

export default function Home() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🤖 AI 자동 블로그 시스템
            </h1>
            <p className="text-xl text-gray-600">
              멀티 AI 모델을 활용한 차세대 블로그 자동화 플랫폼
            </p>
          </div>

          {/* 주요 기능 카드 */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">멀티 AI 모델</h3>
              <p className="text-gray-600">
                Gemini, GPT-4o, Claude를 작업에 따라 자동 선택
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">SEO 최적화</h3>
              <p className="text-gray-600">
                AI 기반 제목 생성 및 실시간 SEO 분석
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">자동 배포</h3>
              <p className="text-gray-600">
                WordPress, Tistory, Naver 자동 발행
              </p>
            </div>
          </div>

          {/* AI 모델 정보 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">사용 중인 AI 모델</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-semibold">Gemini 2.5 Flash</h3>
                  <p className="text-sm text-gray-600">빠른 작업, 비용 최소화</p>
                </div>
                <span className="text-green-600 font-semibold">$0.19/1M</span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-semibold">GPT-4o Mini</h3>
                  <p className="text-sm text-gray-600">창의적 작업, 균형잡힌 성능</p>
                </div>
                <span className="text-blue-600 font-semibold">$0.38/1M</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Gemini 2.5 Pro</h3>
                  <p className="text-sm text-gray-600">복잡한 분석, 최고 품질</p>
                </div>
                <span className="text-purple-600 font-semibold">$3.75/1M</span>
              </div>
            </div>
          </div>

          {/* 시작하기 버튼 */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              대시보드로 이동 →
            </Link>
          </div>

          {/* 기술 스택 */}
          <div className="mt-12 text-center text-gray-600">
            <p className="text-sm">
              Powered by Next.js 14 • Prisma • Tailwind CSS • Multi-AI Router
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
