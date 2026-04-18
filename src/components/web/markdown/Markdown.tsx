import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkToc from 'remark-toc'
import rehypeToc from '@jsdevtools/rehype-toc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkMdx from 'remark-mdx'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { MarkdownImage } from './ImageBlock'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <Markdown
      remarkPlugins={[
        remarkMath,
        remarkGfm,
        remarkMdx,
        [remarkToc, { heading: 'contents', maxDepth: 3 }],
      ]}
      rehypePlugins={[
        rehypeKatex,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [
          rehypeToc,
          {
            cssClasses: {
              toc: 'toc-content',
              list: 'toc-list',
            },
          },
        ],
      ]}
      components={{
        // handle img (intercepts)
        img: ({ src, alt }) => <MarkdownImage src={src} alt={alt} />,

        // this function intercepts the "code" tag in markdown
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          const [copied, setCopied] = useState(false)

          const onCopy = () => {
            navigator.clipboard.writeText(children)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }
          return !inline && match ? (
            <div className="group relative my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                <span className="text-xs font-mono text-zinc-500 uppercase">
                  {match[1]}
                </span>
                <button
                  onClick={onCopy}
                  className="p-1.5 rounded-md hover:bg-zinc-800 transition-all text-zinc-400 hover:text-emerald-400"
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
              <SyntaxHighlighter
                {...props}
                style={oneDark} // code's theme
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  // borderRadius: '0.5rem',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code
              className={`bg-zinc-800 px-1.5 py-0.5 rounded text-blue-300 ${className}`}
              {...props}
            >
              {children}
            </code>
          )
        },
      }}
    >
      {markdown}
    </Markdown>
  )
}
