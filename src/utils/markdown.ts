// from TanStack Start documentation
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import remarkToc from 'remark-toc'
import rehypeToc from '@jsdevtools/rehype-toc'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import remarkMdx from 'remark-mdx'

export type MarkdownHeading = {
  id: string
  text: string
  level: number
}

export type MarkdownResult = {
  markup: string
  headings: Array<MarkdownHeading>
}

export async function renderMarkdown(content: string): Promise<MarkdownResult> {
  const headings: Array<MarkdownHeading> = []

  const result = await unified()
    .use(remarkParse) // Parse markdown
    .use(remarkGfm) // Support GitHub Flavored Markdown
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML AST
    .use(rehypeRaw) // Process raw HTML in markdown
    .use(rehypeSlug) // Add IDs to headings
    .use(remarkMdx)
    .use(rehypeKatex)
    .use(remarkToc, { heading: 'contents', maxDepth: 3 })
    .use(rehypeToc, {
      cssClasses: {
        toc: 'toc-content',
        list: 'toc-list',
      },
    })
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { className: ['anchor'] },
    })
    .use(() => (tree) => {
      visit(tree, 'element', (node: any) => {
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
          headings.push({
            id: node.properties?.id || '',
            text: toString(node),
            level: parseInt(node.tagName.charAt(1), 10),
          })
        }
      })
    })
    .use(rehypeStringify) // Serialize to HTML string
    .process(content)

  return {
    markup: String(result),
    headings,
  }
}
;``
