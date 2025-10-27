/**
 * 특정 버전 조회 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/versions/[version_id] - 특정 버전 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ version_id: string }> }
) {
  try {
    const { version_id } = await params;
    const versionId = parseInt(version_id);

    const version = await prisma.postVersion.findUnique({
      where: { id: versionId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!version) {
      return NextResponse.json(
        { error: 'Version not found', message: 'The requested version does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: version,
    });
  } catch (error: any) {
    console.error('버전 조회 에러:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version', message: error.message },
      { status: 500 }
    );
  }
}
