'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // 检查是否已经安装（只在客户端执行）
        const checkInstallStatus = () => {
            if (typeof window === 'undefined') return false;

            return window.matchMedia('(display-mode: standalone)').matches ||
                (navigator as Navigator & { standalone?: boolean }).standalone ||
                document.referrer.includes('android-app://');
        };

        setIsInstalled(checkInstallStatus());

        // 注册 Service Worker（确保在客户端环境）
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker 注册成功:', registration);
                })
                .catch((error) => {
                    console.error('Service Worker 注册失败:', error);
                });
        }

        // 监听安装提示事件（确保在客户端环境）
        if (typeof window === 'undefined') return;

        const handleBeforeInstallPrompt = (e: Event) => {
            // 阻止默认的安装提示
            e.preventDefault();
            // 保存事件，稍后可以触发
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstallButton(true);
        };

        // 监听应用安装事件
        const handleAppInstalled = () => {
            console.log('PWA 已安装');
            setDeferredPrompt(null);
            setShowInstallButton(false);
            setIsInstalled(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // 显示安装提示
        deferredPrompt.prompt();

        // 等待用户选择
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`用户选择: ${outcome}`);

        // 清理
        setDeferredPrompt(null);
        setShowInstallButton(false);
    };

    // 如果已安装或不显示安装按钮，则不渲染
    if (isInstalled || !showInstallButton) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
                aria-label="安装应用"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
                安装应用
            </button>
        </div>
    );
} 