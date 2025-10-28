/**
 * 설정 개별 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/settings/[key]
export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: params.key },
    });

    if (!setting) {
      return NextResponse.json(
        { status: 'error', message: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: setting,
    });
  } catch (error: any) {
    console.error('설정 조회 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/[key]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    await prisma.setting.delete({
      where: { key: params.key },
    });

    return NextResponse.json({
      status: 'success',
      message: '설정이 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('설정 삭제 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
