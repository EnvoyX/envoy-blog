import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import {
  Pencil,
  Eye,
  Save,
  Loader2,
  ChevronLeft,
  PencilIcon,
  CopyCheck,
  Copy,
  EyeOff,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceValue } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownRenderer } from '@/components/web/markdown/Markdown';
import { createPostFn, updatePostFn } from '@/data/blog';
import { Post } from '@/generated/prisma/client';
import { cn } from '@/lib/utils';
import { postSchema } from '@/schemas/blog';

export function BlogDashboardEditor({ initialData }: { initialData?: Post }) {
  const [debouncedMarkdown, setDebouncedMarkdown] = useDebounceValue(
    () => initialData?.content ?? '',
    500,
  );
  const [activeTab, setActiveTab] = useState('edit-blog');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const handleCopy = async (markdown: string) => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      description: initialData?.description || '',
      image: initialData?.image || 'https://tanstack.com/assets/og-C0HGjoLl.png',
      published: initialData?.published || false,
      showPrivateToFollowers: initialData?.showPrivateToFollowers || false,
    },
    validators: {
      onSubmit: postSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      if (initialData?.id) {
        await updatePostFn({
          data: {
            postId: initialData.id,
            ...value,
          },
        });
        toast.success('Blog updated succesfully!');
      } else {
        console.log(value);
        await createPostFn({ data: value });
        toast.success('Blog published succesfully!');
        navigate({
          to: '/dashboard/blog',
        });
      }
    },
  });

  const EditorFields = (
    <div className="space-y-6">
      <div className="space-y-2">
        <form.Field
          name="title"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
            );
          }}
        />
      </div>

      <div className="space-y-2">
        <form.Field
          name="description"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
            );
          }}
        />
      </div>

      <div className="space-y-2">
        <form.Field
          name="image"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <>
                <Label htmlFor={`${field.name}-input`}>Image URL (Optional)</Label>
                <Input
                  id={`${field.name}-input`}
                  placeholder="https://tanstack.com/assets/og-C0HGjoLl.png"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </>
            );
          }}
        />
      </div>

      <div className="space-y-2">
        <form.Field
          name="published"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field orientation="horizontal" data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor="form-tanstack-switch-visibility">
                    Visibility ({field.state.value === true ? 'Public' : 'Private'})
                  </FieldLabel>
                  <FieldDescription>
                    Enable whether this blog published to public or keep in private.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldContent>
                <Switch
                  id="form-tanstack-switch-visibility"
                  name={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => {
                    field.handleChange(checked);
                    if (checked === true) form.setFieldValue('showPrivateToFollowers', false);
                  }}
                  aria-invalid={isInvalid}
                />
              </Field>
            );
          }}
        />
      </div>
      <div className="space-y-2">
        <form.Subscribe
          selector={(state) => state.values}
          children={({ published }) => {
            if (!published)
              return (
                <form.Field
                  name="showPrivateToFollowers"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <FieldContent>
                          <FieldLabel htmlFor="form-tanstack-switch-visibility">
                            Show to Followers ({field.state.value === true ? 'Shown' : 'Hidden'})
                          </FieldLabel>
                          <FieldDescription>
                            Enable whether this blog is shown to followers or hidden.
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
                    );
                  }}
                />
              );
          }}
        />
      </div>
      <div className="space-y-2">
        <form.Field
          name="content"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <>
                <Label htmlFor={`${field.name}-input`}>Content (Markdown)</Label>
                <div className="h-125 overflow-auto">
                  <Textarea
                    id={`${field.name}-input`}
                    placeholder="Write your story here..."
                    className="font-mono"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setDebouncedMarkdown(e.target.value);
                    }}
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </>
            );
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 min-h-screen flex flex-col w-full mx-auto">
      <header className="flex items-center mb-4">
        <Button variant="default" asChild className="">
          <Link to="/dashboard/blog">
            <ChevronLeft className="mr-2 size-4" />
            Back to Blog
          </Link>
        </Button>
      </header>

      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Editor</h1>
          <p className="text-muted-foreground">Draft your thoughts in Markdown.</p>
        </div>

        <div className="hidden md:block">
          <div className="flex gap-2 items-center">
            <Button variant={'outline'} asChild>
              <Link
                to={
                  initialData ? '/dashboard/blog/$slug/edit/md-editor' : '/dashboard/blog/md-editor'
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
              onClick={() => handleCopy(debouncedMarkdown)}
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
            <Button
              size={'sm'}
              variant={'default'}
              onClick={() => setShowPreview((prev) => !prev)}
              className="cursor-pointer"
            >
              {showPreview ? (
                <p className="flex gap-1 items-center">
                  <EyeOff className="size-4" />
                  <span>Hide Preview</span>
                </p>
              ) : (
                <p className="flex gap-1 items-center">
                  <Eye className="size-4" />
                  <span>Show Preview</span>
                </p>
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
                  {initialData ? 'Update Blog' : 'Publish Blog'}
                </Button>
              )}
            />
          </div>
        </div>
      </header>

      {/* mobile */}
      <main className="md:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit-blog" className="gap-2" onClick={() => setShowPreview(false)}>
              <Pencil className="size-4" /> Write
            </TabsTrigger>
            <TabsTrigger
              value="preview-blog"
              className="gap-2"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="size-4" /> Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit-blog">
            <Card className="bg-transparent!">
              <CardContent className="pt-6">
                {EditorFields}
                <Button onClick={() => form.handleSubmit()} className="w-full mt-6 gap-2">
                  <Save className="size-4" /> {initialData ? 'Update' : 'Publish'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview-blog">
            <Card>
              <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                {showPreview && (
                  <form.Subscribe
                    selector={(state) => [state.values]}
                    children={([values]) => (
                      <>
                        <h1 className="text-2xl font-bold mb-4">{values.title || 'Untitled'}</h1>
                        <h3>
                          {values.description || 'Some description that makes you flabbergasted...'}
                        </h3>
                        <div className="aspect-video w-full overflow-hidden">
                          <h4>Image Preview</h4>
                          <img
                            src={values.image ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'}
                            alt={values.title ?? 'Blog Thumbnail'}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform "
                          />
                        </div>
                        <MarkdownRenderer
                          markdown={debouncedMarkdown || '*Nothing to preview...*'}
                        />
                      </>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* desktop */}
      <main className="hidden md:grid grid-cols-1 gap-6 max-h-250 flex-1 ">
        {!showPreview && (
          <Card className="flex flex-col h-full bg-transparent!">
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                Editor
              </CardTitle>
            </CardHeader>
            <CardContent>{EditorFields}</CardContent>
          </Card>
        )}

        {showPreview && (
          <Card className="flex flex-col bg-slate-50/50 dark:bg-slate-900/50 border-dashed overflow-auto">
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
                    <h1 className="mt-0">{values.title || 'Untitled Blog'}</h1>
                    <h3>
                      {values.description || 'Some description that makes you flabbergasted...'}
                    </h3>
                    <div className="aspect-video w-full overflow-hidden">
                      <h4>Image Preview</h4>
                      <img
                        src={values.image ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'}
                        alt={values.title ?? 'Blog Thumbnail'}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <MarkdownRenderer
                      markdown={debouncedMarkdown || 'Start typing to see the preview...'}
                    />
                  </main>
                )}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
