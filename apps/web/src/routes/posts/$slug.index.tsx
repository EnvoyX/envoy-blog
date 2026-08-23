import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { intlFormat, intlFormatDistance } from "date-fns";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/web/markdown/Markdown";
import { payloadPostBySlugOptions, type SerializablePost } from "@/data/query-options/queryOptions";

export const Route = createFileRoute("/posts/$slug/")({
  component: PostComponent,
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(payloadPostBySlugOptions(params.slug));
    if (!post) {
      throw redirect({
        to: "/posts",
      });
    }
    return {
      post,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.title} | Posts | Envoy Mindpalace` },
      {
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      {
        property: "og:title",
        content: `${loaderData?.post?.title} | Envoy Posts`,
      },
      {
        property: "og:description",
        content: loaderData?.post?.meta?.description || "",
      },
      {
        property: "og:image",
        content: loaderData?.post?.heroImage || "https://tanstack.com/assets/og-C0HGjoLl.png",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function PostComponent() {
  const { data: post } = useSuspenseQuery(payloadPostBySlugOptions(Route.useParams().slug)) as {
    data: SerializablePost | null;
  };

  if (!post) {
    return (
      <div className="min-h-screen text-slate-50 antialiased flex flex-col">
        <nav className="sticky top-0 z-40 border-b border-slate-800 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
            <Button
              variant="ghost"
              asChild
              className="text-emerald-500! hover:text-emerald-400! hover:bg-primary/10! hover:border-primary! hover:border-r-2!"
            >
              <Link to="/posts">
                <ChevronLeft className="mr-2 size-4" />
                Back to Posts
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
              The post you're looking for doesn't exist or may have been moved.
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/posts">Return to Posts</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const heroImageUrl = getPostImageUrl(post);
  const authors = post.populatedAuthors || [];

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-slate-800 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          <Button
            variant="ghost"
            asChild
            className="text-emerald-500! hover:text-emerald-400! hover:bg-primary/10! hover:border-primary! hover:border-r-2!"
          >
            <Link to="/posts">
              <ChevronLeft className="mr-2 size-4" />
              Back to Posts
            </Link>
          </Button>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col">
          <div className="flex-1 min-w-0">
            <header className="mb-8">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 mb-8">
                <img src={heroImageUrl} alt={post.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                {authors.length > 0 && (
                  <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">
                        {authors.map((author) => author.name).join(", ")}
                      </span>
                      <span className="text-xs text-slate-500 uppercase tracking-wider">
                        Author
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-400">
                  {post.publishedAt && (
                    <p className="flex items-center">
                      {intlFormat(new Date(post.publishedAt), {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span className="text-slate-500 italic">
                    Updated {intlFormatDistance(new Date(post.updatedAt), new Date())}
                  </span>
                </div>
              </div>

              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {post.categories.map((category) => {
                    const cat = typeof category === "object" ? category : null;
                    return cat ? (
                      <span
                        key={cat.id}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/10 text-[10px] font-medium text-emerald-400 uppercase tracking-wider"
                      >
                        {cat.title}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
                {post.title}
              </h1>
              {post.meta?.description && (
                <p className="text-xl text-slate-400 leading-relaxed italic border-l-4 border-primary pl-4">
                  {post.meta.description}
                </p>
              )}
            </header>

            <div className="prose prose-invert prose-slate max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 mb-25">
              <LexicalToMarkdown content={post.content} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getPostImageUrl(post: SerializablePost | undefined): string {
  if (!post) return "https://tanstack.com/assets/og-C0HGjoLl.png";

  return post.heroImage || post.meta?.image || "https://tanstack.com/assets/og-C0HGjoLl.png";
}

function LexicalToMarkdown({ content }: { content: SerializablePost["content"] }) {
  if (!content) {
    return <p>No content available.</p>;
  }

  // Parse JSON string back to object
  let contentObj;
  try {
    contentObj = JSON.parse(content);
  } catch {
    return <p>Error parsing content.</p>;
  }

  if (!contentObj || !contentObj.root) {
    return <p>No content available.</p>;
  }

  const convertToMarkdown = (node: any): string => {
    if (!node) return "";

    if (Array.isArray(node)) {
      return node.map((child) => convertToMarkdown(child)).join("");
    }

    if (typeof node === "string") {
      return node;
    }

    let result = "";

    switch (node.type) {
      case "paragraph":
        result = node.children?.map((child: any) => convertToMarkdown(child)).join("") || "";
        return result + "\n\n";

      case "heading":
        const level = node.tag || "1";
        const headingContent =
          node.children?.map((child: any) => convertToMarkdown(child)).join("") || "";
        return `${"#".repeat(parseInt(level))} ${headingContent}\n\n`;

      case "text":
        let text = node.text || "";
        if (node.bold) text = `**${text}**`;
        if (node.italic) text = `*${text}*`;
        if (node.underline) text = `<u>${text}</u>`;
        if (node.strikethrough) text = `~~${text}~~`;
        return text;

      case "list":
        const listType = node.listType === "bullet" ? "ul" : "ol";
        return (
          node.children
            ?.map((child: any, index: number) => {
              const prefix = listType === "ul" ? "-" : `${index + 1}.`;
              return `${prefix} ${convertToMarkdown(child).trim()}\n`;
            })
            .join("") + "\n"
        );

      case "listitem":
        return node.children?.map((child: any) => convertToMarkdown(child)).join("") || "";

      case "link":
        const linkText =
          node.children?.map((child: any) => convertToMarkdown(child)).join("") || "";
        return `[${linkText}](${node.url})`;

      case "quote":
        const quoteContent =
          node.children?.map((child: any) => convertToMarkdown(child)).join("") || "";
        return `> ${quoteContent}\n\n`;

      case "code":
        return `\`${node.code || ""}\``;

      case "codehighlight":
        return `\`\`\`${node.language || ""}\n${node.code || ""}\n\`\`\`\n\n`;

      default:
        // Handle blocks and other complex nodes
        if (node.children) {
          return node.children.map((child: any) => convertToMarkdown(child)).join("");
        }
        return "";
    }
  };

  const markdown = convertToMarkdown(contentObj.root);
  return <MarkdownRenderer markdown={markdown} />;
}
