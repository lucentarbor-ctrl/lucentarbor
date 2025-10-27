/**
 * AI 팩트체크 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

// POST /api/ai/fact-check - 팩트 체크
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required', message: 'Please provide text to fact-check' },
        { status: 400 }
      );
    }

    const prompt = `다음 텍스트에서 사실 확인이 필요한 주장들을 찾아 검증해주세요. JSON 형식으로 반환하세요.

텍스트:
${text}

다음 JSON 형식으로 반환:
{
  "claims": [
    {
      "claim": "주장 내용",
      "status": "verified" | "needs_verification" | "false",
      "explanation": "설명",
      "sources": ["출처1", "출처2"]
    }
  ],
  "overall_reliability": "높음" | "보통" | "낮음"
}

JSON만 반환하세요:`;

    const result = await aiRouter.generate(prompt, 'analysis');

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
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
      data: {
        claims: [],
        overall_reliability: '보통',
        raw_response: result,
      },
    });
  } catch (error: any) {
    console.error('팩트체크 에러:', error);
    return NextResponse.json(
      { error: 'Failed to fact-check', message: error.message },
      { status: 500 }
    );
  }
}
