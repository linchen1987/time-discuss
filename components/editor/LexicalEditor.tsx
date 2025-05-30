"use client"

import { useState, useEffect } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { AutoLinkPlugin, createLinkMatcherWithRegExp } from '@lexical/react/LexicalAutoLinkPlugin'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import {
    FORMAT_TEXT_COMMAND,
    $getSelection,
    $isRangeSelection,
    EditorState,
    KEY_ENTER_COMMAND,
    COMMAND_PRIORITY_HIGH,
    $createTextNode,
    $insertNodes
} from 'lexical'
import type { Emoji } from '@/lib/emoji/data'
import { debugEditor, logError } from '@/lib/debug'

// 编辑器主题
const editorTheme = {
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
    },
    link: 'text-primary underline hover:text-primary/80 cursor-pointer',
}

// URL 正则表达式 - 匹配多种 URL 格式
const HTTP_URL_REGEX = /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/gi
const WWW_URL_REGEX = /www\.(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/gi

// 创建链接匹配器
const HTTP_URL_MATCHER = createLinkMatcherWithRegExp(HTTP_URL_REGEX, (text) => {
    return text
})

const WWW_URL_MATCHER = createLinkMatcherWithRegExp(WWW_URL_REGEX, (text) => {
    return `https://${text}`
})

// 表情插入插件
function EmojiInsertPlugin() {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        const handleInsertEmoji = (event: CustomEvent) => {
            const emoji = event.detail.emoji as Emoji
            if (!emoji) return

            editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                    const textNode = $createTextNode(emoji.unicode)
                    $insertNodes([textNode])
                }
            })
        }

        // 监听全局表情插入事件
        window.addEventListener('insertEmoji', handleInsertEmoji as EventListener)

        return () => {
            window.removeEventListener('insertEmoji', handleInsertEmoji as EventListener)
        }
    }, [editor])

    return null
}

// 剪贴板插件 - 支持粘贴图片
function ClipboardPlugin({ onImagePaste }: { onImagePaste?: (files: File[]) => void }) {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const clipboardData = event.clipboardData
            if (!clipboardData || !onImagePaste) return

            const files = Array.from(clipboardData.files)
            const imageFiles = files.filter(file => file.type.startsWith('image/'))

            if (imageFiles.length > 0) {
                event.preventDefault()
                onImagePaste(imageFiles)
            }
        }

        const editorElement = editor.getRootElement()
        if (editorElement) {
            editorElement.addEventListener('paste', handlePaste)
            return () => {
                editorElement.removeEventListener('paste', handlePaste)
            }
        }
    }, [editor, onImagePaste])

    return null
}

// 快捷键插件
function KeyboardPlugin({ onSubmit }: { onSubmit?: () => void }) {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        return editor.registerCommand(
            KEY_ENTER_COMMAND,
            (event: KeyboardEvent) => {
                const { ctrlKey, metaKey } = event
                // Cmd+Enter (Mac) 或 Ctrl+Enter (Windows/Linux)
                if ((ctrlKey || metaKey) && onSubmit) {
                    event.preventDefault()
                    event.stopPropagation()
                    onSubmit()
                    return true
                }
                return false
            },
            COMMAND_PRIORITY_HIGH
        )
    }, [editor, onSubmit])

    return null
}

// 加粗格式控制插件 - 用于外部控制
function BoldFormatPlugin() {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        const handleBoldFormat = () => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }

        // 监听全局加粗格式事件
        window.addEventListener('formatBold', handleBoldFormat as EventListener)

        return () => {
            window.removeEventListener('formatBold', handleBoldFormat as EventListener)
        }
    }, [editor])

    return null
}

// 获取当前格式状态的插件
function FormatStatePlugin({ onFormatChange }: { onFormatChange?: (formats: { isBold: boolean }) => void }) {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection) && onFormatChange) {
                    onFormatChange({
                        isBold: selection.hasFormat('bold')
                    })
                }
            })
        })
    }, [editor, onFormatChange])

    return null
}

