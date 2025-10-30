import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category = 'all', limit = 20 } = body;

    // Google News trending URLs by category
    const trendingUrls: Record<string, string> = {
      all: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko',
      tech: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko',
      business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko',
      science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFptTXpJU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko',
      entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko',
      health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtdHZLQUFQAQ?hl=ko&gl=KR&ceid=KR:ko',
    };

    const url = trendingUrls[category] || trendingUrls.all;
    const feed = await parser.parseURL(url);

    const items = feed.items.slice(0, limit).map((item, index) => ({
      id: item.guid || item.link || String(Math.random()),
      title: item.title || 'No title',
      url: item.link || '#',
      source: extractSource(item.title || ''),
      publishedDate: item.pubDate || item.isoDate || new Date().toISOString(),
      summary: cleanSummary(item.contentSnippet || item.content || 'No summary available'),
      category: category,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      category,
      items,
      total: items.length,
    });
  } catch (error: any) {
    console.error('Trending news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending news', details: error.message },
      { status: 500 }
    );
  }
}

function extractSource(title: string): string {
  // Google News title format: "Title - Source"
  const match = title.match(/-\s*([^-]+)$/);
  return match ? match[1].trim() : 'Google News';
}

function cleanSummary(text: string): string {
  // Remove HTML tags and extra whitespace
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300) + '...';
}
