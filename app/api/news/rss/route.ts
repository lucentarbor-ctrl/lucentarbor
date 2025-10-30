import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['description', 'summary'],
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
    ],
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'RSS feed URLs are required' },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      urls.map(async (url: string) => {
        try {
          const feed = await parser.parseURL(url);
          return {
            url,
            title: feed.title || 'Unknown Feed',
            items: feed.items.slice(0, 10).map((item) => ({
              id: item.guid || item.link || String(Math.random()),
              title: item.title || 'No title',
              url: item.link || '#',
              source: feed.title || 'Unknown',
              publishedDate: item.pubDate || item.isoDate || new Date().toISOString(),
              summary: item.contentSnippet || item.summary || item.contentEncoded || 'No summary available',
              content: item['content:encoded'] || item.content || item.contentSnippet || '',
            })),
          };
        } catch (error) {
          console.error(`Error parsing feed ${url}:`, error);
          return { url, error: 'Failed to parse feed' };
        }
      })
    );

    const successfulFeeds = results
      .filter((result) => result.status === 'fulfilled')
      .map((result: any) => result.value)
      .filter((feed) => !feed.error);

    const allItems = successfulFeeds.flatMap((feed) => feed.items);

    return NextResponse.json({
      success: true,
      feeds: successfulFeeds,
      items: allItems,
      total: allItems.length,
    });
  } catch (error: any) {
    console.error('RSS parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse RSS feeds', details: error.message },
      { status: 500 }
    );
  }
}
