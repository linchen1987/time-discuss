import { useState, useEffect, useMemo } from 'react';
import type { Emoji, EmojiCategory } from '@/lib/emoji/data';

interface EmojiData {
  emojis: EmojiCategory[];
  timestamp: number;
}

interface SearchResults {
  emojis: Emoji[];
  hasResults: boolean;
}

// 缓存管理
const CACHE_KEY = 'emoji-data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

function getCachedEmojiData(): EmojiData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedEmojiData(data: EmojiData) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // 忽略存储错误
  }
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

// 主Hook
export function useEmojiData() {
  const [data, setData] = useState<EmojiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmojiData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查缓存
      const cached = getCachedEmojiData();
      if (cached && isCacheValid(cached.timestamp)) {
        setData(cached);
        setLoading(false);
        return;
      }

      // 从API获取数据
      const response = await fetch('/api/emojis');
      if (!response.ok) throw new Error('Failed to fetch');

      const newData = await response.json();

      // 缓存数据
      setCachedEmojiData(newData);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmojiData();
  }, []);

  return { data, loading, error, reload: loadEmojiData };
}

// 搜索Hook
export function useEmojiSearch(data: EmojiData | null, query: string): SearchResults {
  return useMemo(() => {
    if (!data || !query.trim()) {
      return {
        emojis: [],
        hasResults: false,
      };
    }

    const normalizedQuery = query.toLowerCase().trim();

    // 搜索 Emoji
    const matchedEmojis: Emoji[] = [];
    data.emojis.forEach((category) => {
      category.emojis.forEach((emoji) => {
        const matchesName = emoji.name.toLowerCase().includes(normalizedQuery);
        const matchesKeywords = emoji.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));

        if (matchesName || matchesKeywords) {
          matchedEmojis.push(emoji);
        }
      });
    });

    return {
      emojis: matchedEmojis,
      hasResults: matchedEmojis.length > 0,
    };
  }, [data, query]);
}

// 最近使用管理
export class RecentEmojiManager {
  private static readonly STORAGE_KEY = 'recent-emojis';
  private static readonly MAX_RECENT = 24;

  static getRecentEmojis(): Emoji[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static addRecentEmoji(emoji: Emoji) {
    if (typeof window === 'undefined') return;

    const recent = this.getRecentEmojis();
    const filtered = recent.filter((e) => e.id !== emoji.id);
    const updated = [emoji, ...filtered].slice(0, this.MAX_RECENT);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // 忽略存储错误
    }
  }

  static clearRecentEmojis() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // 忽略存储错误
    }
  }
}

// 最近使用Hook
export function useRecentEmojis() {
  const [recentEmojis, setRecentEmojis] = useState<Emoji[]>([]);

  useEffect(() => {
    setRecentEmojis(RecentEmojiManager.getRecentEmojis());
  }, []);

  const addRecentEmoji = (emoji: Emoji) => {
    RecentEmojiManager.addRecentEmoji(emoji);
    setRecentEmojis(RecentEmojiManager.getRecentEmojis());
  };

  const clearRecentEmojis = () => {
    RecentEmojiManager.clearRecentEmojis();
    setRecentEmojis([]);
  };

  return {
    recentEmojis,
    addRecentEmoji,
    clearRecentEmojis,
  };
}
