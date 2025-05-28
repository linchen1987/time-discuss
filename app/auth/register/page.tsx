'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-green-600">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            注册成功！
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            即将跳转到登录页面...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        注册朋友之家
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        已有账号？{' '}
                        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            立即登录
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                用户名 *
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${getFieldError('username') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="请输入用户名"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            {getFieldError('username') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('username')}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                姓名
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${getFieldError('name') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="请输入姓名（可选）"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {getFieldError('name') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                邮箱
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${getFieldError('email') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="请输入邮箱（可选）"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {getFieldError('email') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                密码 *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${getFieldError('password') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="请输入密码"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {getFieldError('password') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                确认密码 *
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${getFieldError('confirmPassword') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="请再次输入密码"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {getFieldError('confirmPassword') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('confirmPassword')}</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        注册失败
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                        {Object.keys(fieldErrors).length > 1 && (
                                            <ul className="mt-1 list-disc list-inside">
                                                {Object.entries(fieldErrors).map(([field, message]) => (
                                                    <li key={field}>{message}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '注册中...' : '注册'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 