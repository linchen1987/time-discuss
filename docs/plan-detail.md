# 朋友之家详细实现计划

## 阶段 4: 具体功能模块实现计划

### 帖子详情页面实现步骤

1. **创建帖子获取 API 端点**
   - 位置: `app/api/posts/[id]/route.ts`
   - 功能:
     - 接受 GET 请求获取单个帖子详情
     - 包含作者信息、评论和点赞信息
     - 校验请求者认证状态

2. **创建帖子详情页面组件**
   - 位置: `app/(app)/post/[id]/page.tsx`
   - 功能:
     - Server Component 获取帖子数据
     - 展示帖子内容、图片、作者信息
     - 集成点赞和评论功能

3. **创建评论区组件**
   - 位置: `components/posts/CommentSection.tsx`
   - 功能:
     - 渲染现有评论列表
     - 提供评论表单
     - 支持评论分页加载

### 图片上传功能实现步骤

1. **配置对象存储服务**
   - 如果使用 Vercel Blob:
     ```typescript
     // lib/blob.ts
     import { put } from '@vercel/blob';
     import { nanoid } from 'nanoid';

     export async function uploadImage(file: File) {
       const fileId = nanoid();
       const filename = `${fileId}-${file.name}`;
       const { url } = await put(filename, file, { access: 'public' });
       return url;
     }
     ```

2. **创建图片上传 API**
   - 位置: `app/api/uploads/route.ts`
   - 功能:
     ```typescript
     import { NextRequest, NextResponse } from 'next/server';
     import { getServerSession } from 'next-auth/next';
     import { uploadImage } from '@/lib/blob';
     import { authOptions } from '@/lib/auth';

     export async function POST(req: NextRequest) {
       const session = await getServerSession(authOptions);
       if (!session?.user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }

       try {
         const formData = await req.formData();
         const file = formData.get('file') as File;
         
         if (!file) {
           return NextResponse.json(
             { error: 'No file provided' },
             { status: 400 }
           );
         }
         
         // 验证文件类型和大小
         if (!file.type.startsWith('image/')) {
           return NextResponse.json(
             { error: 'File must be an image' },
             { status: 400 }
           );
         }
         
         if (file.size > 4 * 1024 * 1024) { // 4MB 限制
           return NextResponse.json(
             { error: 'File too large (max 4MB)' },
             { status: 400 }
           );
         }
         
         const url = await uploadImage(file);
         return NextResponse.json({ url });
       } catch (error) {
         console.error('Upload error:', error);
         return NextResponse.json(
           { error: 'Upload failed' },
           { status: 500 }
         );
       }
     }
     ```

3. **创建图片上传组件**
   - 位置: `components/editor/ImageUploader.tsx`
   - 功能:
     - 提供文件选择界面
     - 展示上传进度
     - 处理上传错误
     - 将上传后的图片 URL 插入到 Lexical 编辑器

### LexicalJS 编辑器集成详细步骤

1. **基础编辑器组件实现**
   ```typescript
   // components/editor/LexicalEditor.tsx
   import { LexicalComposer } from '@lexical/react/LexicalComposer';
   import { RichTextPlugin } from '@lexical/react/RichTextPlugin';
   import { ContentEditable } from '@lexical/react/ContentEditable';
   import { HistoryPlugin } from '@lexical/react/HistoryPlugin';
   import { AutoFocusPlugin } from '@lexical/react/AutoFocusPlugin';
   import { LinkPlugin } from '@lexical/react/LinkPlugin';
   import { ListPlugin } from '@lexical/react/ListPlugin';
   import { MarkdownShortcutPlugin } from '@lexical/react/MarkdownShortcutPlugin';
   import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
   
   // 自定义组件
   import ToolbarPlugin from './plugins/ToolbarPlugin';
   import ImagePlugin from './plugins/ImagePlugin';
   import { EditorTheme } from './EditorTheme';
   
   type EditorProps = {
     onChange?: (editorState: string) => void;
     initialState?: string;
     readOnly?: boolean;
   };
   
   export default function LexicalEditor({ 
     onChange, 
     initialState, 
     readOnly = false 
   }: EditorProps) {
     // 编辑器初始配置
     const initialConfig = {
       namespace: 'TimeDiscussEditor',
       theme: EditorTheme,
       onError: (error: Error) => {
         console.error('Lexical Editor Error:', error);
       },
       editorState: initialState,
       editable: !readOnly,
     };
   
     return (
       <LexicalComposer initialConfig={initialConfig}>
         <div className="editor-container rounded-md border border-gray-300 bg-white">
           {!readOnly && <ToolbarPlugin />}
           <div className="editor-inner">
             <RichTextPlugin
               contentEditable={<ContentEditable className="editor-input min-h-[150px] px-4 py-2 focus:outline-none" />}
               placeholder={<div className="editor-placeholder text-gray-400">写点什么吧...</div>}
               ErrorBoundary={LexicalErrorBoundary}
             />
             <HistoryPlugin />
             <AutoFocusPlugin />
             <LinkPlugin />
             <ListPlugin />
             <MarkdownShortcutPlugin />
             <ImagePlugin />
           </div>
         </div>
       </LexicalComposer>
     );
   }
   ```

