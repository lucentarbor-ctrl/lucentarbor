/**
 * 미디어 목록 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const fileType = searchParams.get('file_type');

    const where = fileType ? { fileType } : {};

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return NextResponse.json({
      status: 'success',
      data: files,
      total,
      skip,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch media', message: error.message }, { status: 500 });
  }
}
