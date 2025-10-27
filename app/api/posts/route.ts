/**
 * 포스트 CRUD API - FastAPI Migration
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts - 포스트 목록 조회
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const seriesId = searchParams.get('series_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (seriesId) where.seriesId = parseInt(seriesId);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          series: true,
          _count: {
            select: {
              versions: true,
              histories: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      status: 'success',
      data: posts,
      total,
      skip,
      limit,
    });
  } catch (error: any) {
    console.error('포스트 조회 에러:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/posts - 포스트 생성
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        status: data.status || 'draft',
        seriesId: data.series_id || null,
        publishedTime: data.status === 'published' ? new Date() : null,
        versions: {
          create: {
            title: data.title,
            content: data.content,
          },
        },
      },
      include: {
        series: true,
        versions: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: post,
      message: '포스트가 생성되었습니다.',
    });
  } catch (error: any) {
    console.error('포스트 생성 에러:', error);
    return NextResponse.json(
      { error: 'Failed to create post', message: error.message },
      { status: 500 }
    );
  }
}
