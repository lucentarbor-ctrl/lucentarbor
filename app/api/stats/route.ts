/**
 * 대시보드 통계 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, handleDatabaseError, serverError } from '@/lib/api-response';

export async function GET() {
  try {
    const [totalPosts, publishedPosts, draftPosts, totalViews, totalBlogs] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'published' } }),
      prisma.post.count({ where: { status: 'draft' } }),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.blog.count({ where: { isActive: true } }),
    ]);

    const avgViews = totalPosts > 0 ? Math.round((totalViews._sum.views || 0) / totalPosts) : 0;

    return successResponse({
      total_posts: totalPosts,
      published_posts: publishedPosts,
      draft_posts: draftPosts,
      total_views: totalViews._sum.views || 0,
      avg_views_per_post: avgViews,
      active_blogs: totalBlogs,
    }, {
      message: 'Statistics fetched successfully',
    });
  } catch (error: any) {
    // Prisma 에러인 경우
    if (error.code) {
      return handleDatabaseError(error);
    }

    // 일반 서버 에러
    return serverError(error, 'Failed to fetch statistics');
  }
}
