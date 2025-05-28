'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toast'

interface ProvidersProps {
    children: ReactNode
    session?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function Providers({ children, session }: ProvidersProps) {
    return (
        <SessionProvider session={session}>
            {children}
            <Toaster />
        </SessionProvider>
    )
} 