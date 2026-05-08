import { Button, buttonVariants } from "@/components/ui/button";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Mail, ShieldCheck, User, UserIcon } from "lucide-react";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { IconLogout2 } from "@tabler/icons-react";
import { EditProfileDialog } from "@/components/web/EditProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { imageUploadModalStore } from "@/store/imageUploadStore";
import { UploadThingModal } from "@/components/web/uplooadthing/UploadThingModal";
import { getProfileData } from "@/data/session";

export const Route = createFileRoute("/dashboard/profile")({
  loader: async () => {
    const session = await getProfileData();

    return {
      user: session.user,
    };
  },
  head: () => ({
    meta: [
      { title: "Profile | Envoy Blog" },
      {
        name: "Envoy Blog",
        content: "Welcome to TanStack Start playground!",
      },
      { property: "og:title", content: "Profile | Envoy Blog" },
      {
        property: "og:description",
        content: "View your profile information and settings",
      },
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
  const { user } = Route.useLoaderData();
  const navigate = useNavigate();
  const [isTransition, startTransition] = useTransition();
  const handleLogout = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            toast.loading("Logging out...", {
              id: "logout",
            });
          },
          onError: ({ error }) => {
            toast.dismiss("logout");
            toast.error("Failed to log out", {
              description: error.message,
            });
          },
          onSuccess: () => {
            toast.dismiss("logout");
            toast.success("Logged out successfully");
            void navigate({
              to: "/login",
            });
          },
        },
      });
    });
  };

  return (
    <main className="w-full max-w-4xl mx-auto py-12 px-6">
      <header className="mb-10 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <div className="size-40 rounded-2xl overflow-hidden bg-linear-to-br from-emerald-500 to-slate-600 p-1">
            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center overflow-hidden">
              {user?.image || user?.defaultImage ? (
                <Avatar className="size-40 shrink-0 after:border-none!">
                  <AvatarImage
                    src={(user?.image as string) ?? (user?.defaultImage as string)}
                    alt={user?.name}
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.className = "hidden";
                    }}
                    className="w-full h-full object-cover object-center rounded-lg"
                  />

                  <AvatarFallback className="w-full h-full object-cover object-center rounded-lg text-3xl">
                    {" "}
                    {(user?.name as string)
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : ""}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserIcon className="size-12 text-muted-foreground" />
              )}
            </div>
          </div>
          {/*<button className="absolute -bottom-2 -right-2 p-2 bg-surface border border-border rounded-full shadow-lg hover:text-emerald-500 transition-colors">
            <Camera className="size-4" />
          </button>*/}
        </div>

        <div className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{user?.name || "Anonymous User"}</h1>
          <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
            <Mail className="size-4" /> {user?.email}
          </p>
          <p className="text-slate-400 italic">{user?.biodata}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4">
            Account Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2 text-sm">
                <ShieldCheck className="size-4" /> Status
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${user?.emailVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-500/10 text-emerald-500"}`}
              >
                {user?.emailVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="size-4" /> Joined
              </span>
              <span className="text-sm font-medium">
                {user?.createdAt ? new Date(user?.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4">
            System Info
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {user?.id?.slice(0, 8)}...
              </code>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-muted-foreground">Linked Accounts</span>
              <span className="font-medium truncate">
                {user?.accounts.map((account) => account.providerId.toUpperCase()).join(" | ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 pt-6 border-t border-border flex max-sm:flex-col gap-4">
        <EditProfileDialog user={user} />
        <Link
          to="/user/$userId"
          className={buttonVariants({ variant: "default" })}
          params={{
            userId: user?.id as string,
          }}
        >
          View on Public
        </Link>
        <Button
          variant={"outline"}
          onClick={() =>
            imageUploadModalStore.setState((prev) => ({
              ...prev,
              type: "profile-picture",
              isUploadThingDialogOpen: true,
            }))
          }
          className="px-5 py-2.5 bg-background border border-border font-medium rounded-lg hover:bg-muted transition-colors text-emerald-500 cursor-pointer"
        >
          <User />
          Upload Profile Image
        </Button>
        <Button
          variant={"outline"}
          onClick={handleLogout}
          disabled={isTransition}
          className="px-5 py-2.5 bg-background border border-border font-medium rounded-lg hover:bg-muted transition-colors text-destructive cursor-pointer"
        >
          <IconLogout2 />
          Logout
        </Button>
      </footer>
      <UploadThingModal />
    </main>
  );
}
