/**
 * 미디어 파일 업로드 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file info
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;

    // Save to public/uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    // Create database record
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: originalName,
        url: `/uploads/${filename}`,
        fileType: file.type,
        fileSize: file.size,
        isAiGenerated: formData.get('is_ai_generated') === 'true',
        aiPrompt: formData.get('ai_prompt') as string || null,
        aiModel: formData.get('ai_model') as string || null,
        altText: formData.get('alt_text') as string || null,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: { file: mediaFile },
      message: '파일이 업로드되었습니다.',
    });
  } catch (error: any) {
    console.error('파일 업로드 에러:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
