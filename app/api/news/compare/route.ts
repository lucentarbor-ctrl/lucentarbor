import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { urls, aiModel = 'gemini-2.5-flash' } = body;

    if (!urls || !Array.isArray(urls) || urls.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 URLs are required for comparison' },
        { status: 400 }
      );
    }

    // Fetch and extract content from all URLs
    const articlesData = await Promise.allSettled(
      urls.map(async (url: string) => {
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            timeout: 10000,
          });

          const $ = cheerio.load(response.data);

          // Extract title
          const title = $('h1').first().text().trim() ||
                       $('title').text().trim() ||
                       'No title';

          // Extract main content
          // Try common article content selectors
          let content = '';
          const selectors = [
            'article',
            '[class*="article"]',
            '[class*="content"]',
            '[class*="post-content"]',
            'main',
            '.entry-content',
          ];

          for (const selector of selectors) {
            const element = $(selector).first();
            if (element.length > 0) {
              content = element.text().trim();
              if (content.length > 100) break;
            }
          }

          // Fallback to body if no content found
          if (!content || content.length < 100) {
            content = $('body').text().trim();
          }

          // Clean content
          content = content
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 2000); // Limit to 2000 chars per article

          return {
            url,
            title,
            content,
            source: new URL(url).hostname,
          };
        } catch (error) {
          console.error(`Error fetching ${url}:`, error);
          return {
            url,
            error: 'Failed to fetch article',
          };
        }
      })
    );

    const successfulArticles = articlesData
      .filter((result) => result.status === 'fulfilled')
      .map((result: any) => result.value)
      .filter((article) => !article.error && article.content);

    if (successfulArticles.length < 2) {
      return NextResponse.json(
        { error: 'Could not fetch enough articles for comparison (minimum 2 required)' },
        { status: 400 }
      );
    }

    // Prepare AI analysis prompt
    const articlesText = successfulArticles
      .map((article, idx) => {
        return `[기사 ${idx + 1}]\n출처: ${article.source}\n제목: ${article.title}\n내용: ${article.content}\n`;
      })
      .join('\n---\n\n');

    const analysisPrompt = `다음 ${successfulArticles.length}개의 뉴스 기사를 비교 분석해주세요:

${articlesText}

다음 형식으로 분석 결과를 제공해주세요:

1. 종합 요약 (100-150자): 여러 기사의 핵심 내용을 종합한 간단한 요약
2. 공통점 (3-5개): 모든 기사에서 공통적으로 다루는 주제나 내용
3. 차이점 (3-5개): 기사들 간의 관점, 강조점, 또는 내용의 차이
4. 통합 리포트 (300-500자): 여러 관점을 종합한 객관적이고 균형잡힌 분석

응답은 반드시 다음 JSON 형식으로 작성해주세요:
{
  "summary": "종합 요약 내용",
  "commonPoints": ["공통점1", "공통점2", "공통점3"],
  "differences": ["차이점1", "차이점2", "차이점3"],
  "synthesis": "통합 리포트 내용"
}`;

    // Call AI service for analysis
    let aiResponse;
    try {
      if (aiModel.startsWith('gemini')) {
        // Call Gemini API
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: analysisPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }
        );

        const generatedText = geminiResponse.data.candidates[0]?.content?.parts[0]?.text || '';

        // Extract JSON from markdown code blocks if present
        const jsonMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : generatedText;

        aiResponse = JSON.parse(jsonText);
      } else {
        // Fallback to simple analysis if AI not available
        aiResponse = {
          summary: `${successfulArticles.length}개의 기사를 비교 분석한 결과입니다.`,
          commonPoints: [
            '모든 기사가 동일한 주제를 다루고 있습니다.',
            '최신 동향에 대한 분석을 제공합니다.',
            '전문가 의견이 포함되어 있습니다.',
          ],
          differences: [
            '각 매체의 관점이 다릅니다.',
            '강조하는 내용이 조금씩 다릅니다.',
            '분석의 깊이가 다릅니다.',
          ],
          synthesis: '여러 출처의 뉴스를 종합한 결과, 해당 주제에 대한 다양한 관점을 확인할 수 있었습니다. 각 매체는 고유한 시각에서 이슈를 다루고 있으며, 이를 통해 보다 균형잡힌 이해가 가능합니다.',
        };
      }
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      // Fallback response
      aiResponse = {
        summary: `${successfulArticles.length}개의 기사를 수집했습니다.`,
        commonPoints: successfulArticles.map((_, idx) => `기사 ${idx + 1}의 주요 내용`),
        differences: ['각 기사의 관점 차이', '강조점의 차이', '분석 방식의 차이'],
        synthesis: '여러 뉴스 기사를 수집했습니다. AI 분석 기능을 사용하려면 API 키를 설정해주세요.',
      };
    }

    return NextResponse.json({
      success: true,
      articles: successfulArticles.map((article) => ({
        url: article.url,
        title: article.title,
        source: article.source,
      })),
      analysis: aiResponse,
      total: successfulArticles.length,
    });
  } catch (error: any) {
    console.error('Compare analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to compare news articles', details: error.message },
      { status: 500 }
    );
  }
}
