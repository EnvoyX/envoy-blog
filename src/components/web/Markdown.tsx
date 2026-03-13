// src/components/Markdown.tsx
import  { ReactNode, useEffect, useMemo, useState } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'
import rehypeSlug from 'rehype-slug'
import * as prod from 'react/jsx-runtime'

const production = {
  Fragment: prod.Fragment,
  jsx: prod.jsx,
  jsxs: prod.jsxs,
}

export function Markdown({ content }: { content: string }) {
  const processor = useMemo(() => {
    return unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // Support Tables, Checklists, etc.
      .use(remarkRehype) // Convert to HTML AST
      .use(rehypeSlug) // Add IDs to headings for linking
      .use(rehypeReact, production) // Final step: Convert to React
  }, [])

  const [ReactContent, setReactContent] = useState<ReactNode>(null)

  useEffect(() => {
    processor.process(content).then((file) => {
      setReactContent(file.result)
    })
  }, [content, processor])

  return (
    <article className="prose lg:prose-xl">{ReactContent}</article>
  )
}