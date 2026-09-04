import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, Loader2, Copy, Check, UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileOptions } from "@/data/query-options/dashboardQueryOptions";
import { updateProfile } from "@/data/user";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FieldError } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { UserAvatar } from "./user-profile";

export function EditProfileDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...profileOptions().queryKey] });
      toast.success("Profile updated successfully");
      setOpen(false);
    },
    onError: (error) =>
      toast.error("Failed to update profile", {
        description: error.message,
      }),
  });

  const form = useForm({
    defaultValues: {
      name: user.name ?? "",
      biodata: user.biodata ?? "",
      image: user.image ?? "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string(),
        biodata: z.string(),
        image: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        data: {
          id: user.id,
          name: value.name,
          biodata: value.biodata,
          image: value.image,
        },
      });
    },
  });

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="px-5 py-2.5 text-background font-medium rounded-lg cursor-pointer"
        >
          <PencilIcon className="mr-2 size-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-md bg-transparent backdrop-blur-lg border-border">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="max-h-[85vh] overflow-y-auto p-0 scrollbar-hide">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="space-y-6 py-4 w-full"
          >
            <form.Field
              name="name"
              validators={{ onChange: z.string().min(2, "Name is too short") }}
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="space-y-2 w-full">
                    <Label htmlFor={field.name}>Display Name</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </div>
                );
              }}
            />
            <form.Field
              name="biodata"
              validators={{
                onChange: z.string().or(z.literal("")).nullable(),
              }}
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <>
                    <Label htmlFor={`${field.name}-input`}>Biodata</Label>
                    <Textarea
                      id={`${field.name}-input`}
                      placeholder="Tell about yourself..."
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </>
                );
              }}
            />

            <form.Field
              name="image"
              validators={{
                onChange: z.url().or(z.literal("")).nullable(),
              }}
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Profile Image URL</Label>
                    <div className="flex flex-col gap-4">
                      <div className="flex-1 space-y-1">
                        <Input
                          id={field.name}
                          placeholder="https://example.com/avatar.png"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </div>
                      <div className=" overflow-hidden flex flex-col gap-2 items-center justify-center">
                        {field.state.value ? (
                          <>
                            <Avatar className="size-24 shrink-0 after:border-none!">
                              <AvatarImage
                                src={field.state.value as string}
                                alt={user.name}
                                onError={(e) => {
                                  e.currentTarget.src = "";
                                  e.currentTarget.className = "hidden";
                                }}
                                className="w-full h-full object-cover object-center rounded-lg"
                              />

                              <AvatarFallback>
                                {" "}
                                {(user.name as string)
                                  ? (user.name as string)
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                  : ""}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-slate-50 italic text-center">
                              An aspect square ratio image is recommended for best result.
                            </span>
                          </>
                        ) : (
                          <UserIcon className="size-6 text-slate-50/50" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <div className="space-y-2 opacity-70 w-full flex flex-col items-center">
              <Label className="text-slate-50">Original Provider Image</Label>
              <div className="flex items-center gap-3 p-2 rounded-md bg-transparent border border-dashed w-full">
                <UserAvatar src={user.defaultImage ?? user.image} alt={user.name} />
                <div className="flex items-center justify-center gap-3 w-full max-w-xs">
                  <p className="text-xs truncate text-slate-50 ">
                    <span>{user.defaultImage ?? user.image}</span>
                  </p>
                </div>
              </div>
              <Button
                variant={"outline"}
                onClick={(e) => {
                  e.preventDefault();
                  void handleCopy(user.defaultImage ?? user.image);
                }}
              >
                {copied ? (
                  <span className="flex items-center gap-2">
                    <Check size={12} className="text-primary-500" />
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Copy size={12} />
                    Copy default image
                  </span>
                )}
              </Button>
              <span className="text-xs truncate text-slate-50">
                Default image is from:{" "}
                <span className="uppercase">{user.accounts?.[0]?.providerId || "Provider"}</span>
              </span>
              <p className="text-[10px] text-slate-50 italic">
                Note: This is your default SSO image and cannot be modified directly. but you can
                still use the default image.
              </p>
            </div>

            <DialogFooter>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || mutation.isPending}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white cursor-pointer"
                  >
                    {mutation.isPending ||
                      (isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />)}
                    Save Changes
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