2. **工具栏插件实现**
   ```typescript
   // components/editor/plugins/ToolbarPlugin.tsx
   import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
   import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from 'lexical';
   import { 
     FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaImage
   } from 'react-icons/fa';
   
   export default function ToolbarPlugin() {
     const [editor] = useLexicalComposerContext();
     
     const insertLink = () => {
       // 弹出输入链接 URL 的对话框
       const url = prompt('输入链接地址:');
       if (url) {
         editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'link');
       }
     };
     
     const onImageUpload = () => {
       // 触发图片上传 (与 ImageUploader 组件集成)
     };
     
     return (
       <div className="toolbar flex items-center gap-1 border-b border-gray-300 p-2">
         <button
           onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
           className="p-2 hover:bg-gray-100 rounded"
           aria-label="格式化粗体"
         >
           <FaBold />
         </button>
         <button
           onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
           className="p-2 hover:bg-gray-100 rounded"
           aria-label="格式化斜体"
         >
           <FaItalic />
         </button>
         <button
           onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
           className="p-2 hover:bg-gray-100 rounded"
           aria-label="格式化下划线"
         >
           <FaUnderline />
         </button>
         <div className="w-px h-6 bg-gray-300 mx-1" />
         <button
           onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'ul')}
           className="p-2 hover:bg-gray-100 rounded"
           aria-label="无序列表"
         >
           <FaListUl />
         </button>
         <button
           onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'ol')}
           className="p-2 hover:bg-gray-100 rounded"
           aria-label="有序列表"
         >
           <FaListOl />
         </button>
         <div className="w-px h-6 bg-gray-300 mx-1" />
         <button
           onClick={insertLink}
           className="p-2 hover:bg-gray-100 rounded"
           aria-label="插入链接"
         >
           <FaLink />
         </button>
         <button
           onClick={onImageUpload}
           className="p-2 hover:bg-gray-100 rounded"
           aria-label="插入图片"
         >
           <FaImage />
         </button>
       </div>
     );
   }
   ```

3. **创建图片插件**
   - 位置: `components/editor/plugins/ImagePlugin.tsx`
   - 功能: 支持在编辑器中插入和显示图片

### 通知系统实现步骤

1. **定义通知触发函数**
   ```typescript
   // lib/notifications.ts
   import { prisma } from './prisma';
   
   type NotificationType = 'NEW_COMMENT' | 'NEW_LIKE' | 'MENTION';
   
   export async function createNotification({
     recipientId,
     actorId,
     type,
     postId,
   }: {
     recipientId: string;
     actorId: string;
     type: NotificationType;
     postId: string;
   }) {
     // 如果是自己的操作，不创建通知
     if (recipientId === actorId) {
       return null;
     }
   
     const notification = await prisma.notification.create({
       data: {
         recipientId,
         actorId,
         type,
         postId,
       },
     });
   
     // 如果设置了 Web Push，这里可以触发推送通知
     await triggerPushNotification(recipientId, {
       title: getNotificationTitle(type),
       body: getNotificationBody(type, actorId),
       url: `/post/${postId}`,
     });
   
     return notification;
   }
   
   // 辅助函数获取通知文本
   function getNotificationTitle(type: NotificationType): string {
     switch (type) {
       case 'NEW_COMMENT':
         return '有新评论';
       case 'NEW_LIKE':
         return '获得新点赞';
       case 'MENTION':
         return '有人提到了你';
       default:
         return '新通知';
     }
   }
   
   function getNotificationBody(type: NotificationType, actorId: string): string {
     // 实际应用中，这里应该从数据库获取 actor 的昵称
     return `有用户对你的内容进行了互动`;
   }
   
   // Web Push 触发函数 (简化版)
   async function triggerPushNotification(
     userId: string,
     payload: { title: string; body: string; url: string }
   ) {
     const subscriptions = await prisma.pushSubscription.findMany({
       where: { userId },
     });
   
     // 如果没有订阅，跳过
     if (subscriptions.length === 0) {
       return;
     }
   
     // 实际实现应该使用 web-push 库发送推送
     console.log('Would send push to:', userId, payload);
   }
   ```

2. **在互动操作中添加通知触发**
   - 点赞触发:
     ```typescript
     // 在点赞 action 中
     await createNotification({
       recipientId: post.authorId,
       actorId: session.user.id,
       type: 'NEW_LIKE',
       postId: post.id,
     });
     ```

   - 评论触发:
     ```typescript
     // 在评论 action 中
     await createNotification({
       recipientId: post.authorId,
       actorId: session.user.id,
       type: 'NEW_COMMENT',
       postId: post.id,
     });
     ```

### 实现 PWA 功能详细步骤

