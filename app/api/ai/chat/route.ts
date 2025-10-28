/**
 * AI 챗봇 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/multi-model-router';

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content || lastMessage.text || '';

    if (!prompt) {
      return NextResponse.json(
        { error: 'No message content provided' },
        { status: 400 }
      );
    }

    // Build conversation context
    const contextPrompt = messages
      .slice(0, -1)
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content || msg.text}`)
      .join('\n');

    const fullPrompt = contextPrompt
      ? `${contextPrompt}\nUser: ${prompt}\nAssistant:`
      : prompt;

    const response = await aiRouter.generate(fullPrompt, 'creative', model);

    return NextResponse.json({
      status: 'success',
      message: response,
      model: model || 'auto-selected',
    });
  } catch (error: any) {
    console.error('AI 챗 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'AI chat failed' },
      { status: 500 }
    );
  }
}
