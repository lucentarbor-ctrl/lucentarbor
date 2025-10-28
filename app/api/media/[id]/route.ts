/**
 * 미디어 파일 삭제 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mediaId = parseInt(params.id);

    // Get media file info
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: mediaId },
    });

    if (!mediaFile) {
      return NextResponse.json(
        { status: 'error', message: 'Media file not found' },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filepath = join(process.cwd(), 'public', mediaFile.url);
      await unlink(filepath);
    } catch (error) {
      console.error('파일 삭제 실패 (계속 진행):', error);
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({
      status: 'success',
      message: '파일이 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('미디어 삭제 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
