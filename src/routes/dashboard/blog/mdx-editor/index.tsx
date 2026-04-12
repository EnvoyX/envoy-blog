import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

// Lazy-load the editor to keep it client-only and avoid SSR issues
// (MDXEditor relies on browser APIs)
const EditorPanel = lazy(() =>
  import('../../../../components/web/dashboard/MDXEditor').then((m) => ({
    default: m.EditorPanel,
  })),
)

export const Route = createFileRoute('/dashboard/blog/mdx-editor/')({
  component: EditorMDXPage,
})

function EditorMDXPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorPanel />
    </Suspense>
  )
}

function EditorSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0d0d0d',
        color: '#555',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        letterSpacing: '0.05em',
      }}
    >
      Loading editor…
    </div>
  )
}
