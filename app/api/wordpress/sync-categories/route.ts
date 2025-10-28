/**
 * WordPress 카테고리 동기화 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { blog_id } = await req.json();

    if (!blog_id) {
      return NextResponse.json(
        { success: false, message: 'blog_id is required' },
        { status: 400 }
      );
    }

    // Get blog info
    const blog = await prisma.blog.findUnique({
      where: { id: blog_id },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Fetch categories from WordPress
    const wpUrl = blog.apiUrl || blog.url;
    const categoriesUrl = `${wpUrl}/wp-json/wp/v2/categories?per_page=100`;

    const auth = {
      username: blog.username || '',
      password: blog.apiKey || '',
    };

    const response = await axios.get(categoriesUrl, { auth });
    const wpCategories = response.data;

    // Sync categories to database
    let synced = 0;
    for (const wpCat of wpCategories) {
      await prisma.category.upsert({
        where: {
          blogId_name: {
            blogId: blog_id,
            name: wpCat.name,
          },
        },
        update: {
          description: wpCat.description || null,
        },
        create: {
          blogId: blog_id,
          name: wpCat.name,
          description: wpCat.description || null,
          parentId: null,
          order: wpCat.id || 0,
        },
      });
      synced++;
    }

    return NextResponse.json({
      success: true,
      message: `${synced}개의 카테고리가 동기화되었습니다.`,
      count: synced,
    });
  } catch (error: any) {
    console.error('카테고리 동기화 에러:', error);
    return NextResponse.json(
      { success: false, message: error.message || '동기화 실패' },
      { status: 500 }
    );
  }
}
