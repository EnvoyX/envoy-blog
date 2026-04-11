import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkToc from 'remark-toc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeToc from '@jsdevtools/rehype-toc'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
// import 'katex/dist/katex.min.css'

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <Markdown
      remarkPlugins={[
        remarkMath,
        remarkGfm,
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
        // this function intercepts the "code" tag in markdown
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')

          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              style={oneDark} // code's theme
              language={match[1]}
              PreTag="div"
              // makes the code block look cleaner
              customStyle={{
                margin: 0,
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
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
