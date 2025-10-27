/**
 * 포스트 버전 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/[id]/versions - 버전 목록 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const versions = await prisma.postVersion.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: 'success',
      data: versions,
      total: versions.length,
    });
  } catch (error: any) {
    console.error('버전 조회 에러:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions', message: error.message },
      { status: 500 }
    );
  }
}
