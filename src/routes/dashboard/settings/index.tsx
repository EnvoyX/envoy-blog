import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldDescription, FieldError, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSettingStore } from "@/store/settings";
import { useRef } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { settingsSchema } from "@/schemas/settings";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { updateUserSettings } from "@/data/settings";
import { dashboardUserPreferences } from "@/data/query-options/dashboardQueryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/settings/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(dashboardUserPreferences());
  },
  head: () => ({
    meta: [
      { title: `Settings | Envoy Mindpalace` },
      {
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      {
        property: "og:title",
        content: `Settings | Envoy Mindpalace`,
      },
      {
        property: "og:description",
        content: `Configure and edit settings.`,
      },
      {
        property: "og:image",
        content: "https://tanstack.com/assets/og-C0HGjoLl.png",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();
  const { data } = useSuspenseQuery({
    ...dashboardUserPreferences(),
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { saveKey, ImgbbAPIKey } = useSettingStore();
  const form = useForm({
    defaultValues: {
      showFollowStats: data.userPreferences.showFollowStats ?? false,
    },
    validators: {
      onSubmit: settingsSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      await updateUserSettings({
        data: {
          showFollowStats: value.showFollowStats,
        },
      });
      toast.success("Settings saved succesfully!");
      void queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });
  const handleSaveKey = () => {
    const keyValue = inputRef?.current?.value;

    saveKey(keyValue ?? "");
    toast.success("API Key saved successfully!");
  };
  return (
    <main className="h-screen p-8">
      <div className="flex flex-col">
        <header className="mb-12">
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-base text-slate-400">Configure and edit settings here.</p>
        </header>
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold border-b-2 border-b-white w-fit pb-0.5">API Keys</h1>
          <Field className="max-w-sm">
            <FieldLabel htmlFor="input-demo-api-key">IMGBB API Key</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="imgbb-api-key"
                ref={inputRef}
                type="text"
                defaultValue={ImgbbAPIKey ?? ""}
                placeholder="Your API Key"
              />
              <Button className="cursor-pointer" onClick={handleSaveKey}>
                Save Key
              </Button>
            </div>
            <FieldDescription>
              Your API key is will be stored locally on your browser. Be sure to save your API key
              safely. You can change this any time.
            </FieldDescription>
          </Field>
          <Separator className="my-2" />
          <h1 className="text-2xl font-bold border-b-2 border-b-white w-fit pb-0.5">Preferences</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="showFollowStats"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <>
                      <Field className="max-w-sm">
                        <FieldLabel htmlFor="input-demo-api-key">
                          Followers & Following Visibility
                        </FieldLabel>
                        <div className="flex items-center gap-2">
                          <Switch
                            id="form-tanstack-switch-visibility"
                            name={field.name}
                            checked={field.state.value}
                            onCheckedChange={field.handleChange}
                            aria-invalid={isInvalid}
                          />
                          <p className="font-bold text-emerald-500">
                            {field.state.value ? "Show" : "Hidden"}
                          </p>
                        </div>
                        <FieldDescription>
                          Change visibility for followers and following on profile.
                        </FieldDescription>
                      </Field>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </>
                  );
                }}
              />
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="flex max-w-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Save
                  </Button>
                )}
              />
            </FieldGroup>
          </form>
        </section>
      </div>
    </main>
  );
}
