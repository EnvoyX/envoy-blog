import { createFileRoute, notFound } from '@tanstack/react-router'
import { allPosts } from '../../../../.content-collections/generated'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronLeft, ListIcon } from 'lucide-react'
import { intlFormat } from 'date-fns'
import { MarkdownRenderer } from '@/components/web/Markdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_general/blog/$slug')({
  loader: ({ params }) => {
    const post = allPosts.find((p) => p.slug === params.slug)
    if (!post) {
      throw notFound()
    }
    return post
  },
  component: BlogPost,
})

function extractHeadings(markdown: string) {
  // use a regex to find everything between ``` and ``` and replace it with an empty string before looking for headings.
  const cleanMarkdown = markdown
    .replace(/```[\s\S]*?```/g, '') // remove code blocks within ```
    .replace(/`.*?`/g, '') // remove inline code (i.e. comments)

  const lines = cleanMarkdown.split('\n')
  const headings: { text: string; id: string; level: number }[] = []

  lines.forEach((line) => {
    // adjust the # match: i.e. {2,3} or {1,6} to match 1 to 6 '#' symbols
    const match = line.match(/^(#{1,6})\s+(.*)/)
    if (match) {
      const level = match[1].length // length of '#'
      const text = match[2]
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')

      headings.push({ text, id, level })
    }
  })
  return headings
}

function BlogPost() {
  const post = Route.useLoaderData()
  const [visibleIds, setVisibleIds] = useState<string[]>([])
  const headings = post?.content ? extractHeadings(post.content) : []
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          let next = [...prev]

          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // add heading id if it's not already there (within viewport)
              if (!next.includes(entry.target.id)) {
                next.push(entry.target.id)
              }
            } else {
              // remove id of the heading when it leaves the viewport
              next = next.filter((id) => id !== entry.target.id)
            }
          })
          return next
        })
      },
      // rootMargin: -top -right -bottom -left
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }, // adjusts when the link triggers
    )

    document
      .querySelectorAll('h1, h2, h3, h4, h5, h6')
      .forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-slate-50 antialiased flex flex-col">
        <nav className="sticky top-0 z-40 border-b border-slate-800 bg-black backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
            <Button
              variant="ghost"
              asChild
              className=" text-emerald-500! hover:text-emerald-400! hover:bg-primary/10! hover:border-primary! hover:border-r-2!"
            >
              <Link to="/blog">
                <ChevronLeft className="mr-2 size-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <span className="text-2xl font-bold text-slate-400">404</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Post Not Found
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              The blog post you're looking for doesn't exist or may have been
              moved.
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/dashboard/blog">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 antialiased">
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-black backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            asChild
            className=" text-emerald-500! hover:text-emerald-400! hover:bg-primary/10! hover:border-primary! hover:border-r-2!"
          >
            <Link to="/dashboard/blog">
              <ChevronLeft className="mr-2 size-4" />
              Back to Blog
            </Link>
          </Button>
          <DropdownMenu
            open={dropdownOpen}
            onOpenChange={(open) => {
              setDropdownOpen(open)
            }}
          >
            <DropdownMenuTrigger asChild>
              <div className="text-sm font-medium text-slate-500 truncate md:max-w-none flex gap-1 items-center group">
                <ChevronDown
                  className={cn(
                    'size-4 group-hover:text-emerald-500 shrink-0',
                    {
                      'rotate-180 transition-all text-emerald-500':
                        dropdownOpen,
                    },
                  )}
                />
                <span
                  className={cn('group-hover:text-emerald-500', {
                    'text-emerald-500': dropdownOpen,
                  })}
                >
                  {post.title}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-sm:w-48 w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>On This Page </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {headings.map((heading) => {
                  const isActive = visibleIds.includes(heading.id)
                  return (
                    <DropdownMenuItem>
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-xs transition-all hover:text-white
                          ${isActive ? 'text-emerald-500 border-emerald-500 font-medium border-l-2' : 'text-slate-400 '}
                          ${heading.level === 1 && 'pl-2'}
                          ${heading.level === 2 && 'pl-4'}
                          ${heading.level === 3 && 'pl-6'}
                          ${heading.level === 4 && 'pl-8'}
                          ${heading.level === 5 && 'pl-10'}
                          ${heading.level === 6 && 'pl-12'}

                           hover:bg-slate-500/5`}
                      >
                        {heading.text}
                      </a>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          <div className="flex-1 min-w-0">
            <header className="mb-8">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 mb-8">
                <img
                  src={
                    post.headerImage ??
                    'https://tanstack.com/assets/og-C0HGjoLl.png'
                  }
                  alt={post.title ?? 'Blog Thumbnail'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">
                      {post.authors.join(', ')}
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      Author(s)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-400">
                  <p className="flex items-center">
                    {intlFormat(new Date(post.published), {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
                {post.title}
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed italic border-l-4 border-primary pl-4">
                {post.description}
              </p>
            </header>

            <div
              className="prose prose-invert prose-slate max-w-none
              prose-headings:scroll-mt-20
              prose-headings:font-bold
              prose-pre:bg-slate-900
              prose-pre:border prose-pre:border-slate-800 mb-25"
            >
              <MarkdownRenderer
                markdown={post.content || '*Nothing to preview...*'}
              />
            </div>
          </div>

          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4 h-[calc(100vh-(--spacing(24)))] overflow-y-auto scrollbar-hide pr-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                <ListIcon className="size-4" />
                On this page
              </div>

              <nav className="space-y-1 border-l border-slate-800">
                {headings.map((heading) => {
                  const isActive = visibleIds.includes(heading.id)
                  return (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`block py-1.5 pr-4 text-sm transition-all border-l-3 -ml-0.5 hover:text-white
                      ${isActive ? ' bg-emerald-500/10 text-emerald-500 border-emerald-500 font-medium' : 'text-slate-400'}
                      ${heading.level === 1 && 'pl-2'}
                      ${heading.level === 2 && 'pl-4'}
                      ${heading.level === 3 && 'pl-6'}
                      ${heading.level === 4 && 'pl-8'}
                      ${heading.level === 5 && 'pl-10'}
                      ${heading.level === 6 && 'pl-12'}

                       hover:bg-slate-500/5`}
                    >
                      {heading.text}
                    </a>
                  )
                })}
              </nav>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-8 text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                Back to top ↑
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
