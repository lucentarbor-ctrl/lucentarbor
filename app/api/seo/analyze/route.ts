/**
 * SEO 분석 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      );
    }

    const analysis = await aiRouter.analyzeSEO(title, content);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('SEO 분석 에러:', error);
    return NextResponse.json(
      { error: error.message || 'SEO analysis failed' },
      { status: 500 }
    );
  }
}
