'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
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
                .register('/api/sw')
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

    // 如果已安装，显示已安装状态
    if (isInstalled) {
        return (
            <Button variant="outline" size="sm" disabled className="text-green-600 dark:text-green-400">
                <Check className="w-4 h-4 mr-2" />
                已安装
            </Button>
        );
    }

    // 如果可以安装，显示安装按钮
    if (showInstallButton) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={handleInstallClick}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
                <Download className="w-4 h-4 mr-2" />
                安装
            </Button>
        );
    }

    // 不显示按钮（不支持安装或不在支持的浏览器中）
    return (
        <Button variant="outline" size="sm" disabled className="text-muted-foreground">
            <Download className="w-4 h-4 mr-2" />
            不可用
        </Button>
    );
} 