1. **创建 Manifest 文件**
   - 位置: `public/manifest.json`
   - 内容:
     ```json
     {
       "name": "朋友之家",
       "short_name": "朋友之家",
       "description": "私密社交空间",
       "start_url": "/",
       "display": "standalone",
       "background_color": "#ffffff",
       "theme_color": "#4f46e5",
       "icons": [
         {
           "src": "/icons/icon-192x192.png",
           "sizes": "192x192",
           "type": "image/png"
         },
         {
           "src": "/icons/icon-512x512.png",
           "sizes": "512x512",
           "type": "image/png"
         },
         {
           "src": "/icons/maskable-icon.png",
           "sizes": "192x192",
           "type": "image/png",
           "purpose": "maskable"
         }
       ]
     }
     ```

2. **配置 Service Worker**
   - 位置: `public/sw.js`
   - 内容:
     ```javascript
     // 缓存版本标识符
     const CACHE_NAME = 'time-discuss-v1';
     
     // 预缓存资源列表
     const PRECACHE_RESOURCES = [
       '/',
       '/manifest.json',
       '/icons/icon-192x192.png',
       '/icons/icon-512x512.png',
       // 重要的 JS 和 CSS 文件会由构建工具添加
     ];
     
     // 安装 Service Worker 时，预缓存资源
     self.addEventListener('install', (event) => {
       event.waitUntil(
         caches.open(CACHE_NAME)
           .then((cache) => cache.addAll(PRECACHE_RESOURCES))
           .then(() => self.skipWaiting())
       );
     });
     
     // 激活 Service Worker 时，清理旧缓存
     self.addEventListener('activate', (event) => {
       const currentCaches = [CACHE_NAME];
       event.waitUntil(
         caches.keys().then((cacheNames) => {
           return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
         }).then((cachesToDelete) => {
           return Promise.all(cachesToDelete.map((cacheToDelete) => {
             return caches.delete(cacheToDelete);
           }));
         }).then(() => self.clients.claim())
       );
     });
     
     // 拦截网络请求
     self.addEventListener('fetch', (event) => {
       // 忽略非 GET 请求
       if (event.request.method !== 'GET') return;
       
       // API 请求使用 network-first 策略
       if (event.request.url.includes('/api/')) {
         networkFirst(event);
         return;
       }
       
       // 静态资源使用 cache-first 策略
       if (
         event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/)
       ) {
         cacheFirst(event);
         return;
       }
       
       // 其他请求使用 network-first 策略
       networkFirst(event);
     });
     
     // Cache-first 策略
     function cacheFirst(event) {
       event.respondWith(
         caches.match(event.request)
           .then((cachedResponse) => {
             if (cachedResponse) {
               return cachedResponse;
             }
             return fetch(event.request).then((response) => {
               return caches.open(CACHE_NAME).then((cache) => {
                 cache.put(event.request, response.clone());
                 return response;
               });
             });
           })
       );
     }
     
     // Network-first 策略
     function networkFirst(event) {
       event.respondWith(
         fetch(event.request)
           .then((response) => {
             return caches.open(CACHE_NAME).then((cache) => {
               cache.put(event.request, response.clone());
               return response;
             });
           })
           .catch(() => {
             return caches.match(event.request);
           })
       );
     }
     
     // 处理推送通知
     self.addEventListener('push', (event) => {
       if (!event.data) return;
       
       try {
         const data = event.data.json();
         const options = {
           body: data.body,
           icon: '/icons/icon-192x192.png',
           badge: '/icons/badge-72x72.png',
           data: { url: data.url },
         };
         
         event.waitUntil(
           self.registration.showNotification(data.title, options)
         );
       } catch (error) {
         console.error('Push notification error:', error);
       }
     });
     
     // 处理点击通知事件
     self.addEventListener('notificationclick', (event) => {
       event.notification.close();
       
       const urlToOpen = event.notification.data && event.notification.data.url 
         ? event.notification.data.url 
         : '/';
       
       event.waitUntil(
         clients.matchAll({ type: 'window' })
           .then((windowClients) => {
             // 如果已经有打开的窗口，聚焦该窗口
             for (const client of windowClients) {
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
     ```

3. **注册 Service Worker**
   - 位置: `app/layout.tsx` 或单独的 Client Component
   - 内容:
     ```typescript
     'use client';
     
     import { useEffect } from 'react';
     
     export function ServiceWorkerRegistration() {
       useEffect(() => {
         if ('serviceWorker' in navigator) {
           window.addEventListener('load', () => {
             navigator.serviceWorker.register('/sw.js')
               .then(registration => {
                 console.log('SW registered:', registration);
               })
               .catch(error => {
                 console.error('SW registration failed:', error);
               });
           });
         }
       }, []);
       
       return null;
     }
     ```

4. **配置 Next.js 处理 PWA 相关文件**
   - 位置: `next.config.mjs`
   - 内容:
     ```javascript
     /** @type {import('next').NextConfig} */
     const nextConfig = {
       headers: async () => {
         return [
           {
             source: '/sw.js',
             headers: [
               {
                 key: 'Cache-Control',
                 value: 'public, max-age=0, must-revalidate',
               },
               {
                 key: 'Service-Worker-Allowed',
                 value: '/',
               },
             ],
           },
         ];
       },
     };
     
     export default nextConfig;
     ```

## 后续阶段实现计划

针对其余功能模块的实现细节将在上述基础功能完成后进一步细化。 