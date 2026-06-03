import type { ReactNode } from 'react'

export function FullScreenLoader({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {children && (
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-rx-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-ui text-rx-text-secondary text-sm">{children}</p>
        </div>
      )}
      {!children && (
        <div className="w-10 h-10 border-2 border-rx-blue border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  )
}