/**
 * 블로그 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, handleDatabaseError, serverError, validationError } from '@/lib/api-response';

// GET /api/blogs - 블로그 목록
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { categories: true, scheduledPosts: true } },
      },
    });

    return successResponse(blogs, {
      message: 'Blogs fetched successfully',
    });
  } catch (error: any) {
    // Prisma 에러인 경우
    if (error.code) {
      return handleDatabaseError(error);
    }

    // 일반 서버 에러
    return serverError(error, 'Failed to fetch blogs');
  }
}

// POST /api/blogs - 블로그 생성
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 필수 필드 검증
    if (!data.name || !data.platform) {
      return validationError('블로그 이름과 플랫폼은 필수 항목입니다', {
        required: ['name', 'platform'],
      });
    }

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

    return successResponse(blog, {
      message: '블로그가 생성되었습니다.',
      status: 201,
    });
  } catch (error: any) {
    // Prisma 에러인 경우
    if (error.code) {
      return handleDatabaseError(error);
    }

    // 일반 서버 에러
    return serverError(error, 'Failed to create blog');
  }
}
