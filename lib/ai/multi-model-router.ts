/**
 * Multi-Model AI Router
 * 여러 AI 모델을 통합하여 작업에 따라 최적의 모델을 자동 선택
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIModel = 'gemini-flash' | 'gemini-pro' | 'gpt-4o-mini' | 'gpt-4o' | 'claude-sonnet' | 'claude-haiku';
export type TaskType = 'simple' | 'creative' | 'complex' | 'seo' | 'analysis';

interface ModelConfig {
  name: string;
  cost: number;  // $ per 1M tokens
  speed: 'fast' | 'medium' | 'slow';
  quality: 'good' | 'excellent' | 'best';
}

const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  'gemini-flash': { name: 'Gemini 2.5 Flash', cost: 0.19, speed: 'fast', quality: 'excellent' },
  'gemini-pro': { name: 'Gemini 2.5 Pro', cost: 3.75, speed: 'medium', quality: 'best' },
  'gpt-4o-mini': { name: 'GPT-4o Mini', cost: 0.38, speed: 'fast', quality: 'excellent' },
  'gpt-4o': { name: 'GPT-4o', cost: 6.38, speed: 'medium', quality: 'best' },
  'claude-sonnet': { name: 'Claude 3.5 Sonnet', cost: 9.45, speed: 'medium', quality: 'best' },
  'claude-haiku': { name: 'Claude 3 Haiku', cost: 0.63, speed: 'fast', quality: 'good' },
};

export class MultiModelRouter {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private gemini?: GoogleGenerativeAI;
  private strategy: 'smart' | 'cost' | 'quality' | 'speed';

  constructor(strategy: 'smart' | 'cost' | 'quality' | 'speed' = 'smart') {
    this.strategy = strategy;

    // Initialize clients
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    if (process.env.GOOGLE_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }
  }

  /**
   * 작업 유형에 따라 최적의 모델 선택
   */
  private selectModel(taskType: TaskType): AIModel {
    if (this.strategy === 'cost') {
      return 'gemini-flash';  // 가장 저렴
    }

    if (this.strategy === 'quality') {
      return 'claude-sonnet';  // 최고 품질
    }

    if (this.strategy === 'speed') {
      return 'gemini-flash';  // 가장 빠름
    }

    // Smart strategy - 작업에 따라 자동 선택
    switch (taskType) {
      case 'simple':
        return 'gemini-flash';
      case 'creative':
        return 'gpt-4o-mini';
      case 'complex':
      case 'seo':
      case 'analysis':
        return 'gemini-pro';
      default:
        return 'gemini-flash';
    }
  }

  /**
   * 텍스트 생성
   */
  async generate(prompt: string, taskType: TaskType = 'simple', model?: AIModel): Promise<string> {
    const selectedModel = model || this.selectModel(taskType);

    console.log(`🤖 사용 모델: ${MODEL_CONFIGS[selectedModel].name} (${taskType})`);

    try {
      switch (selectedModel) {
        case 'gemini-flash':
        case 'gemini-pro':
          return await this.generateWithGemini(prompt, selectedModel);

        case 'gpt-4o-mini':
        case 'gpt-4o':
          return await this.generateWithOpenAI(prompt, selectedModel);

        case 'claude-sonnet':
        case 'claude-haiku':
          return await this.generateWithClaude(prompt, selectedModel);

        default:
          throw new Error(`Unknown model: ${selectedModel}`);
      }
    } catch (error) {
      console.error(`❌ ${selectedModel} 실패:`, error);
      // 폴백: Gemini Flash (무료)
      if (selectedModel !== 'gemini-flash') {
        console.log('🔄 Gemini Flash로 폴백...');
        return await this.generateWithGemini(prompt, 'gemini-flash');
      }
      throw error;
    }
  }

  private async generateWithGemini(prompt: string, model: 'gemini-flash' | 'gemini-pro'): Promise<string> {
    if (!this.gemini) throw new Error('Gemini API key not configured');

    const modelName = model === 'gemini-pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const genModel = this.gemini.getGenerativeModel({ model: modelName });

    const result = await genModel.generateContent(prompt);
    return result.response.text();
  }

  private async generateWithOpenAI(prompt: string, model: 'gpt-4o-mini' | 'gpt-4o'): Promise<string> {
    if (!this.openai) throw new Error('OpenAI API key not configured');

    const completion = await this.openai.chat.completions.create({
      model: model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0].message.content || '';
  }

  private async generateWithClaude(prompt: string, model: 'claude-sonnet' | 'claude-haiku'): Promise<string> {
    if (!this.anthropic) throw new Error('Claude API key not configured');

    const modelName = model === 'claude-sonnet'
      ? 'claude-3-5-sonnet-20241022'
      : 'claude-3-haiku-20240307';

    const message = await this.anthropic.messages.create({
      model: modelName,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find(block => block.type === 'text');
    return textContent && 'text' in textContent ? textContent.text : '';
  }

  /**
   * 블로그 제목 생성 (SEO 최적화)
   */
  async generateTitles(topic: string, keywords?: string[]): Promise<Array<{ title: string; score: number }>> {
    const keywordsStr = keywords?.join(', ') || '';

    const prompt = `주제: ${topic}
${keywordsStr ? `키워드: ${keywordsStr}` : ''}

SEO 최적화된 블로그 제목 5개를 JSON 형식으로 생성해주세요.
각 제목은 50-60자이며, 클릭을 유도하는 매력적인 제목이어야 합니다.

JSON 형식:
[
  {"title": "제목1", "score": 95},
  {"title": "제목2", "score": 90}
]

JSON만 반환하세요:`;

    const result = await this.generate(prompt, 'seo', 'gemini-pro');

    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
    }

    // 폴백
    return [
      { title: `${topic}의 모든 것: 2025년 완벽 가이드`, score: 90 },
      { title: `${topic} 초보자를 위한 실전 노하우`, score: 85 },
    ];
  }

  /**
   * SEO 분석
   */
  async analyzeSEO(title: string, content: string): Promise<any> {
    const prompt = `다음 블로그 글의 SEO를 분석해주세요.

제목: ${title}
내용: ${content.substring(0, 1000)}

다음 JSON 형식으로 반환:
{
  "score": 85,
  "title": {"length": 50, "optimal": true, "suggestion": ""},
  "content": {"wordCount": 500, "readability": "좋음"},
  "improvements": ["개선사항1", "개선사항2"]
}`;

    const result = await this.generate(prompt, 'seo', 'gemini-pro');

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
    }

    return {
      score: 75,
      title: { length: title.length, optimal: title.length >= 50 && title.length <= 60 },
      content: { wordCount: content.split(' ').length, readability: "보통" },
      improvements: ["메타 설명 추가", "이미지 alt 텍스트 최적화"]
    };
  }
}

// 전역 인스턴스
export const aiRouter = new MultiModelRouter('smart');
