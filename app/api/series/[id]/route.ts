/**
 * 개별 시리즈 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/series/[id] - 시리즈 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const seriesId = parseInt(id);

    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        posts: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            views: true,
          },
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        { error: 'Series not found', message: 'The requested series does not exist' },
        { status: 404 }
      );
    }

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
