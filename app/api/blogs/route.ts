/**
 * 블로그 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/blogs - 블로그 목록
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { categories: true, scheduledPosts: true } },
      },
    });
    return NextResponse.json({ status: 'success', data: blogs });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch blogs', message: error.message }, { status: 500 });
  }
}

// POST /api/blogs - 블로그 생성
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const blog = await prisma.blog.create({
      data: {
        name: data.name,
        platform: data.platform,
        url: data.url,
        description: data.description,
        apiUrl: data.api_url,
        apiKey: data.api_key,
        username: data.username,
        isActive: data.is_active !== false,
      },
    });
    return NextResponse.json({ status: 'success', data: blog, message: '블로그가 생성되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create blog', message: error.message }, { status: 500 });
  }
}
