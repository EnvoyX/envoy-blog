import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCurrentQuranProgressFn, savedQuranProgressFn } from "@/data/quran-tracker";
import { quranTrackSchema } from "@/schemas/quran-tracker";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { intlFormat } from "date-fns";
import { Loader2, Pencil, Save } from "lucide-react";
import { useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/quran-tracker/")({
  head: () => ({
    meta: [
      { title: `Qur'an Tracker | Envoy Blog` },
      {
        name: "Envoy Blog",
        content: "Welcome to my TanStack Start playground!",
      },
      { property: "og:title", content: "Qur'an Tracker | Envoy Blog" },
      { property: "og:description", content: "Track your tilawah progress!" },
      {
        property: "og:image",
        content: "https://tanstack.com/assets/og-C0HGjoLl.png",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;

    hasInitialized.current = true;
  });
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    defaultValues: {
      currentSurah: "",
      currentJuz: "",
      currentAyat: "",
    },
    validators: {
      onSubmit: quranTrackSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
      startTransition(async () => {
        console.log("Form values: ", value);
        await savedQuranProgressFn({ data: value });
        void queryClient.invalidateQueries({
          queryKey: ["quran-track"],
        });
        toast.success("Progress saved successfully!");
      });
    },
  });

  const {
    data: progress,
    isPending: isPendingQuery,
    isError,
  } = useQuery({
    queryKey: ["quran-track"],
    queryFn: async () => {
      const data = await fetchCurrentQuranProgressFn();

      return data;
    },
  });
  return (
    <div className="min-h-screen  text-zinc-100 selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="space-y-2 mb-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h1 className="text-4xl font-black tracking-tight text-white">Qur'an Tracker</h1>
          </div>
          <p className="text-zinc-400 text-lg">Monitor your spiritual journey with precision.</p>
        </header>

        <Tabs defaultValue="saved-progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 border border-zinc-800 p-1 backdrop-blur-xl h-12">
            <TabsTrigger
              value="saved-progress"
              className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 transition-all"
            >
              <Save className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="update-progress"
              className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 transition-all"
            >
              <Pencil className="size-4" />
              Update
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="saved-progress"
            className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
              <CardHeader>
                <CardTitle className="text-xl text-zinc-200">Spiritual Momentum</CardTitle>
                <CardDescription className="text-zinc-500">
                  Real-time tilawah metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isPendingQuery ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group overflow-hidden rounded-2xl bg-zinc-800/30 border border-zinc-700/50 p-6 transition-all hover:bg-zinc-800/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-emerald-500 mb-1">STREAK</p>
                            <h3 className="text-5xl font-black text-white leading-none">
                              {progress?.currentStreak ?? "0"}{" "}
                              <span className="text-2xl text-emerald-500/80">days</span>
                            </h3>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <span className="text-2xl">🔥</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-zinc-800/30 border border-zinc-700/50 p-6 flex flex-col justify-center">
                        <p className="text-sm font-medium text-zinc-500 mb-1">LAST UPDATED</p>
                        <p className="text-white font-semibold">
                          {progress?.updatedAt
                            ? intlFormat(new Date(progress.updatedAt), {
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                weekday: "short",
                                hour12: false,
                              })
                            : "No data"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Surah",
                          value: progress?.currentSurah,
                          icon: "📖",
                        },
                        {
                          label: "Ayat",
                          value: progress?.currentAyat,
                          icon: "🔢",
                        },
                        {
                          label: "Juz",
                          value: progress?.currentJuz,
                          icon: "🔖",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center hover:border-zinc-700 transition-colors overflow-hidden"
                        >
                          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm md:text-base lg:text-lg font-bold text-zinc-200">
                            {item.value || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="update-progress" className="mt-6">
            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
              <CardHeader>
                <CardTitle className="text-xl text-zinc-200">Log Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void form.handleSubmit();
                  }}
                >
                  <FieldGroup>
                    <form.Field
                      name="currentSurah"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Current Surah</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="Al-Falaq"
                              autoComplete="off"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    />
                    <form.Field
                      name="currentAyat"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Current Ayat</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="Ayat 23"
                              autoComplete="off"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    />
                    <form.Field
                      name="currentJuz"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Current Juz</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="Juz 30"
                              autoComplete="off"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
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
  );
}
