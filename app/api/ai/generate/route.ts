/**
 * AI 콘텐츠 생성 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

export async function POST(req: NextRequest) {
  try {
    const { prompt, taskType, model } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    const result = await aiRouter.generate(prompt, taskType || 'simple', model);

    return NextResponse.json({
      success: true,
      content: result,
      model: model || 'auto-selected',
    });
  } catch (error: any) {
    console.error('AI 생성 에러:', error);
    return NextResponse.json(
      { error: error.message || 'AI generation failed' },
      { status: 500 }
    );
  }
}
