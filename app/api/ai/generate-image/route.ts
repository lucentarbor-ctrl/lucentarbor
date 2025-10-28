/**
 * AI 이미지 생성 API
 * OpenAI DALL-E 연동
 */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, api_type, width = 1024, height = 1024, num_images = 1 } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { status: 'error', message: 'Prompt is required' },
        { status: 400 }
      );
    }

    // If no API key configured, return placeholder
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: 'placeholder',
        message: 'OpenAI API 키가 설정되지 않았습니다. 설정에서 API 키를 추가해주세요.',
        image_url: `https://via.placeholder.com/${width}x${height}/333333/FFFFFF?text=AI+Image+Generation`,
      });
    }

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: width >= 1024 ? '1024x1024' : '512x512',
        quality: 'standard',
      });

      const imageUrl = response.data[0]?.url;

      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }

      return NextResponse.json({
        status: 'success',
        image_url: imageUrl,
        message: '이미지가 생성되었습니다.',
        model: 'dall-e-3',
      });
    } catch (apiError: any) {
      console.error('DALL-E API Error:', apiError);

      // Return placeholder on API error
      return NextResponse.json({
        status: 'placeholder',
        message: `DALL-E API 오류: ${apiError.message}. Placeholder를 반환합니다.`,
        image_url: `https://via.placeholder.com/${width}x${height}/333333/FFFFFF?text=AI+Image+Generation+Failed`,
      });
    }
  } catch (error: any) {
    console.error('이미지 생성 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
