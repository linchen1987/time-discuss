"use client"

import React from 'react'

interface LexicalRendererProps {
    lexicalState: Record<string, unknown> | null
    contentHtml?: string | null
    className?: string
}

// 简单的 Lexical 状态渲染器
function renderLexicalNodes(nodes: unknown[]): React.ReactNode {
    if (!nodes || !Array.isArray(nodes)) return null

    return nodes.map((node, index) => {
        if (!node || typeof node !== 'object') return null
        const typedNode = node as Record<string, unknown>

        switch (typedNode.type) {
            case 'paragraph':
                return (
                    <p key={index} className="mb-2 last:mb-0">
                        {typedNode.children ? renderLexicalNodes(typedNode.children as unknown[]) as React.ReactNode : null}
                    </p>
                )

            case 'text':
                let content: React.ReactNode = (typedNode.text as string) || ''

                // 应用格式
                if (typedNode.format && typeof typedNode.format === 'number') {
                    // Lexical 使用位标志来表示格式
                    // 1 = bold, 2 = italic, 4 = underline
                    if (typedNode.format & 1) {
                        content = <strong>{content}</strong>
                    }
                    if (typedNode.format & 2) {
                        content = <em>{content}</em>
                    }
                    if (typedNode.format & 4) {
                        content = <u>{content}</u>
                    }
                }

                return <React.Fragment key={index}>{content}</React.Fragment>

            case 'link':
            case 'autolink':  // 添加对 autolink 类型的支持
                const url = (typedNode.url as string) || '#'
                return (
                    <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                    >
                        {typedNode.children ? renderLexicalNodes(typedNode.children as unknown[]) as React.ReactNode : null}
                    </a>
                )

            case 'linebreak':
                return <br key={index} />

            default:
                // 对于未知类型，尝试渲染子节点
                if (typedNode.children) {
                    return (
                        <span key={index}>
                            {renderLexicalNodes(typedNode.children as unknown[]) as React.ReactNode}
                        </span>
                    )
                }
                return null
        }
    })
}

export default function LexicalRenderer({
    lexicalState,
    contentHtml,
    className = ""
}: LexicalRendererProps) {
    // 如果有 lexicalState，尝试渲染它
    if (lexicalState && typeof lexicalState === 'object' && 'root' in lexicalState) {
        const root = lexicalState.root as Record<string, unknown>
        if (root && root.children && Array.isArray(root.children)) {
            return (
                <div className={`lexical-content ${className}`}>
                    {renderLexicalNodes(root.children)}
                </div>
            )
        }
    }

    // 降级到 contentHtml
    if (contentHtml) {
        return (
            <div
                className={`lexical-content ${className}`}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
        )
    }

    // 什么都没有
    return null
} 