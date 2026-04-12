// src/routes/blog.index.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { allPosts } from '../../../../.content-collections/generated'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Calendar, Search } from 'lucide-react'
import { intlFormat } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedCallback } from '@tanstack/react-pacer'
import { useState } from 'react'

export const Route = createFileRoute('/_general/blog/')({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: `Blog | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Blog | Envoy Mindpalace' },
      {
        property: 'og:description',
        content: 'Create your own blog and write your thoughts!',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
})

function BlogIndex() {
  const [posts, setPosts] = useState(allPosts)

  function performSearch(searchTerm: string) {
    const searchedPosts = allPosts.filter((post) => {
      const matchedQuery =
        searchTerm === '' ||
        post.title?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchedQuery
    })

    setPosts(searchedPosts)
  }

  const debouncedSearch = useDebouncedCallback(
    (searchTerm: string) => performSearch(searchTerm),
    {
      wait: 500, // Wait 500ms after last keystroke
    },
  )

  // Posts are sorted by published date
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
  )

  return (
    <div className="min-h-screen bg-black text-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto max-sm:flex-col max-sm:flex max-sm:items-center">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white max-sm:text-center">
              Blog
            </h1>
            <p className="text-slate-400 mt-2 max-sm:text-center">
              The latest news and blog posts.
            </p>
          </div>
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 z-10 left-3 flex items-center pointer-events-none">
              <Search className="size-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <Input
              type="search"
              placeholder="Search blogs..."
              className="pl-10 bg-emerald-900/40 border-emerald-800 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 backdrop-blur-sm transition-all"
              onChange={(e) => {
                debouncedSearch(e.target.value)
              }}
            />
          </div>
        </div>

        {/* Empty State */}
        {sortedPosts.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">
              No posts found. Start your journey today!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sortedPosts.map((post) => (
            <Card
              key={post.slug}
              className="group relative bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col hover:scale-105 max-w-xs py-0"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={
                    post.headerImage ??
                    'https://tanstack.com/assets/og-C0HGjoLl.png'
                  }
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
              </div>

              <CardContent className="p-6 flex-1">
                <div className="flex flex-col justify-center items-start sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 uppercase tracking-widest font-semibold">
                    <Calendar className="size-3" />
                    {intlFormat(new Date(post.published), {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <h2 className="text-xl font-bold leading-tight group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  asChild
                  variant="link"
                  className="p-0 h-auto text-emerald-400 hover:text-emerald-300 gap-2"
                >
                  <Link to="/blog/$slug" params={{ slug: post.slug }}>
                    Read Full Blog →
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
