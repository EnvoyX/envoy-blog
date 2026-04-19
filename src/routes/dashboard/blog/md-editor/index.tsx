import { createFileRoute, Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Copy, CopyCheck } from 'lucide-react'
import { useState } from 'react'
import Editor from '@uiw/react-md-editor'

export const Route = createFileRoute('/dashboard/blog/md-editor/')({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: `Markdown Editor  | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: `Markdown Editor | Envoy Blog` },
      {
        property: 'og:description',
        content: `Markdown Editor to edit blog post`,
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
})

function RouteComponent() {
  const [markdown, setMarkdown] = useState('# Markdown editor')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleReset = () => {
    setMarkdown('# Markdown editor')
  }

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen text-slate-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">MD Editor</h1>
            <p className="text-slate-400">
              Advanced rich-text live editing experience.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="default" className="gap-2" asChild>
              <Link to="/dashboard/blog/create-blog">
                <ChevronLeft className="size-4" /> Create Blog
              </Link>
            </Button>
            <Button onClick={handleCopy} className="cursor-pointer">
              {copied ? (
                <span className="flex gap-1">
                  <CopyCheck className="size-4" />
                  Copied!
                </span>
              ) : (
                <span className="flex gap-1">
                  <Copy className="size-4" />
                  Copy Markdown
                </span>
              )}
            </Button>
            <Button
              variant={'outline'}
              className="cursor-pointer"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 p-1">
          <Editor
            value={markdown}
            onChange={(value) => {
              setMarkdown(value as string)
            }}
            height={600}
          />
        </Card>
      </div>
    </div>
  )
}
