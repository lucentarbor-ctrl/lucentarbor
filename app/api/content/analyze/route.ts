/**
 * 콘텐츠 분석 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

// POST /api/content/analyze - 콘텐츠 종합 분석
export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required', message: 'Please provide content to analyze' },
        { status: 400 }
      );
    }

    // 기본 통계
    const words = content.split(/\s+/).filter((w: string) => w.length > 0);
    const wordCount = words.length;
    const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const sentenceCount = sentences.length;
    const paragraphs = content.split(/\n\n+/).filter((p: string) => p.trim().length > 0);
    const paragraphCount = paragraphs.length;

    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgWordLength = words.reduce((sum: number, word: string) => sum + word.length, 0) / (wordCount || 1);

    // AI 분석 요청
    const prompt = `다음 블로그 콘텐츠를 분석해주세요:

제목: ${title || '(제목 없음)'}
내용: ${content.substring(0, 2000)}...

다음 항목을 JSON 형식으로 분석해주세요:
1. 가독성 점수 (0-100)
2. 상위 키워드 5개와 빈도수
3. 콘텐츠 품질 점수 (0-100)
4. 개선 제안 3가지

JSON 형식:
{
  "readability_score": 85,
  "top_keywords": [{"keyword": "AI", "count": 10, "density": 2.5}],
  "quality_score": 90,
  "suggestions": ["제안1", "제안2", "제안3"]
}

JSON만 반환하세요:`;

    const aiResult = await aiRouter.generate(prompt, 'analysis');

    let analysis: any = {
      readability_score: 75,
      top_keywords: [],
      quality_score: 70,
      suggestions: ['더 많은 예시 추가', '문단 구조 개선', '이미지 삽입'],
    };

    try {
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
    }

    return NextResponse.json({
      status: 'success',
      data: {
        word_count: wordCount,
        sentence_count: sentenceCount,
        paragraph_count: paragraphCount,
        avg_sentence_length: Math.round(avgSentenceLength * 10) / 10,
        avg_word_length: Math.round(avgWordLength * 10) / 10,
        ...analysis,
      },
    });
  } catch (error: any) {
    console.error('콘텐츠 분석 에러:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content', message: error.message },
      { status: 500 }
    );
  }
}
