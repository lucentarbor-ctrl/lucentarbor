// Google Gemini API Integration
const GEMINI_API_KEY = 'AIzaSyAmLSwyMGCkDpSojwPjQwTnYmlAQjrdH7g';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

class GeminiAPI {
    constructor() {
        this.apiKey = GEMINI_API_KEY;
        this.headers = {
            'Content-Type': 'application/json',
        };
    }

    async generateContent(prompt, options = {}) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: options.temperature || 0.7,
                        maxOutputTokens: options.maxOutputTokens || 2048,
                        topP: options.topP || 0.95,
                        topK: options.topK || 40
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            }
            throw new Error('응답에서 컨텐츠를 찾을 수 없습니다');
        } catch (error) {
            console.error('Gemini API 오류:', error);
            throw error;
        }
    }

    // 블로그 포스트 생성
    async generateBlogPost(topic, style = 'professional') {
        const prompt = `
주제: ${topic}
스타일: ${style}

위 주제로 완성도 높은 블로그 포스트를 작성해주세요. 
다음 구조를 따라주세요:
1. 매력적인 제목
2. 서론 (독자의 관심을 끄는 도입부)
3. 본론 (3-4개의 주요 포인트)
4. 결론 (핵심 요약 및 행동 촉구)

SEO를 고려하여 자연스럽게 키워드를 포함시켜주세요.
`;
        return this.generateContent(prompt);
    }

    // 제목 생성
    async generateTitle(content) {
        const prompt = `다음 내용을 읽고 매력적이고 SEO 최적화된 블로그 제목 5개를 제안해주세요:\n\n${content}\n\n각 제목은 한 줄로 작성하고, 번호를 매겨주세요.`;
        return this.generateContent(prompt, { maxOutputTokens: 256 });
    }

    // 요약 생성
    async generateSummary(content) {
        const prompt = `다음 내용을 150-200자로 간결하게 요약해주세요:\n\n${content}`;
        return this.generateContent(prompt, { maxOutputTokens: 256 });
    }

    // SEO 메타 설명 생성
    async generateMetaDescription(content) {
        const prompt = `다음 블로그 포스트를 위한 SEO 메타 설명(155자 이내)을 작성해주세요:\n\n${content}`;
        return this.generateContent(prompt, { maxOutputTokens: 128 });
    }

    // 해시태그 생성
    async generateHashtags(content) {
        const prompt = `다음 블로그 포스트에 적합한 해시태그 10개를 생성해주세요. 각 해시태그는 # 기호로 시작해야 합니다:\n\n${content}`;
        return this.generateContent(prompt, { maxOutputTokens: 128 });
    }

    // 관련 주제 추천
    async suggestRelatedTopics(topic) {
        const prompt = `"${topic}" 주제와 관련된 블로그 포스트 주제 5개를 추천해주세요. 각 주제는 한 줄로 작성하고 번호를 매겨주세요.`;
        return this.generateContent(prompt, { maxOutputTokens: 256 });
    }
}

// 전역 객체로 export
window.geminiAPI = new GeminiAPI();