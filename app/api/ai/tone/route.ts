/**
 * AI 톤 변경 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

// POST /api/ai/tone - 텍스트 톤 변경
export async function POST(req: NextRequest) {
  try {
    const { text, tone } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required', message: 'Please provide text to change tone' },
        { status: 400 }
      );
    }

    const toneDescriptions: Record<string, string> = {
      professional: '전문적이고 격식있는',
      friendly: '친근하고 편안한',
      creative: '창의적이고 독특한',
      academic: '학술적이고 정확한',
      casual: '캐주얼하고 자연스러운',
      formal: '공식적이고 엄격한',
    };

    const selectedTone = tone || 'professional';
    const toneDesc = toneDescriptions[selectedTone] || toneDescriptions.professional;

    const prompt = `다음 텍스트를 ${toneDesc} 톤으로 다시 작성해주세요. 의미는 유지하되 톤만 변경하세요.

원문:
${text}

${toneDesc} 톤으로 다시 작성:`;

    const result = await aiRouter.generate(prompt, 'creative');

    return NextResponse.json({
      status: 'success',
      data: {
        original: text,
        tone: selectedTone,
        result: result.trim(),
      },
    });
  } catch (error: any) {
    console.error('톤 변경 에러:', error);
    return NextResponse.json(
      { error: 'Failed to change tone', message: error.message },
      { status: 500 }
    );
  }
}
