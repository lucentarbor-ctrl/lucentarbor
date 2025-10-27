/**
 * 포스트 조회수 증가 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/posts/[id]/view - 조회수 증가
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: post,
    });
  } catch (error: any) {
    console.error('조회수 증가 에러:', error);
    return NextResponse.json(
      { error: 'Failed to increment views', message: error.message },
      { status: 500 }
    );
  }
}
