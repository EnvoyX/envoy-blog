import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { scrapeUrl } from '@/data/items'
import { bulkImportSchema, singleImportSchema } from '@/schemas/import'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { GlobeIcon, LinkIcon, Loader2 } from 'lucide-react'
import { useEffect, useRef, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/import')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const [isPending, startTransition] = useTransition()
    const hasInitialized = useRef(false)
    useEffect(() => {
        if (hasInitialized.current) return

        hasInitialized.current = true
    })
    const form = useForm({
        defaultValues: {
            url: "",
            prompt: "",
        },
        validators: {
            onSubmit: singleImportSchema,
        },
        onSubmit: ({ value }) => {
            console.log(value)
            toast.success("Successfully submitted")
            startTransition(async () => {
                console.log("Form values: ", value)
                await scrapeUrl({ data: value })
            })
        },
    })
    const bulkForm = useForm({
        defaultValues: {
            url: "",
            search: "",
        },
        validators: {
            onSubmit: bulkImportSchema,
        },
        onSubmit: ({ value }) => {
            console.log(value)
            toast.success("Successfully submitted")
            startTransition(async () => {
                console.log("Form values: ", value)
            })
        },
    })

    return <section className='flex flex-1 justify-center items-center py-8'>
        <div className='w-full max-w-2xl space-y-6 px-4'>
            <div className="text-center">
                <h1 className="text-3xl font-bold">Import Content</h1>
                <p className="text-muted-foreground pt-1">Save web pages to your library or blog</p>
            </div>

            <Tabs defaultValue='single'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value="single" className='gap-2'>
                        <LinkIcon className='size-4' />
                        Single URL
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className='gap-2'>
                        <GlobeIcon className='size-4' />
                        Bulk Import
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="single">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Single URL</CardTitle>
                            <CardDescription>Scrape & Save Content from any web app!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                form.handleSubmit()
                            }}>
                                <FieldGroup>
                                    <form.Field
                                        name="url"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Single URL</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="https://www.better-auth.com/"
                                                        autoComplete="off"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError errors={field.state.meta.errors} />
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                    <form.Field
                                        name="prompt"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Prompt (Optional)</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Enter a prompt"
                                                        autoComplete="off"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError errors={field.state.meta.errors} />
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? (
                                            <>
                                                <Loader2 className='size-4 animate-spin' />
                                                Processing...
                                            </>
                                        ) : "Import URL"}
                                    </Button>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="bulk">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Import</CardTitle>
                            <CardDescription>Discover & import multiple URLs from a website at once</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                bulkForm.handleSubmit()
                            }}>
                                <FieldGroup>
                                    <bulkForm.Field
                                        name="url"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Single URL</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="https://www.better-auth.com/"
                                                        autoComplete="off"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError errors={field.state.meta.errors} />
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                    <bulkForm.Field
                                        name="search"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Filter (Optional)</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="e.g Blog, docs, tutorial"
                                                        autoComplete="off"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError errors={field.state.meta.errors} />
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? (
                                            <>
                                                <Loader2 className='size-4 animate-spin' />
                                                Processing...
                                            </>
                                        ) : "Import URLs"}
                                    </Button>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

    </section>
}
