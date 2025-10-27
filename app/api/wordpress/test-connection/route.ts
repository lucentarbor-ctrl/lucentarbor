/**
 * WordPress 연결 테스트 API
 */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { url, username, api_key } = await req.json();

    if (!url || !username || !api_key) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'URL, username, and API key are required' },
        { status: 400 }
      );
    }

    // WordPress REST API 엔드포인트
    const apiUrl = `${url}/wp-json/wp/v2/users/me`;

    // Basic Auth (username:password)
    const auth = Buffer.from(`${username}:${api_key}`).toString('base64');

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      timeout: 10000,
    });

    return NextResponse.json({
      status: 'success',
      message: 'WordPress 연결에 성공했습니다.',
      data: {
        user_id: response.data.id,
        username: response.data.name,
        email: response.data.email,
      },
    });
  } catch (error: any) {
    console.error('WordPress 연결 에러:', error);

    let message = 'WordPress 연결에 실패했습니다.';
    if (error.response) {
      message = `HTTP ${error.response.status}: ${error.response.statusText}`;
    } else if (error.code === 'ECONNREFUSED') {
      message = '서버에 연결할 수 없습니다.';
    } else if (error.code === 'ETIMEDOUT') {
      message = '연결 시간이 초과되었습니다.';
    }

    return NextResponse.json(
      { error: 'Connection failed', message },
      { status: 500 }
    );
  }
}
