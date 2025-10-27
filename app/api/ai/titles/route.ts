/**
 * AI 제목 생성 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

export async function POST(req: NextRequest) {
  try {
    const { topic, keywords } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'topic is required' },
        { status: 400 }
      );
    }

    const titles = await aiRouter.generateTitles(topic, keywords);

    return NextResponse.json({
      success: true,
      titles,
    });
  } catch (error: any) {
    console.error('제목 생성 에러:', error);
    return NextResponse.json(
      { error: error.message || 'Title generation failed' },
      { status: 500 }
    );
  }
}
