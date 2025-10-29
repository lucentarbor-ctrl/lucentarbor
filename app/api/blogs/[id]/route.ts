/**
 * 개별 블로그 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, handleDatabaseError, serverError, errorResponse } from '@/lib/api-response';

// GET /api/blogs/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return errorResponse('유효하지 않은 블로그 ID입니다', {
        statusCode: 400,
      });
    }

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        categories: true,
        scheduledPosts: {
          take: 10,
          orderBy: { scheduledTime: 'desc' }
        }
      },
    });

    if (!blog) {
      return errorResponse('블로그를 찾을 수 없습니다', {
        statusCode: 404,
      });
    }

    return successResponse(blog, {
      message: 'Blog fetched successfully',
    });
  } catch (error: any) {
    // Prisma 에러인 경우
    if (error.code) {
      return handleDatabaseError(error);
    }

    // 일반 서버 에러
    return serverError(error, 'Failed to fetch blog');
  }
}

// PUT /api/blogs/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return errorResponse('유효하지 않은 블로그 ID입니다', {
        statusCode: 400,
      });
    }

    const data = await req.json();

    const blog = await prisma.blog.update({
      where: { id: blogId },
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

    return successResponse(blog, {
      message: '블로그가 업데이트되었습니다.',
    });
  } catch (error: any) {
    // Prisma 에러인 경우
    if (error.code) {
      return handleDatabaseError(error);
    }

    // 일반 서버 에러
    return serverError(error, 'Failed to update blog');
  }
}

// DELETE /api/blogs/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return errorResponse('유효하지 않은 블로그 ID입니다', {
        statusCode: 400,
      });
    }

    await prisma.blog.delete({
      where: { id: blogId }
    });

    return successResponse(null, {
      message: '블로그가 삭제되었습니다.',
    });
  } catch (error: any) {
    // Prisma 에러인 경우
    if (error.code) {
      return handleDatabaseError(error);
    }

    // 일반 서버 에러
    return serverError(error, 'Failed to delete blog');
  }
}
