import { NextResponse } from 'next/server';
import { getAllEmojiData, searchEmojiData } from '@/lib/emoji/data';

// 获取全量表情包数据
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');

    // 如果有搜索参数，返回搜索结果
    if (searchQuery) {
      const searchResults = searchEmojiData(searchQuery);
      return NextResponse.json({
        emojis: [],
        stickers: [],
        searchResults,
        timestamp: Date.now(),
      });
    }

    // 返回全量数据
    const data = getAllEmojiData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch emoji-sticker data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
