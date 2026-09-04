import { ListIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type ArticlePost =
  | {
      slug: string;
      excerpt: string;
      headerImage: string | undefined;
      content: string;
      title: string;
      published: string;
      description: string;
      authors: string[];
      _meta: {
        filePath: string;
        fileName: string;
        directory: string;
        path: string;
        extension: string;
      };
    }
  | undefined;

export function extractHeadings(markdown: string) {
  // use a regex to find everything between ``` and ``` and replace it with an empty string before looking for headings.
  const cleanMarkdown = markdown
    .replace(/```[\s\S]*?```/g, '') // remove code blocks within ```
    .replace(/`.*?`/g, ''); // remove inline code (i.e. comments)

  const lines = cleanMarkdown.split('\n');
  const headings: { text: string; id: string; level: number }[] = [];

  lines.forEach((line) => {
    // adjust the # match: i.e. {2,3} or {1,6} to match 1 to 6 '#' symbols
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

      headings.push({ text, id, level });
    }
  });
  return headings;
}

export default function SideNavArticle({ post }: { post: ArticlePost }) {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const headings = post?.content ? extractHeadings(post.content) : [];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prevVisibleIds) => {
          let nextVisibleIds = new Set(prevVisibleIds);
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // add heading id if it's not already there (within viewport)
              if (!nextVisibleIds.has(entry.target.id)) {
                nextVisibleIds.add(entry.target.id);
              }
            } else {
              // remove id of the heading when it leaves the viewport
              nextVisibleIds = new Set([...nextVisibleIds].filter((id) => id !== entry.target.id));
            }
          });
          return nextVisibleIds;
        });
      },
      // rootMargin: -top -right -bottom -left
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }, // adjusts when the link triggers
    );

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 space-y-4 h-[calc(100vh-(--spacing(24)))] overflow-y-auto scrollbar-hide pr-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
          <ListIcon className="size-4" />
          On this page
        </div>

        <nav className="space-y-1 border-l border-slate-800">
          {headings.map((heading) => {
            const isActive = visibleIds.has(heading.id);
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={`block py-1.5 pr-4 text-sm transition-all border-l-3 -ml-0.5 hover:text-white
                ${isActive ? ' bg-primary/10 text-primary border-primary font-medium' : 'text-zinc-400'}
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
            );
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
  );
}
