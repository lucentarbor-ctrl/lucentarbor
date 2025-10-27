/**
 * 카테고리 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const blogId = req.nextUrl.searchParams.get('blog_id');
    const where = blogId ? { blogId: parseInt(blogId) } : {};
    const categories = await prisma.category.findMany({ where, orderBy: { order: 'asc' } });
    return NextResponse.json({ status: 'success', data: categories });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch categories', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const category = await prisma.category.create({
      data: {
        blogId: data.blog_id,
        name: data.name,
        parentId: data.parent_id,
        description: data.description,
        order: data.order || 0,
      },
    });
    return NextResponse.json({ status: 'success', data: category });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create category', message: error.message }, { status: 500 });
  }
}
