import { sanityClient, urlFor } from '@repo/sanity-config/client';
import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import groq from 'groq';

interface PostSummary {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  readingTime?: number;
  mainImage?: {
    asset: { _ref: string };
    alt?: string;
  };
  author?: {
    name: string;
    avatar?: { asset: { _ref: string } };
  };
  categories?: Array<{
    title: string;
  }>;
}

const fetchAllPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const query = groq`*[
      _type == "post" &&
      defined(slug.current) &&
      (visibility == "public" || !defined(visibility))
    ] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      readingTime,
      mainImage,
      visibility,
      author->{
        name,
        avatar
      },
      categories[]->{
        title
      }
    }`;

  return await sanityClient.fetch<PostSummary[]>(query);
});

export const Route = createFileRoute('/_general/envologs/')({
  loader: async () => {
    const posts = await fetchAllPosts();
    return { posts };
  },
  head: () => ({
    meta: [
      { title: 'Envologs | Envoy Mindpalace' },
      {
        name: 'description',
        content: 'Thoughts, perspectives, and opinions.',
      },
    ],
  }),
  component: PostsListPage,
});

function PostsListPage() {
  const { posts } = Route.useLoaderData();

  return (
    <main className="max-w-6xl mx-auto min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
          Envoylogs
        </h1>
        <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
          Thoughts, perspectives, and opinions.
        </p>
      </header>

      {posts.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center">
          <p className="text-neutral-500">No logs published yet. Check back soon!</p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post._id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 transition duration-300 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700"
          >
            <Link
              to="/envologs/$slug"
              params={{ slug: post.slug.current }}
              className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800"
            >
              {post.mainImage?.asset ? (
                <img
                  src={urlFor(post.mainImage)
                    .width(600)
                    .height(338)
                    .fit('crop')
                    .auto('format')
                    .url()}
                  alt={post.mainImage.alt || post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-400">
                  <span>No image</span>
                </div>
              )}
            </Link>

            <div className="flex flex-1 flex-col p-6">
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories.map((category) => (
                    <span
                      key={category.title}
                      className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      {category.title}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 group-hover:text-primary transition-colors">
                <Link to="/envologs/$slug" params={{ slug: post.slug.current }}>
                  {post.title}
                </Link>
              </h2>

              {post.excerpt && (
                <p className="mt-2.5 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-auto pt-6 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center gap-2.5">
                  {post.author?.avatar?.asset && (
                    <img
                      src={urlFor(post.author.avatar).width(48).height(48).fit('crop').url()}
                      alt={post.author.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  )}
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    {post.author?.name || 'Anonymous'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  {post.readingTime && (
                    <>
                      <span>•</span>
                      <span>{post.readingTime} min read</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