// 工具栏组件
function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext()
    const [isBold, setIsBold] = useState(false)

    // 监听选择变化来更新按钮状态
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                    setIsBold(selection.hasFormat('bold'))
                }
            })
        })
    }, [editor])

    const formatBold = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
    }

    return (
        <div className="border-b border-border p-2 flex gap-2">
            <button
                type="button"
                onClick={formatBold}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${isBold
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
            >
                <strong>B</strong>
            </button>
        </div>
    )
}

// 支持输入法的 AutoLink 插件
function IMEFriendlyAutoLinkPlugin() {
    const [editor] = useLexicalComposerContext()
    const [isComposing, setIsComposing] = useState(false)

    useEffect(() => {
        const editorElement = editor.getRootElement()
        if (!editorElement) return

        const handleCompositionStart = () => {
            setIsComposing(true)
        }

        const handleCompositionEnd = () => {
            setIsComposing(false)
        }

        editorElement.addEventListener('compositionstart', handleCompositionStart)
        editorElement.addEventListener('compositionend', handleCompositionEnd)

        return () => {
            editorElement.removeEventListener('compositionstart', handleCompositionStart)
            editorElement.removeEventListener('compositionend', handleCompositionEnd)
        }
    }, [editor])

    // 如果正在进行复合输入，不渲染 AutoLinkPlugin
    if (isComposing) {
        return null
    }

    return (
        <AutoLinkPlugin
            matchers={[HTTP_URL_MATCHER, WWW_URL_MATCHER]}
        />
    )
}

interface LexicalEditorProps {
    placeholder?: string
    initialValue?: string
    onChange?: (editorState: Record<string, unknown>, html: string) => void
    onSubmit?: () => void
    onImagePaste?: (files: File[]) => void
    onFormatChange?: (formats: { isBold: boolean }) => void
    showToolbar?: boolean
    className?: string
}

export default function LexicalEditor({
    placeholder = "写点什么...",
    initialValue,
    onChange,
    onSubmit,
    onImagePaste,
    onFormatChange,
    showToolbar = true,
    className = ""
}: LexicalEditorProps) {
    const initialConfig = {
        namespace: 'TimeDiscussEditor',
        theme: editorTheme,
        onError: (error: Error) => {
            debugEditor('Lexical Editor Error: %O', error)
            // 只在严重错误时显示在 console
            if (error.name === 'Invariant' || error.message.includes('Critical')) {
                logError('LexicalEditor', error, 'Critical error')
            }
        },
        nodes: [AutoLinkNode, LinkNode],
        editorState: initialValue || null,
    }

    const handleChange = (editorState: EditorState) => {
        try {
            const json = editorState.toJSON()
            // 简化的 HTML 生成 - 暂时使用文本内容
            const text = JSON.stringify(json)

            debugEditor('Editor state changed: %O', { hasContent: text.length > 50 })

            if (onChange) {
                onChange(json as unknown as Record<string, unknown>, text)
            }
        } catch (error) {
            debugEditor('Error handling editor change: %O', error)
            logError('LexicalEditor', error, 'Failed to handle editor change')
        }
    }

    return (
        <div className={`border border-border rounded-md bg-background ${className}`}>
            <LexicalComposer initialConfig={initialConfig}>
                {showToolbar && <ToolbarPlugin />}
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="min-h-[120px] p-1 pl-2 text-base leading-relaxed focus:outline-none resize-none text-foreground"
                                spellCheck={false}
                            />
                        }
                        placeholder={
                            <div className="absolute top-1 left-2 pl-1 text-muted-foreground pointer-events-none select-none">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={({ children }: { children: React.ReactNode }) => children}
                    />
                    <OnChangePlugin onChange={handleChange} />
                    <HistoryPlugin />
                    <KeyboardPlugin onSubmit={onSubmit} />
                    <ClipboardPlugin onImagePaste={onImagePaste} />
                    <EmojiInsertPlugin />
                    <BoldFormatPlugin />
                    <FormatStatePlugin onFormatChange={onFormatChange} />
                    <IMEFriendlyAutoLinkPlugin />
                </div>
            </LexicalComposer>
        </div>
    )
} 