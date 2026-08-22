import { defineCollection, defineConfig } from '@content-collections/core'
import matter from 'gray-matter'
import z from 'zod'

function extractFrontMatter(content: string) {
  const { data, content: body, excerpt } = matter(content, { excerpt: true })
  return { data, body, excerpt: excerpt || '' }
}

const posts = defineCollection({
  name: 'posts',
  directory: './src/blog', // Directory containing your .md files
  include: '*.md',
  schema: z.object({
    title: z.string(),
    published: z.iso.date(),
    description: z.string(),
    authors: z.string().array(),
    content: z.string(),
  }),
  transform: ({ content, ...post }) => {
    const frontMatter = extractFrontMatter(content)

    // Extract header image (first image in the document)
    const headerImageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/)
    const headerImage = headerImageMatch ? headerImageMatch[2] : undefined

    return {
      ...post,
      slug: post._meta.path,
      excerpt: frontMatter.excerpt,
      headerImage,
      content: frontMatter.body,
    }
  },
})

export default defineConfig({
  content: [posts],
})
