/**
 * 해시태그 생성 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

export async function POST(req: NextRequest) {
  try {
    const { title, content, count } = await req.json();
    const hashtagCount = count || 10;

    const prompt = `다음 블로그 글을 위한 해시태그 ${hashtagCount}개를 생성해주세요:

제목: ${title}
내용: ${content.substring(0, 500)}

JSON 배열로 반환: ["#해시태그1", "#해시태그2"]`;

    const result = await aiRouter.generate(prompt, 'simple');

    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return NextResponse.json({ status: 'success', data: JSON.parse(jsonMatch[0]) });
      }
    } catch (e) {}

    return NextResponse.json({ status: 'success', data: ['#블로그', '#콘텐츠'] });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate hashtags', message: error.message }, { status: 500 });
  }
}
