import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  fetchCurrentQuranProgressFn,
  savedQuranProgressFn,
} from '@/data/quran-tracker'
import { quranTrackSchema } from '@/schemas/quran-tracker'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { intlFormat } from 'date-fns'
import { Loader2, Pencil, Save } from 'lucide-react'
import { useEffect, useRef, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/quran-tracker/')({
  head: () => ({
    meta: [
      { title: `Qur'an Tracker | Envoy Blog` },
      {
        name: 'Envoy Blog',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: "Qur'an Tracker | Envoy Blog" },
      { property: 'og:description', content: 'Track your tilawah progress!' },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (hasInitialized.current) return

    hasInitialized.current = true
  })
  const [isPending, startTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      currentSurah: '',
      currentJuz: '',
      currentAyat: '',
    },
    validators: {
      onSubmit: quranTrackSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value)
      startTransition(async () => {
        console.log('Form values: ', value)
        savedQuranProgressFn({ data: value })
        toast.success('Progress saved successfully!')
      })
    },
  })

  const {
    data: progress,
    isPending: isPendingQuery,
    isError,
  } = useQuery({
    queryKey: ['quran-track'],
    queryFn: async () => {
      const data = await fetchCurrentQuranProgressFn()

      return data
    },
  })
  return (
    <div className="px-4 min-h-screen flex flex-col">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">{`Qur'an Tracker`}</h1>
        <p className="text-muted-foreground">
          Update and track your {`Qur'an tilawah progress`} .
        </p>
        <Tabs defaultValue="saved-progress" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved-progress" className="gap-2">
              <Save className="size-4" />
              Saved Progress
            </TabsTrigger>
            <TabsTrigger value="update-progress" className="gap-2">
              <Pencil className="size-4" />
              Update Progress
            </TabsTrigger>
          </TabsList>
          <TabsContent value="saved-progress">
            <Card>
              <CardHeader>
                <CardTitle>Your saved progress</CardTitle>
                <CardDescription>
                  Latest and current progress of your tilawah
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPendingQuery ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="size-6 animate-spin"></Loader2>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex max-sm:flex-col max-sm:text-center items-center justify-center sm:justify-between border-2 p-4 rounded-lg bg-white/5 ">
                      <div>
                        <h3 className="text-lg font-bold">Current Streak 🔥</h3>
                        <p className="text-xl font-semibold">
                          {progress?.currentStreak}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Last updated</h3>
                        <p className="flex justify-center">
                          <span className="text-base font-semibold">
                            {intlFormat(
                              progress?.updatedAt as Date,
                              {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: false,
                              },
                              {
                                locale: 'en-ID',
                              },
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center sm:justify-evenly gap-2 border-2 p-4 rounded-lg bg-white/10">
                      <div>
                        <h3 className="font-bold">Current Surah</h3>
                        <p>{progress?.currentSurah}</p>
                      </div>
                      <div>
                        <h3 className="font-bold">Current Ayat</h3>
                        <p>{progress?.currentAyat}</p>
                      </div>
                      <div>
                        <h3 className="font-bold">Current Juz</h3>
                        <p>{progress?.currentJuz}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update-progress">
            <Card>
              <CardHeader>
                <CardTitle>Update your progress here</CardTitle>
                <CardDescription>{`Fill the form below to update`}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <form.Field
                      name="currentSurah"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Current Surah
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Al-Falaq"
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
                      name="currentAyat"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Current Ayat
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Ayat 23"
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
                      name="currentJuz"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Current Juz
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Juz 30"
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
                          <Loader2 className="size-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Pencil className="size-4" />
                          Update Progress
                        </>
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
