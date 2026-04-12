// src/routes/blog.index.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { allPosts } from '../../../../.content-collections/generated'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { intlFormat } from 'date-fns'
import { Button } from '@/components/ui/button'

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
  // Posts are sorted by published date
  const sortedPosts = allPosts.sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
  )

  return (
    <div className="min-h-screen bg-black text-slate-50 p-6 md:p-10">
      <div className="max-w-7xl">
        <div className="flex justify-center sm:justify-start items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Blog
            </h1>
            <p className="text-slate-400 mt-2">
              The latest news and blog posts.
            </p>
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
              className="group relative bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col hover:scale-105 max-w-xs"
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
