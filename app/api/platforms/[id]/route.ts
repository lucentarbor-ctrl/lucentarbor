/**
 * 플랫폼 개별 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/platforms/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const platform = await prisma.platformConfig.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!platform) {
      return NextResponse.json(
        { status: 'error', message: 'Platform not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: platform,
    });
  } catch (error: any) {
    console.error('플랫폼 조회 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/platforms/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const platformId = parseInt(params.id);

    const updateData: any = {};
    if (data.display_name !== undefined) updateData.displayName = data.display_name;
    if (data.config !== undefined) updateData.config = data.config;
    if (data.is_enabled !== undefined) updateData.isEnabled = data.is_enabled;

    const platform = await prisma.platformConfig.update({
      where: { id: platformId },
      data: updateData,
    });

    return NextResponse.json({
      status: 'success',
      data: platform,
      message: '플랫폼이 업데이트되었습니다.',
    });
  } catch (error: any) {
    console.error('플랫폼 업데이트 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/platforms/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.platformConfig.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({
      status: 'success',
      message: '플랫폼이 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('플랫폼 삭제 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
