/**
 * 설정 Upsert API (생성 또는 업데이트)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const key = searchParams.get('key');
    const value = searchParams.get('value');
    const category = searchParams.get('category');
    const description = searchParams.get('description');
    const isSecret = searchParams.get('is_secret') === 'true';

    if (!key) {
      return NextResponse.json(
        { status: 'error', message: 'key is required' },
        { status: 400 }
      );
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: {
        value: value || '',
        category: category || null,
        description: description || null,
        isSecret,
      },
      create: {
        key,
        value: value || '',
        category: category || null,
        description: description || null,
        isSecret,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: setting,
      message: '설정이 저장되었습니다.',
    });
  } catch (error: any) {
    console.error('설정 upsert 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
