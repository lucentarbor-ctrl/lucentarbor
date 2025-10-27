/**
 * WordPress 포스트 발행 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { post_id, blog_id, status } = await req.json();

    // 포스트 조회
    const post = await prisma.post.findUnique({
      where: { id: post_id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 블로그 정보 조회
    const blog = await prisma.blog.findUnique({
      where: { id: blog_id },
    });

    if (!blog || !blog.apiUrl || !blog.username || !blog.apiKey) {
      return NextResponse.json(
        { error: 'Blog configuration incomplete', message: 'WordPress 설정이 완료되지 않았습니다.' },
        { status: 400 }
      );
    }

    // WordPress API 호출
    const apiUrl = `${blog.apiUrl}/wp-json/wp/v2/posts`;
    const auth = Buffer.from(`${blog.username}:${blog.apiKey}`).toString('base64');

    const wpPost = {
      title: post.title,
      content: post.content,
      status: status || 'draft',
      categories: [],
    };

    const response = await axios.post(apiUrl, wpPost, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // 발행 기록 저장
    await prisma.publishHistory.create({
      data: {
        postId: post_id,
        blogId: blog_id,
        platform: 'wordpress',
        platformPostId: response.data.id.toString(),
        platformUrl: response.data.link,
        status: 'success',
        viewsSnapshot: post.views,
        likesSnapshot: post.likes,
        commentsSnapshot: post.comments,
        sharesSnapshot: post.shares,
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'WordPress에 발행되었습니다.',
      data: {
        wp_post_id: response.data.id,
        wp_url: response.data.link,
      },
    });
  } catch (error: any) {
    console.error('WordPress 발행 에러:', error);

    // 실패 기록 저장
    if (req.body) {
      try {
        const { post_id, blog_id } = await req.json();
        await prisma.publishHistory.create({
          data: {
            postId: post_id,
            blogId: blog_id,
            platform: 'wordpress',
            status: 'failed',
            errorMessage: error.message || '알 수 없는 오류',
          },
        });
      } catch (e) {}
    }

    return NextResponse.json(
      { error: 'Failed to publish to WordPress', message: error.message },
      { status: 500 }
    );
  }
}
