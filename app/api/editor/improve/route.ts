import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, action, aiModel = 'gemini-2.5-flash' } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Define prompts for each action
    const prompts: Record<string, string> = {
      grammar: `다음 글의 문법, 맞춤법, 띄어쓰기 오류를 찾아 수정해주세요. 원본의 의미와 스타일은 최대한 유지하되, 오류만 정확하게 고쳐주세요.

원본 글:
${content}

수정된 글을 그대로 반환해주세요. 설명은 필요 없습니다.`,

      context: `다음 글의 어색한 표현과 문맥을 자연스럽게 개선해주세요. 중복 표현을 제거하고 문장의 흐름을 부드럽게 만들어주세요.

원본 글:
${content}

개선된 글을 그대로 반환해주세요. 설명은 필요 없습니다.`,

      tone_formal: `다음 글을 격식체로 변환해주세요. 전문적이고 공식적인 어조로 바꿔주세요.

원본 글:
${content}

변환된 글을 그대로 반환해주세요. 설명은 필요 없습니다.`,

      tone_casual: `다음 글을 친근한 구어체로 변환해주세요. 자연스럽고 편안한 어조로 바꿔주세요.

원본 글:
${content}

변환된 글을 그대로 반환해주세요. 설명은 필요 없습니다.`,

      tone_professional: `다음 글을 전문적인 어조로 변환해주세요. 신뢰감 있고 권위 있는 톤으로 바꿔주세요.

원본 글:
${content}

변환된 글을 그대로 반환해주세요. 설명은 필요 없습니다.`,

      readability: `다음 글의 가독성을 높여주세요. 복잡한 문장은 단순하게, 긴 문장은 짧게, 어려운 단어는 쉽게 바꿔주세요.

원본 글:
${content}

개선된 글을 그대로 반환해주세요. 설명은 필요 없습니다.`,

      expand: `다음 글을 더 풍부하고 상세하게 확장해주세요. 구체적인 예시와 설명을 추가하여 내용을 보강해주세요.

원본 글:
${content}

확장된 글을 그대로 반환해주세요. 설명은 필요 없습니다.`,

      shorten: `다음 글을 간결하게 줄여주세요. 핵심 내용만 남기고 불필요한 부분을 제거해주세요.

원본 글:
${content}

축약된 글을 그대로 반환해주세요. 설명은 필요 없습니다.`,

      summarize: `다음 글을 3-5문장으로 요약해주세요. 핵심 내용만 간단명료하게 정리해주세요.

원본 글:
${content}

요약문을 반환해주세요.`,

      title: `다음 글의 내용을 바탕으로 클릭을 유도하는 매력적인 제목 5개를 제안해주세요. 각 제목은 다른 스타일로 작성해주세요.

글 내용:
${content}

5개의 제목을 번호와 함께 목록 형태로 반환해주세요.`,

      seo: `다음 글을 SEO 최적화해주세요:
1. 주요 키워드를 자연스럽게 배치
2. 적절한 제목 태그 (H1, H2, H3) 구조 추가
3. 메타 디스크립션 제안
4. 관련 키워드 추출

원본 글:
${content}

최적화된 글과 SEO 분석 결과를 함께 반환해주세요.`,
    };

    const prompt = prompts[action];
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Call Gemini API
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }
    );

    const improvedContent = geminiResponse.data.candidates[0]?.content?.parts[0]?.text || '';

    if (!improvedContent) {
      return NextResponse.json(
        { error: 'Failed to generate improved content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      originalContent: content,
      improvedContent: improvedContent.trim(),
      model: aiModel,
    });
  } catch (error: any) {
    console.error('Editor improve error:', error);
    return NextResponse.json(
      { error: 'Failed to improve content', details: error.message },
      { status: 500 }
    );
  }
}
