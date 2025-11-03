import { NextResponse } from 'next/server';

/**
 * 뉴스 기사 리라이팅 API
 * URL과 제목을 받아서 AI로 리라이팅된 블로그 포스트 생성
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title, summary, model = 'gemini-2.5-flash' } = body;

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    // AI 프롬프트 생성
    const prompt = `다음 뉴스 기사를 블로그 포스트로 리라이팅해주세요.

원본 기사 제목: ${title}
원본 기사 URL: ${url}
${summary ? `기사 요약: ${summary}` : ''}

다음 형식으로 작성해주세요:

## 제목
[SEO 최적화된 매력적인 한글 제목, 50-60자]

## 본문
[1500-2000자의 상세한 블로그 포스트]
- 원본 기사의 핵심 내용을 포함하되, 완전히 새롭게 작성
- 독자가 이해하기 쉽게 풀어서 설명
- 구체적인 사례나 예시 추가
- 단락을 명확히 구분
- 마크다운 형식 사용

요구사항:
1. 표절이 아닌 완전히 새로운 관점으로 재작성
2. 전문적이고 신뢰감 있는 어조 사용
3. SEO 최적화를 고려한 키워드 자연스럽게 포함
4. 독자에게 유용한 인사이트 제공
5. 한국어로 작성

당신은 전문 블로그 작가이자 SEO 전문가입니다. 고품질의 블로그 포스트를 작성합니다.`;

    // FastAPI 서버에 AI 생성 요청
    const aiResponse = await fetch('http://localhost:5001/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        model: model
      })
    });

    if (!aiResponse.ok) {
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    const fullContent = aiData.generated_text || aiData.content || '';

    // AI 응답에서 제목 추출
    let extractedTitle = title;
    let extractedContent = fullContent;

    // "## 제목" 패턴으로 제목 추출
    const titleMatch = fullContent.match(/##\s*제목\s*\n\s*(.+?)(?:\n|$)/i);
    if (titleMatch && titleMatch[1]) {
      extractedTitle = titleMatch[1].trim();
      extractedContent = fullContent.replace(/##\s*제목\s*\n\s*.+?\n/i, '');
    } else {
      // "## " 뒤의 첫 번째 줄을 제목으로
      const h2Match = fullContent.match(/##\s*(.+?)(?:\n|$)/);
      if (h2Match && h2Match[1] && !h2Match[1].includes('본문')) {
        extractedTitle = h2Match[1].trim();
      }
    }

    // "## 본문" 섹션 제거
    extractedContent = extractedContent.replace(/##\s*본문\s*\n/i, '');

    // 마크다운을 HTML로 변환 (간단한 변환)
    extractedContent = extractedContent
      .replace(/### (.+?)(?:\n|$)/g, '<h3>$1</h3>\n')
      .replace(/## (.+?)(?:\n|$)/g, '<h2>$1</h2>\n')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hp])/gm, '<p>')
      .replace(/(?<![>])$/gm, '</p>');

    return NextResponse.json({
      success: true,
      title: extractedTitle,
      content: extractedContent,
      originalUrl: url,
      originalTitle: title,
      model: model
    });
  } catch (error: any) {
    console.error('News rewrite error:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite news', details: error.message },
      { status: 500 }
    );
  }
}
