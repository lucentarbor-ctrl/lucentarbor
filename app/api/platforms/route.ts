/**
 * 플랫폼 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/platforms - 플랫폼 목록 조회
export async function GET() {
  try {
    const platforms = await prisma.platformConfig.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      status: 'success',
      data: platforms,
    });
  } catch (error: any) {
    console.error('플랫폼 조회 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/platforms - 플랫폼 생성
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const platform = await prisma.platformConfig.create({
      data: {
        platformName: data.platform_name,
        displayName: data.display_name,
        config: data.config || {},
        isEnabled: data.is_enabled ?? false,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: platform,
      message: '플랫폼이 생성되었습니다.',
    });
  } catch (error: any) {
    console.error('플랫폼 생성 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
