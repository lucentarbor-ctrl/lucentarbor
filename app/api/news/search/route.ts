import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, category = 'all', limit = 20 } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    // Google News RSS URL
    const searchQuery = encodeURIComponent(keyword);
    const googleNewsUrl = `https://news.google.com/rss/search?q=${searchQuery}&hl=ko&gl=KR&ceid=KR:ko`;

    // Category-specific search
    let categoryQuery = keyword;
    if (category && category !== 'all') {
      const categoryMap: Record<string, string> = {
        tech: '기술',
        business: '경제',
        science: '과학',
        health: '건강',
      };
      categoryQuery = `${keyword} ${categoryMap[category] || ''}`;
    }

    const feed = await parser.parseURL(
      `https://news.google.com/rss/search?q=${encodeURIComponent(categoryQuery)}&hl=ko&gl=KR&ceid=KR:ko`
    );

    const items = feed.items.slice(0, limit).map((item) => ({
      id: item.guid || item.link || String(Math.random()),
      title: item.title || 'No title',
      url: item.link || '#',
      source: extractSource(item.title || ''),
      publishedDate: item.pubDate || item.isoDate || new Date().toISOString(),
      summary: cleanSummary(item.contentSnippet || item.content || 'No summary available'),
      category: category,
    }));

    return NextResponse.json({
      success: true,
      keyword,
      category,
      items,
      total: items.length,
    });
  } catch (error: any) {
    console.error('News search error:', error);
    return NextResponse.json(
      { error: 'Failed to search news', details: error.message },
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
