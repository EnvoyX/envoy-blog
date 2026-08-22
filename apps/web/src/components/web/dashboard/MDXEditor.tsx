// 'use client'

// import React, { useCallback, useState } from 'react'
// import {
//   MDXEditor,
//   headingsPlugin,
//   quotePlugin,
//   listsPlugin,
//   thematicBreakPlugin,
//   linkPlugin,
//   linkDialogPlugin,
//   imagePlugin,
//   tablePlugin,
//   codeBlockPlugin,
//   codeMirrorPlugin,
//   diffSourcePlugin,
//   markdownShortcutPlugin,
//   toolbarPlugin,
//   UndoRedo,
//   BoldItalicUnderlineToggles,
//   BlockTypeSelect,
//   CreateLink,
//   InsertImage,
//   InsertTable,
//   InsertThematicBreak,
//   ListsToggle,
//   CodeToggle,
//   DiffSourceToggleWrapper,
//   type MDXEditorMethods,
// } from '@mdxeditor/editor'
// import '@mdxeditor/editor/style.css'
// import { Button } from '@/components/ui/button'
// import { Link } from '@tanstack/react-router'
// import { Copy, CopyCheck, NewspaperIcon } from 'lucide-react'
// import './MDXEditor.css'

// const INITIAL_MARKDOWN = `# Welcome

// This is a **live demo** of MDXEditor with all default features on.

// > "The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions."

// — [Daring Fireball](https://daringfireball.net).

// In here, you can find the following markdown elements:

// - Headings
// - Lists
//   - Unordered
//   - Ordered
//   - Check lists
//   - And nested ;)
// - Links
// - Bold/Italic/Underline formatting
// - Tables
// - Code blocks
// - Images
// - Quotes
// - Thematic breaks
// `

// export function EditorPanel() {
//   const editorRef = React.useRef<MDXEditorMethods>(null)
//   const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN)
//   const [copied, setCopied] = useState(false)

//   const handleChange = useCallback((val: string) => {
//     setMarkdown(val)
//   }, [])

//   const handleCopy = async () => {
//     await navigator.clipboard.writeText(markdown)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 1800)
//   }

//   const handleReset = () => {
//     editorRef.current?.setMarkdown(INITIAL_MARKDOWN)
//     setMarkdown(INITIAL_MARKDOWN)
//   }

//   return (
//     <div className="mdx-editor-root">
//       <header className="mer-header">
//         <div className="mer-header__brand">
//           <span className="mer-header__logo">✦</span>
//           <span className="mer-header__title">MDX Editor</span>
//           <span className="mer-header__badge">Envoy Mindpalace</span>
//         </div>
//         <div className="mer-header__actions">
//           <Button variant={'default'} asChild className="p-4! cursor-pointer">
//             <Link to="/dashboard/blog/create-blog">
//               <NewspaperIcon className="size-4" /> Create Blog
//             </Link>
//           </Button>
//           <Button onClick={handleCopy} className="cursor-pointer">
//             {copied ? (
//               <span className="flex gap-1">
//                 <CopyCheck className="size-4" />
//                 Copied!
//               </span>
//             ) : (
//               <span className="flex gap-1">
//                 <Copy className="size-4" />
//                 Copy Markdown
//               </span>
//             )}
//           </Button>
//           <Button
//             variant={'outline'}
//             className="cursor-pointer"
//             onClick={handleReset}
//           >
//             Reset
//           </Button>
//         </div>
//       </header>

//       <div className="mer-editor-wrap">
//         <MDXEditor
//           ref={editorRef}
//           markdown={INITIAL_MARKDOWN}
//           onChange={handleChange}
//           contentEditableClassName="mer-content"
//           plugins={[
//             headingsPlugin(),
//             listsPlugin(),
//             quotePlugin(),
//             thematicBreakPlugin(),
//             linkPlugin(),
//             linkDialogPlugin(),
//             imagePlugin(),
//             tablePlugin(),
//             codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
//             codeMirrorPlugin({
//               codeBlockLanguages: {
//                 tsx: 'TypeScript (React)',
//                 ts: 'TypeScript',
//                 js: 'JavaScript',
//                 jsx: 'JavaScript (React)',
//                 css: 'CSS',
//                 html: 'HTML',
//                 json: 'JSON',
//                 bash: 'Bash',
//                 md: 'Markdown',
//                 '': 'Plain Text',
//               },
//             }),
//             diffSourcePlugin({ viewMode: 'rich-text' }),
//             markdownShortcutPlugin(),
//             toolbarPlugin({
//               toolbarContents: () => (
//                 <>
//                   <DiffSourceToggleWrapper>
//                     <UndoRedo />
//                     <div className="mer-toolbar-divider" />
//                     <BoldItalicUnderlineToggles />
//                     <CodeToggle />
//                     <div className="mer-toolbar-divider" />
//                     <ListsToggle />
//                     <div className="mer-toolbar-divider" />
//                     <BlockTypeSelect />
//                     <div className="mer-toolbar-divider" />
//                     <CreateLink />
//                     <InsertImage />
//                     <InsertTable />
//                     <InsertThematicBreak />
//                   </DiffSourceToggleWrapper>
//                 </>
//               ),
//             }),
//           ]}
//         />
//       </div>

//       <footer className="mer-footer">
//         <span className="mer-footer__stat">
//           {markdown.split(/\s+/).filter(Boolean).length} words
//         </span>
//         <span className="mer-footer__stat">{markdown.length} characters</span>
//         <span className="mer-footer__powered">
//           Powered by @mdxeditor/editor
//         </span>
//       </footer>
//     </div>
//   )
// }
