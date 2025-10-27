/**
 * 대시보드 통계 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    return NextResponse.json({
      status: 'success',
      data: {
        total_posts: totalPosts,
        published_posts: publishedPosts,
        draft_posts: draftPosts,
        total_views: totalViews._sum.views || 0,
        avg_views_per_post: avgViews,
        active_blogs: totalBlogs,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch stats', message: error.message }, { status: 500 });
  }
}
