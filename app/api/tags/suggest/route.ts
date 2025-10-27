/**
 * 태그 제안 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    const prompt = `다음 블로그 글에 적합한 태그와 카테고리를 제안해주세요:

제목: ${title}
내용: ${content.substring(0, 1000)}

JSON 형식으로 반환:
{
  "tags": ["태그1", "태그2", "태그3"],
  "category": "추천 카테고리"
}`;

    const result = await aiRouter.generate(prompt, 'simple');

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return NextResponse.json({ status: 'success', data: JSON.parse(jsonMatch[0]) });
      }
    } catch (e) {}

    return NextResponse.json({ status: 'success', data: { tags: ['일반'], category: '블로그' } });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to suggest tags', message: error.message }, { status: 500 });
  }
}
