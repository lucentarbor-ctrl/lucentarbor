/**
 * 개별 블로그 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/blogs/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
      include: { categories: true, scheduledPosts: { take: 10, orderBy: { scheduledTime: 'desc' } } },
    });
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json({ status: 'success', data: blog });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch blog', message: error.message }, { status: 500 });
  }
}

// PUT /api/blogs/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        platform: data.platform,
        url: data.url,
        description: data.description,
        apiUrl: data.api_url,
        apiKey: data.api_key,
        username: data.username,
        isActive: data.is_active,
      },
    });
    return NextResponse.json({ status: 'success', data: blog, message: '블로그가 업데이트되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update blog', message: error.message }, { status: 500 });
  }
}

// DELETE /api/blogs/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.blog.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ status: 'success', message: '블로그가 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete blog', message: error.message }, { status: 500 });
  }
}
