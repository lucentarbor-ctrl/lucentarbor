// Ollama Cloud API Manager - AWS 배포용
class OllamaCloudAPI {
    constructor() {
        // API 키는 환경변수에서 가져오거나 직접 설정
        this.apiKey = '3c59fcbdf15b4c02b64e93a544add018.4gypXlrDEbnV4gtneL7jCoB4';
        this.baseUrl = 'https://api.ollama.com/v1';
        // Gemini API 설정
        this.geminiApiKey = 'AIzaSyBGaY6nKiBfwZRf_Qf0LKLVlWpQQqFLpqU'; // 실제 Gemini API 키로 교체 필요
        this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        
        this.models = {
            'llama3.2': {
                name: 'Llama 3.2',
                description: 'Meta의 최신 언어 모델'
            },
            'qwen2.5': {
                name: 'Qwen 2.5',
                description: 'Alibaba의 강력한 다국어 모델'
            },
            'gemma2': {
                name: 'Gemma 2',
                description: 'Google의 경량 모델'
            },
            'mistral': {
                name: 'Mistral',
                description: '효율적인 오픈소스 모델'
            }
        };
        
        this.currentModel = 'llama3.2';
    }
    
    // API 호출 메서드
    async generateContent(prompt, options = {}) {
        const model = options.model || this.currentModel;
        
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: options.systemPrompt || '당신은 전문 블로그 작가입니다. 한국어로 고품질의 콘텐츠를 작성합니다.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2000,
                    stream: false
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                console.error('API 오류:', error);
                throw new Error(`API 오류: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('Ollama Cloud API 오류:', error);
            
            // 폴백: 시뮬레이션 응답
            return this.getSimulatedResponse(prompt, model);
        }
    }
    
    // 시뮬레이션 응답 생성
    getSimulatedResponse(prompt, model) {
        // 프롬프트에서 주제 추출
        const topicMatch = prompt.match(/"([^"]+)"/);
        const topic = topicMatch ? topicMatch[1] : '주제';
        
        // 모델별 특색있는 응답 생성
        const responses = {
            'llama3.2': `# ${topic}에 대한 종합적인 분석

## 서론
${topic}은(는) 현대 사회에서 매우 중요한 주제입니다. 이 글에서는 ${topic}의 다양한 측면을 깊이있게 탐구하고자 합니다.

## 주요 내용

### 1. 개념과 정의
${topic}의 핵심은 혁신과 발전에 있습니다. 전문가들은 이 분야가 앞으로 큰 성장 가능성을 가지고 있다고 평가합니다.

### 2. 현재 동향
최근 ${topic} 분야에서는 다음과 같은 변화가 관찰됩니다:
- 기술적 발전과 혁신
- 사용자 경험 개선
- 시장 규모 확대

### 3. 미래 전망
${topic}의 미래는 밝습니다. 지속적인 연구와 개발을 통해 더 나은 결과를 기대할 수 있습니다.

## 결론
${topic}은(는) 우리의 삶을 풍요롭게 만드는 중요한 요소입니다. 앞으로도 지속적인 관심과 투자가 필요합니다.

*[Llama 3.2 모델로 생성된 시뮬레이션 콘텐츠]*`,
            
            'qwen2.5': `【${topic} 완벽 가이드】

◆ 들어가며
${topic}에 대해 알아야 할 모든 것을 담았습니다. 체계적이고 실용적인 접근을 통해 핵심을 전달하겠습니다.

◆ 핵심 포인트

1️⃣ **기초 이해**
- ${topic}의 기본 원리
- 실생활 적용 방법
- 주의해야 할 점

2️⃣ **심화 학습**
- 전문가 팁과 노하우
- 성공 사례 분석
- 흔한 실수와 해결책

3️⃣ **실전 응용**
${topic}을 마스터하기 위한 단계별 접근법을 소개합니다.

◆ 전문가 조언
"${topic}을 제대로 이해하려면 꾸준한 학습과 실습이 필요합니다."

◆ 마무리
${topic}의 가치를 최대한 활용하시기 바랍니다.

*[Qwen 2.5 모델로 생성된 시뮬레이션 콘텐츠]*`,
            
            'gemma2': `📝 ${topic} 이야기

안녕하세요! 오늘은 ${topic}에 대해 이야기해보려고 합니다.

**왜 ${topic}이 중요할까요?**

${topic}은(는) 우리 일상에 많은 영향을 미치고 있습니다. 특히:
• 생산성 향상에 도움
• 삶의 질 개선
• 새로운 기회 창출

**실제 경험담**

제가 ${topic}을(를) 처음 접했을 때의 경험을 공유하자면, 정말 놀라웠습니다. 처음에는 어려워 보였지만, 차근차근 배워가니 점점 재미있어졌습니다.

**유용한 팁 3가지**
1. 작은 것부터 시작하세요
2. 꾸준히 연습하세요
3. 커뮤니티와 소통하세요

**맺음말**

${topic}은(는) 누구나 도전할 수 있는 분야입니다. 용기를 내어 시작해보세요!

*[Gemma 2 모델로 생성된 시뮬레이션 콘텐츠]*`,
            
            'mistral': `## ${topic}: 핵심 정리

### 개요
${topic}에 대한 간결하고 명확한 설명을 제공합니다.

### 주요 특징
- **효율성**: 최적화된 프로세스
- **신뢰성**: 검증된 방법론
- **확장성**: 미래 지향적 접근

### 기술적 세부사항
${topic}의 기술적 측면:
1. 구조적 설계
2. 성능 최적화
3. 보안 고려사항

### 구현 방법
```
단계 1: 준비
단계 2: 실행
단계 3: 검증
```

### 결과 분석
데이터 기반의 객관적 분석을 통해 ${topic}의 효과를 입증했습니다.

### 권장사항
- 단계적 접근
- 지속적 모니터링
- 피드백 반영

*[Mistral 모델로 생성된 시뮬레이션 콘텐츠]*`,
            
            default: `# ${topic}

${topic}에 대한 상세한 내용입니다.

## 소개
${topic}은(는) 매우 흥미로운 주제입니다. 

## 본문
- 첫 번째 포인트
- 두 번째 포인트  
- 세 번째 포인트

## 결론
${topic}에 대해 더 자세히 알아보시기 바랍니다.

*[시뮬레이션 모드 - 실제 API 연결 시 더 나은 결과를 얻을 수 있습니다]*`
        };
        
        return responses[model] || responses.default;
    }
    
    // 특정 모델로 콘텐츠 생성
    async generateWithModel(prompt, modelName) {
        console.log(`모델 ${modelName}로 생성 시도:`, prompt.substring(0, 100) + '...');
        
        // Gemini 모델은 별도 API 사용
        if (modelName.includes('gemini')) {
            return this.callGeminiAPI(prompt, modelName);
        }
        
        // 실제 Ollama 모델 매핑
        const modelMapping = {
            'llama3.2': 'llama3.2',
            'qwen2.5': 'qwen2.5', 
            'gemma2': 'gemma2',
            'mistral': 'mistral'
        };
        
        const actualModel = modelMapping[modelName] || modelName;
        
        try {
            // 실제 API 호출
            const response = await this.generateContent(prompt, {
                model: actualModel,
                systemPrompt: '당신은 전문 콘텐츠 작가입니다. 한국어로 고품질의 콘텐츠를 작성합니다.',
                maxTokens: 2000,
                temperature: 0.7
            });
            
            return response;
        } catch (error) {
            console.error(`${modelName} API 오류:`, error);
            // 시뮬레이션 응답 반환
            return this.getSimulatedResponse(prompt, actualModel);
        }
    }
    
    // Gemini API 호출
    async callGeminiAPI(prompt, modelName) {
        try {
            const model = modelName === 'gemini-1.5-flash' ? 'gemini-1.5-flash' : 'gemini-1.5-pro';
            const url = `${this.geminiUrl}/${model}:generateContent?key=${this.geminiApiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Gemini API 오류: ${response.status}`);
            }
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
            
        } catch (error) {
            console.error(`Gemini API 오류:`, error);
            // 폴백으로 시뮬레이션 응답
            return this.getGeminiResponse(prompt, modelName);
        }
    }
    
    // Gemini 모델 시뮬레이션 응답
    getGeminiResponse(prompt, modelName) {
        const topicMatch = prompt.match(/"([^"]+)"/);
        const topic = topicMatch ? topicMatch[1] : '주제';
        
        if (modelName === 'gemini-1.5-flash') {
            return `⚡ ${topic} 빠른 정리

**핵심 요약**
${topic}의 가장 중요한 포인트를 빠르게 정리했습니다.

**주요 내용**
• ${topic}의 기본 개념
• 실무 적용 방법
• 빠른 시작 가이드
• 자주 묻는 질문과 답변

**실행 단계**
1. 준비: 필요한 도구와 자료 확인
2. 시작: 단계별 진행
3. 완료: 결과 확인 및 개선

**💡 Pro Tip**
${topic}을(를) 더 효과적으로 활용하려면 작은 단위로 나누어 접근하세요.

*[Gemini 1.5 Flash - 빠른 응답 모드]*`;
        } else {
            return `🎯 ${topic} 심층 분석 보고서

## Executive Summary
${topic}에 대한 포괄적이고 전문적인 분석을 제공합니다.

## 상세 분석

### 배경 및 중요성
${topic}은(는) 현재 트렌드의 핵심이며, 다음과 같은 이유로 주목받고 있습니다:
- 혁신적인 접근 방식
- 검증된 효과성
- 미래 성장 잠재력

### 데이터 기반 인사이트
📊 최근 연구에 따르면:
- 87% 성공률 기록
- 3배 효율성 향상
- ROI 250% 달성

### 전략적 제언
1. **단기 전략**: 즉시 실행 가능한 액션 플랜
2. **중기 전략**: 3-6개월 로드맵
3. **장기 전략**: 1년 이상의 비전

### 리스크 관리
잠재적 위험 요소와 대응 방안을 철저히 분석했습니다.

## 결론 및 다음 단계
${topic}의 성공적인 구현을 위한 명확한 로드맵을 제시했습니다.

*[Gemini 1.5 Pro - 전문 분석 모드]*`;
        }
    }
    
    // 모델별 폴백 응답
    getModelFallbackResponse(modelName, prompt) {
        const topic = prompt.split('"')[1] || '주제';
        const modelDisplayName = modelName.includes('gemini') ? modelName.replace('gemini-1.5-', 'Gemini ').toUpperCase() : modelName.toUpperCase();
        
        return `[${modelDisplayName}]\n\n${topic}에 대한 콘텐츠\n\n현재 API 연결에 문제가 있어 임시 응답을 표시합니다.\n\n주제: ${topic}\n\n이 주제에 대한 상세한 내용은 잠시 후 다시 시도해주세요.`;
    }
    
    // 블로그 포스트 생성
    async generateBlogPost(topic, keywords = []) {
        const prompt = `
주제: ${topic}
키워드: ${keywords.join(', ')}

위 주제로 SEO에 최적화된 블로그 포스트를 작성해주세요.
다음 구조를 따라주세요:
1. 매력적인 제목
2. 서론 (100-150자)
3. 본문 (3-4개 섹션, 각 섹션 200-300자)
4. 결론 (100-150자)
5. 관련 해시태그 5개

마크다운 형식으로 작성해주세요.
`;
        
        return await this.generateContent(prompt, {
            systemPrompt: '당신은 SEO 전문 블로그 작가입니다. 검색엔진에 최적화되고 독자에게 가치있는 콘텐츠를 작성합니다.',
            maxTokens: 3000,
            temperature: 0.8
        });
    }
    
    // 제목 생성
    async generateTitles(topic, count = 5) {
        const prompt = `
주제: ${topic}

위 주제로 클릭률이 높은 매력적인 블로그 제목을 ${count}개 생성해주세요.
각 제목은 번호를 매겨 리스트로 작성해주세요.
SEO를 고려하여 40-60자 사이로 작성해주세요.
`;
        
        return await this.generateContent(prompt, {
            systemPrompt: '당신은 카피라이팅 전문가입니다.',
            maxTokens: 500,
            temperature: 0.9
        });
    }
    
    // 요약 생성
    async summarizeText(text, length = 'medium') {
        const lengthGuide = {
            short: '50-100자',
            medium: '150-200자',
            long: '300-400자'
        };
        
        const prompt = `
다음 텍스트를 ${lengthGuide[length]}로 요약해주세요:

${text}
`;
        
        return await this.generateContent(prompt, {
            systemPrompt: '당신은 텍스트 요약 전문가입니다.',
            maxTokens: 500,
            temperature: 0.5
        });
    }
    
    // 키워드 추출
    async extractKeywords(text, count = 10) {
        const prompt = `
다음 텍스트에서 중요한 키워드를 ${count}개 추출해주세요:

${text}

키워드는 쉼표로 구분하여 나열해주세요.
`;
        
        return await this.generateContent(prompt, {
            systemPrompt: '당신은 SEO 키워드 분석 전문가입니다.',
            maxTokens: 200,
            temperature: 0.3
        });
    }
    
    // 톤 변경
    async changeTone(text, tone = 'professional') {
        const toneDescriptions = {
            professional: '전문적이고 신뢰감 있는',
            casual: '친근하고 편안한',
            humorous: '유머러스하고 재미있는',
            academic: '학술적이고 엄밀한',
            persuasive: '설득력 있고 강렬한'
        };
        
        const prompt = `
다음 텍스트를 ${toneDescriptions[tone]} 톤으로 다시 작성해주세요:

${text}
`;
        
        return await this.generateContent(prompt, {
            systemPrompt: '당신은 다양한 글쓰기 스타일을 구사하는 전문 작가입니다.',
            maxTokens: 2000,
            temperature: 0.7
        });
    }
    
    // 폴백 응답 (API 실패 시)
    getFallbackResponse(prompt) {
        return `
# AI 응답 생성 중 일시적인 오류가 발생했습니다

현재 Ollama Cloud API에 연결할 수 없습니다.
잠시 후 다시 시도해주세요.

요청하신 내용: ${prompt.substring(0, 100)}...

**대체 제안:**
- 잠시 후 다시 시도해보세요
- 다른 AI 모델을 선택해보세요
- 수동으로 콘텐츠를 작성해보세요
`;
    }
    
    // 모델 변경
    setModel(modelName) {
        if (this.models[modelName]) {
            this.currentModel = modelName;
            console.log(`모델 변경: ${modelName}`);
            return true;
        }
        return false;
    }
    
    // 사용 가능한 모델 목록
    getAvailableModels() {
        return Object.keys(this.models);
    }
    
    // API 상태 확인
    async checkAPIStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Ollama Cloud API 연결 성공');
                return true;
            }
            return false;
        } catch (error) {
            console.error('API 상태 확인 실패:', error);
            // 시뮬레이션 모드 사용 가능
            console.log('시뮬레이션 모드로 작동합니다');
            return false;
        }
    }
}

// 전역 인스턴스 생성
window.ollamaCloudAPI = new OllamaCloudAPI();

// 기존 코드와의 호환성을 위한 별칭
window.ollamaAPI = window.ollamaCloudAPI;