/**
 * 아이디어 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/ideas - 아이디어 목록 조회
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.idea.count(),
    ]);

    return NextResponse.json({
      status: 'success',
      data: ideas,
      total,
      skip,
      limit,
    });
  } catch (error: any) {
    console.error('아이디어 조회 에러:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/ideas - 아이디어 생성
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const idea = await prisma.idea.create({
      data: {
        content: data.content,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: idea,
      message: '아이디어가 저장되었습니다.',
    });
  } catch (error: any) {
    console.error('아이디어 생성 에러:', error);
    return NextResponse.json(
      { error: 'Failed to create idea', message: error.message },
      { status: 500 }
    );
  }
}
