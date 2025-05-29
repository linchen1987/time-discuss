'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toast'
import { ThemeProvider } from '@/components/theme-provider'

interface ProvidersProps {
    children: ReactNode
    session?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function Providers({ children, session }: ProvidersProps) {
    return (
        <ThemeProvider>
            <SessionProvider session={session}>
                {children}
                <Toaster />
            </SessionProvider>
        </ThemeProvider>
    )
} 