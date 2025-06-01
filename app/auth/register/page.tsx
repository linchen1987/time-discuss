'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setFieldErrors({})

        // 验证密码确认
        if (formData.password !== formData.confirmPassword) {
            setError('密码确认不匹配')
            setFieldErrors({ confirmPassword: '密码确认不匹配' })
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email || undefined,
                    password: formData.password,
                    name: formData.name || undefined,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || '注册失败')

                // 如果有字段错误信息，设置字段错误
                if (data.fieldErrors) {
                    setFieldErrors(data.fieldErrors)
                } else if (data.field && data.error) {
                    setFieldErrors({ [data.field]: data.error })
                }
            } else {
                setSuccess(true)
                // 3秒后跳转到登录页面
                setTimeout(() => {
                    router.push('/auth/login')
                }, 3000)
            }
        } catch {
            setError('网络错误，请重试')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))

        // 清除该字段的错误
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({
                ...prev,
                [e.target.name]: ''
            }))
        }
    }

    const getFieldError = (fieldName: string) => {
        return fieldErrors[fieldName] || ''
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    注册成功！
                                </h2>
                                <p className="text-muted-foreground mt-2">
                                    即将跳转到登录页面...
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        注册朋友之家
                    </CardTitle>
                    <CardDescription className="text-center">
                        已有账号？{' '}
                        <Link href="/auth/login" className="text-primary hover:underline">
                            立即登录
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col space-y-3">
                            <Label htmlFor="username">
                                ID <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="用于登录，可输入手机、邮箱、或任意 ID"
                                value={formData.username}
                                onChange={handleChange}
                                className={getFieldError('username') ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                            />
                            {getFieldError('username') && (
                                <p className="text-sm text-destructive">{getFieldError('username')}</p>
                            )}
                        </div>

                        <div className="flex flex-col flex flex-col space-y-3">
                            <Label htmlFor="name">昵称</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="请输入昵称（可修改）"
                                value={formData.name}
                                onChange={handleChange}
                                className={getFieldError('name') ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                            />
                            {getFieldError('name') && (
                                <p className="text-sm text-destructive">{getFieldError('name')}</p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-3" style={{ display: 'none' }}>
                            <Label htmlFor="email">邮箱</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="请输入邮箱（可选）"
                                value={formData.email}
                                onChange={handleChange}
                                className={getFieldError('email') ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                            />
                            {getFieldError('email') && (
                                <p className="text-sm text-destructive">{getFieldError('email')}</p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-3">
                            <Label htmlFor="password">
                                密码 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="请输入密码"
                                value={formData.password}
                                onChange={handleChange}
                                className={getFieldError('password') ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                            />
                            {getFieldError('password') && (
                                <p className="text-sm text-destructive">{getFieldError('password')}</p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-3">
                            <Label htmlFor="confirmPassword">
                                确认密码 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="请再次输入密码"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={getFieldError('confirmPassword') ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                            />
                            {getFieldError('confirmPassword') && (
                                <p className="text-sm text-destructive">{getFieldError('confirmPassword')}</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-destructive">
                                            注册失败
                                        </h4>
                                        <p className="text-sm text-destructive/80 mt-1">
                                            {error}
                                        </p>
                                        {Object.keys(fieldErrors).length > 1 && (
                                            <ul className="mt-2 text-sm text-destructive/80 list-disc list-inside space-y-1">
                                                {Object.entries(fieldErrors).map(([field, message]) => (
                                                    <li key={field}>{message}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? '注册中...' : '注册'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 