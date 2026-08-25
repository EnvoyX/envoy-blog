import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { urlFor } from '@repo/sanity-config/client';
import Prism from 'prismjs';
import { useEffect } from 'react';

// Include basic Prism languages (import more as needed)
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

const CodeBlock = ({
  value,
}: {
  value: { code: string; language?: string; filename?: string };
}) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [value]);

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
      {value.filename && (
        <div className="bg-neutral-900 px-4 py-1.5 text-xs text-neutral-400 font-mono border-b border-neutral-800">
          {value.filename}
        </div>
      )}
      <pre className="!bg-transparent !p-4 !m-0 overflow-x-auto text-sm font-mono">
        <code className={`language-${value.language || 'typescript'}`}>{value.code}</code>
      </pre>
    </div>
  );
};

const components: PortableTextComponents = {
  types: {
    // Renders inline images inside article body
    image: ({ value }) => {
      if (!value?.asset?._ref) return null;
      return (
        <figure className="my-8">
          <img
            src={urlFor(value).width(900).auto('format').fit('max').url()}
            alt={value.alt || 'Article illustration'}
            className="w-full rounded-lg shadow-md object-cover"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="text-center text-sm text-neutral-500 mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    // Renders the code plugin blocks
    code: CodeBlock,
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-10 mb-4 text-neutral-900 dark:text-neutral-100">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-8 mb-3 text-neutral-900 dark:text-neutral-100">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-6 italic text-neutral-600 dark:text-neutral-400">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="mb-4 leading-relaxed text-neutral-800 dark:text-neutral-300">{children}</p>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target ? 'noopener noreferrer' : undefined}
          className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
        >
          {children}
        </a>
      );
    },
  },
};

export function SanityPortableText({ value }: { value: any }) {
  return <PortableText value={value} components={components} />;
}
