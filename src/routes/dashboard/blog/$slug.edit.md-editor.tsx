import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import Editor from "@uiw/react-md-editor";
import { ChevronLeft, Copy, CopyCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dashboardBlogPostSlugOptions } from "@/data/query-options/dashboardQueryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/blog/$slug/edit/md-editor")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(
      dashboardBlogPostSlugOptions(params.slug),
    );
    if (context?.user?.id !== post?.authorId) {
      throw redirect({
        to: "/dashboard/blog",
      });
    }
    return {
      post,
      session: {
        user: context?.user,
      },
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Markdown Editor | ${loaderData?.post?.slug} | Envoy Mindpalace`,
      },
      {
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      {
        property: "og:title",
        content: `${loaderData?.post?.title} | Envoy Blog`,
      },
      {
        property: "og:description",
        content: `${loaderData?.post?.description}`,
      },
      {
        property: "og:image",
        content: `${loaderData?.post?.image}`,
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(dashboardBlogPostSlugOptions(slug));
  const [markdown, setMarkdown] = useState(post?.content ?? "");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleReset = () => {
    setMarkdown("# Markdown editor");
  };

  return (
    <div className="p-6 md:p-10 min-h-screen text-slate-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-center max-sm:gap-4 max-sm:flex-col sm:justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold max-sm:text-center">MD Editor</h1>
            <p className="text-slate-400 max-sm:text-center">
              Advanced rich-text live editing experience.
            </p>
          </div>
          <div className="flex gap-3 max-sm:flex-col">
            <Button variant="default" className="gap-2" asChild>
              <Link to="/dashboard/blog/$slug/edit" params={{ slug: post?.slug ?? "" }}>
                <ChevronLeft className="size-4" /> Edit Blog
              </Link>
            </Button>
            <Button onClick={handleCopy} className="cursor-pointer">
              {copied ? (
                <span className="flex gap-1">
                  <CopyCheck className="size-4" />
                  Copied!
                </span>
              ) : (
                <span className="flex gap-1">
                  <Copy className="size-4" />
                  Copy Markdown
                </span>
              )}
            </Button>
            <Button variant={"outline"} className="cursor-pointer" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 p-1">
          <Editor
            value={markdown}
            onChange={(value) => {
              setMarkdown(value as string);
            }}
            height={600}
          />
        </Card>
      </div>
    </div>
  );
}
