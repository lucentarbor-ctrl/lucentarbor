/**
 * 개별 포스트 CRUD API - FastAPI Migration
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/[id] - 포스트 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        series: true,
        versions: {
          orderBy: { createdAt: 'desc' },
        },
        histories: {
          orderBy: { publishedAt: 'desc' },
        },
        contentAnalyses: {
          orderBy: { analyzedAt: 'desc' },
          take: 1,
        },
        performanceMetrics: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found', message: 'The requested post does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: post,
    });
  } catch (error: any) {
    console.error('포스트 조회 에러:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - 포스트 업데이트
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    const data = await req.json();

    // 현재 포스트 확인
    const currentPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!currentPost) {
      return NextResponse.json(
        { error: 'Post not found', message: 'The requested post does not exist' },
        { status: 404 }
      );
    }

    // 포스트 업데이트 + 새 버전 생성
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        status: data.status,
        seriesId: data.series_id || null,
        publishedTime: data.status === 'published' && !currentPost.publishedTime ? new Date() : currentPost.publishedTime,
        versions: {
          create: {
            title: data.title,
            content: data.content,
          },
        },
      },
      include: {
        series: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      data: post,
      message: '포스트가 업데이트되었습니다.',
    });
  } catch (error: any) {
    console.error('포스트 업데이트 에러:', error);
    return NextResponse.json(
      { error: 'Failed to update post', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 포스트 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    // 포스트 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found', message: 'The requested post does not exist' },
        { status: 404 }
      );
    }

    // 포스트 삭제 (CASCADE로 관련 데이터도 자동 삭제)
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      status: 'success',
      message: '포스트가 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('포스트 삭제 에러:', error);
    return NextResponse.json(
      { error: 'Failed to delete post', message: error.message },
      { status: 500 }
    );
  }
}
