import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/config/app';

export async function GET() {
  const manifest = {
    name: APP_CONFIG.name,
    short_name: APP_CONFIG.shortName,
    description: APP_CONFIG.seoDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#667eea',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'zh-CN',
    icons: [
      {
        src: '/icons/icon-72x72.svg',
        sizes: '72x72',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96.svg',
        sizes: '96x96',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128.svg',
        sizes: '128x128',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144.svg',
        sizes: '144x144',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152.svg',
        sizes: '152x152',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.svg',
        sizes: '384x384',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: '新建帖子',
        short_name: '发帖',
        description: '快速创建新帖子',
        url: '/posts/new',
        icons: [
          {
            src: '/icons/shortcut-new-post.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
          },
        ],
      },
    ],
    categories: ['social', 'communication'],
    prefer_related_applications: false,
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
