const CACHE_NAME = 'friends-home-v1';
const STATIC_CACHE_URLS = ['/', '/manifest.json', '/icons/icon-192x192.svg', '/icons/icon-512x512.svg'];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// 获取事件 - 网络优先，回退到缓存
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 跳过非 HTTP(S) 请求
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // 网络优先策略
    fetch(event.request)
      .then((response) => {
        // 检查响应是否有效
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 克隆响应用于缓存
        const responseToCache = response.clone();

        // 缓存响应（仅缓存静态资源和页面）
        if (
          event.request.url.includes('/icons/') ||
          event.request.url.includes('.png') ||
          event.request.url.includes('.jpg') ||
          event.request.url.includes('.jpeg') ||
          event.request.url.includes('.css') ||
          event.request.url.includes('.js')
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // 网络失败时从缓存中获取
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // 如果缓存中也没有，返回离线页面（如果有的话）
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// 处理推送通知（预留，后续可扩展）
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '您有新消息',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'friends-home-notification',
      renotify: true,
      requireInteraction: false,
      data: {
        url: data.url || '/',
      },
    };

    event.waitUntil(self.registration.showNotification(data.title || '朋友之家', options));
  }
});

// 处理通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 如果已有窗口打开，则聚焦到该窗口
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
