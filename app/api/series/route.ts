/**
 * 시리즈 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/series - 시리즈 목록 조회
export async function GET(req: NextRequest) {
  try {
    const series = await prisma.series.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: series,
    });
  } catch (error: any) {
    console.error('시리즈 조회 에러:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/series - 시리즈 생성
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const series = await prisma.series.create({
      data: {
        title: data.title,
        description: data.description,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: series,
      message: '시리즈가 생성되었습니다.',
    });
  } catch (error: any) {
    console.error('시리즈 생성 에러:', error);
    return NextResponse.json(
      { error: 'Failed to create series', message: error.message },
      { status: 500 }
    );
  }
}
