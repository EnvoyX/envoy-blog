import { useDeferredValue, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import {
  Pencil,
  Eye,
  Save,
  Loader2,
  ChevronLeft,
  PencilIcon,
  PencilRulerIcon,
  CopyCheck,
  Copy,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MarkdownRenderer } from '@/components/web/markdown/Markdown'
import { postSchema } from '@/schemas/blog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { createPostFn, updatePostFn } from '@/data/blog'
import { Post } from '@/generated/prisma/client'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function BlogEditor({ initialData }: { initialData?: Post }) {
  const [activeTab, setActiveTab] = useState('edit-blog')
  const [markdown, setMarkdown] = useState(initialData?.content ?? '')
  const [copied, setCopied] = useState(false)

  const deferredMarkdown = useDeferredValue(
    markdown,
    initialData?.content ?? '',
  )

  const handleCopy = async (markdown: string) => {
    await navigator.clipboard.writeText(markdown)
    setMarkdown(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      description: initialData?.description || '',
      image:
        initialData?.image || 'https://tanstack.com/assets/og-C0HGjoLl.png',
      published: initialData?.published || false,
    },
    validators: {
      onSubmit: postSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value)
      if (initialData?.id) {
        await updatePostFn({
          data: {
            postId: initialData.id,
            ...value,
          },
        })
        toast.success('Post updated succesfully!')
      } else {
        console.log(value)
        await createPostFn({ data: value })
        toast.success('Post published succesfully!')
      }
    },
  })

  const EditorFields = (
    <div className="space-y-6">
      <div className="space-y-2">
        <form.Field
          name="title"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <>
                <Label htmlFor={`${field.name}-input`}>Title</Label>
                <Input
                  id={`${field.name}-input`}
                  placeholder="My Awesome Blog Post"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </>
            )
          }}
        />
      </div>

      <div className="space-y-2">
        <form.Field
          name="description"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <>
                <Label htmlFor={`${field.name}-input`}>Description</Label>
                <Textarea
                  id={`${field.name}-input`}
                  placeholder="What's happening today?"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </>
            )
          }}
        />
      </div>

      <div className="space-y-2">
        <form.Field
          name="image"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <>
                <Label htmlFor={`${field.name}-input`}>
                  Image URL (Optional)
                </Label>
                <Input
                  id={`${field.name}-input`}
                  placeholder="https://tanstack.com/assets/og-C0HGjoLl.png"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </>
            )
          }}
        />
      </div>

      <div className="space-y-2">
        <form.Field
          name="published"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field orientation="horizontal" data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor="form-tanstack-switch-visibility">
                    Visibility (
                    {field.state.value === true ? 'Public' : 'Private'})
                  </FieldLabel>
                  <FieldDescription>
                    Enable whether this post published to public or keep in
                    private.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldContent>
                <Switch
                  id="form-tanstack-switch-visibility"
                  name={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                  aria-invalid={isInvalid}
                />
              </Field>
            )
          }}
        />
      </div>

      <div className="space-y-2">
        <form.Field
          name="content"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <>
                <Label htmlFor={`${field.name}-input`}>
                  Content (Markdown)
                </Label>
                <div className="flex items-center gap-2">
                  <Button size={'sm'} variant={'default'} asChild>
                    <Link
                      to={
                        initialData
                          ? '/blog/$slug/edit/md-editor'
                          : '/blog/md-editor'
                      }
                      params={{
                        slug: initialData?.slug,
                      }}
                    >
                      <PencilIcon className="size-4" />
                      Edit in MD Editor
                    </Link>
                  </Button>
                  <Button
                    size={'sm'}
                    variant={'default'}
                    onClick={() => handleCopy(field.state.value)}
                    className="cursor-pointer"
                  >
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
                </div>

                <div className="h-125 overflow-auto">
                  <Textarea
                    id={`${field.name}-input`}
                    placeholder="Write your story here..."
                    className="font-mono"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value)
                      setMarkdown(e.target.value)
                    }}
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </>
            )
          }}
        />
      </div>
    </div>
  )

  return (
    <div className="p-12 min-h-screen flex flex-col w-full mx-auto">
      <header className="flex items-center mb-4">
        <Button variant="default" asChild className="">
          <Link to="/blog">
            <ChevronLeft className="mr-2 size-4" />
            Back to Blog
          </Link>
        </Button>
      </header>

      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Editor</h1>
          <p className="text-muted-foreground">
            Draft your thoughts in Markdown.
          </p>
        </div>

        <div className="hidden md:block">
          <div className="flex gap-2 items-center">
            <Button variant={'outline'} asChild>
              <Link
                to={
                  initialData ? '/blog/$slug/edit/md-editor' : '/blog/md-editor'
                }
                params={{
                  slug: initialData?.slug,
                }}
              >
                <PencilIcon className="size-4" />
                Edit in MD Editor
              </Link>
            </Button>
            <Button
              onClick={() => handleCopy(markdown)}
              className="cursor-pointer"
              variant={'outline'}
            >
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
            <form.Subscribe
              selector={(state) => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button
                  onClick={() => form.handleSubmit()}
                  disabled={isSubmitting}
                  className={cn('gap-2', {
                    'cursor-pointer': !isSubmitting,
                    'cursor-not-allowed': isSubmitting,
                  })}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {initialData ? 'Update Post' : 'Publish Post'}
                </Button>
              )}
            />
          </div>
        </div>
      </header>

      {/* MOBILE */}
      <main className="md:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit-blog" className="gap-2">
              <Pencil className="size-4" /> Write
            </TabsTrigger>
            <TabsTrigger value="preview-blog" className="gap-2">
              <Eye className="size-4" /> Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit-blog">
            <Card>
              <CardContent className="pt-6">
                {EditorFields}
                <Button
                  onClick={() => form.handleSubmit()}
                  className="w-full mt-6 gap-2"
                >
                  <Save className="size-4" />{' '}
                  {initialData ? 'Update' : 'Publish'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview-blog">
            <Card>
              <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                <form.Subscribe
                  selector={(state) => [state.values]}
                  children={([values]) => (
                    <>
                      <h1 className="text-2xl font-bold mb-4">
                        {values.title || 'Untitled'}
                      </h1>
                      <h3>
                        {values.description ||
                          'Some description that makes you flabbergasted...'}
                      </h3>
                      <div className="aspect-video w-full overflow-hidden">
                        <h4>Image Preview</h4>
                        <img
                          src={
                            values.image ??
                            'https://tanstack.com/assets/og-C0HGjoLl.png'
                          }
                          alt={values.title ?? 'Blog Thumbnail'}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform "
                        />
                      </div>
                      <MarkdownRenderer
                        markdown={deferredMarkdown || '*Nothing to preview...*'}
                      />
                    </>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* DESKSTOP */}
      <main className="hidden md:grid grid-cols-2 gap-6 min-h-screen flex-1">
        <Card className="flex flex-col h-250">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
              Editor
            </CardTitle>
          </CardHeader>
          <CardContent>{EditorFields}</CardContent>
        </Card>

        <Card className="flex flex-col bg-slate-50/50 dark:bg-slate-900/50 border-dashed overflow-auto h-250">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <form.Subscribe
              selector={(state) => [state.values]}
              children={([values]) => (
                <main>
                  <h1 className="mt-0">{values.title || 'Untitled Post'}</h1>
                  <h3>
                    {values.description ||
                      'Some description that makes you flabbergasted...'}
                  </h3>
                  <div className="aspect-video w-full overflow-hidden">
                    <h4>Image Preview</h4>
                    <img
                      src={
                        values.image ??
                        'https://tanstack.com/assets/og-C0HGjoLl.png'
                      }
                      alt={values.title ?? 'Blog Thumbnail'}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <MarkdownRenderer
                    markdown={
                      deferredMarkdown || 'Start typing to see the preview...'
                    }
                  />
                </main>
              )}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
