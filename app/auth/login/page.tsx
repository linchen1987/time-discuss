'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                username: formData.username,
                password: formData.password,
                redirect: false
            })

            if (result?.error) {
                setError('用户名或密码错误')
            } else {
                // 登录成功，重定向到首页
                router.push('/')
                router.refresh()
            }
        } catch {
            setError('登录失败，请重试')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        登录到朋友之家
                    </CardTitle>
                    <CardDescription className="text-center">
                        还没有账号？{' '}
                        <Link href="/auth/register" className="text-primary hover:underline">
                            立即注册
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col space-y-3">
                            <Label htmlFor="username">ID</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="请输入 ID"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col space-y-3">
                            <Label htmlFor="password">密码</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="请输入密码"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                    <div>
                                        <h4 className="text-sm font-medium text-destructive">
                                            登录失败
                                        </h4>
                                        <p className="text-sm text-destructive/80 mt-1">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? '登录中...' : '登录'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 