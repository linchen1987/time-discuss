'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { updateUserProfile } from '@/app/actions/user';
import { toast } from 'sonner';
import { logError } from '@/lib/debug';

interface User {
    id: string;
    username: string | null;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
    createdAt: Date;
}

interface ProfileFormProps {
    user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [name, setName] = useState(user.name || '');
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { update } = useSession();

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 验证文件类型和大小
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            toast.error('只支持 JPEG、PNG、WebP 和 GIF 格式的图片');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过5MB');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/uploads/avatar', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = '上传失败';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    if (response.status === 413) {
                        errorMessage = '图片文件过大，请压缩后重试';
                    }
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            setAvatarUrl(data.url);
            toast.success('头像上传成功');
        } catch (error) {
            logError('ProfileForm', error, 'Avatar upload failed');
            toast.error(error instanceof Error ? error.message : '头像上传失败');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('avatarUrl', avatarUrl);

            const result = await updateUserProfile(formData);

            if (result.success) {
                toast.success('个人资料更新成功');
                await update();
                router.refresh();
            } else {
                toast.error(result.error || '更新失败，请重试');
            }
        } catch (error) {
            logError('ProfileForm', error, 'Profile update failed');
            toast.error(error instanceof Error ? error.message : '更新失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 头像上传 */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
                        <AvatarImage src={avatarUrl || undefined} alt={name || '用户头像'} />
                        <AvatarFallback className="text-lg">
                            {name ? name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                            <Camera className="w-6 h-6 text-white" />
                        )}
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <p className="text-sm text-muted-foreground text-center">
                    点击头像更换图片<br />
                    支持 JPEG、PNG、WebP、GIF 格式，最大 5MB
                </p>
            </div>

            {/* 基本信息 */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="username">用户名</Label>
                    <Input
                        id="username"
                        value={user.username || ''}
                        disabled
                        className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground mt-1">用户名不可修改</p>
                </div>

                <div>
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                        id="email"
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground mt-1">邮箱不可修改</p>
                </div>

                <div>
                    <Label htmlFor="name">昵称</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        placeholder="请输入昵称"
                        maxLength={50}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                        {name.length}/50 字符
                    </p>
                </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    取消
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            保存中...
                        </>
                    ) : (
                        '保存更改'
                    )}
                </Button>
            </div>
        </form>
    );
} 