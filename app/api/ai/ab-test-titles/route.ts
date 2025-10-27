/**
 * AI A/B 테스트 제목 생성 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

// POST /api/ai/ab-test-titles - A/B 테스트용 제목 생성
export async function POST(req: NextRequest) {
  try {
    const { topic, keywords, count } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required', message: 'Please provide a topic' },
        { status: 400 }
      );
    }

    const titleCount = count || 5;
    const keywordsStr = keywords?.join(', ') || '';

    const prompt = `주제: ${topic}
${keywordsStr ? `키워드: ${keywordsStr}` : ''}

A/B 테스트를 위한 블로그 제목 ${titleCount}개를 생성해주세요.
각 제목은 서로 다른 스타일과 접근 방식을 사용하세요:
1. 질문형 제목
2. 숫자/리스트형 제목
3. 호기심 유발형 제목
4. 문제해결형 제목
5. 트렌드/최신형 제목

각 제목에 대해 예상 클릭률(CTR) 점수(0-100)와 타겟 독자층을 JSON으로 제공하세요.

JSON 형식:
[
  {
    "title": "제목",
    "style": "질문형",
    "ctr_score": 85,
    "target_audience": "초보자",
    "reasoning": "이 제목이 효과적인 이유"
  }
]

JSON만 반환하세요:`;

    const result = await aiRouter.generate(prompt, 'creative');

    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          status: 'success',
          data: parsed,
        });
      }
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
    }

    // 폴백
    return NextResponse.json({
      status: 'success',
      data: [
        {
          title: `${topic}을 시작하는 완벽한 가이드`,
          style: '가이드형',
          ctr_score: 75,
          target_audience: '초보자',
          reasoning: '포괄적이고 접근하기 쉬운 제목',
        },
      ],
    });
  } catch (error: any) {
    console.error('A/B 테스트 제목 생성 에러:', error);
    return NextResponse.json(
      { error: 'Failed to generate A/B test titles', message: error.message },
      { status: 500 }
    );
  }
}
