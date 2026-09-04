import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Cpu, Loader2, LogOut, Menu, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUser } from "@/data/session";
import { authClient } from "@/lib/auth-client";
import { MODEL_CONFIG } from "@/lib/constants";
import { useSidebarMobileStore } from "@/store/sidebar";

import { Button, buttonVariants } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import { navItemsDashboard } from "./NavItems";
import { UserAvatar } from "./user-profile";

interface ModelChange {
  model: string;
  currentModel: string;
  onModelChange: (model: string) => void;
  provider?: keyof typeof MODEL_CONFIG;
}

export default function HeaderChat({
  model,
  currentModel,
  onModelChange,
  provider = "openrouter",
}: ModelChange) {
  const session = useQuery({
    queryKey: ["get-session"],
    queryFn: async () => {
      const data = await getUser();
      return data;
    },
  });
  const { toggleMobileSidebar } = useSidebarMobileStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTransition, startTransition] = useTransition();
  const availableModels = MODEL_CONFIG[provider];
  const handleLogout = () => {
    setIsLoading(true);
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            toast.loading("Logging out...", {
              id: "logout",
            });
            setIsLoading(true);
          },
          onError: ({ error }) => {
            setIsLoading(false);
            toast.dismiss("logout");
            toast.error("Failed to log out", {
              description: error.message,
            });
          },
          onSuccess: () => {
            setIsLoading(false);
            toast.dismiss("logout");
            toast.success("Logged out successfully");
            navigate({
              to: "/login",
              reloadDocument: true,
            });
          },
        },
      });
    });
  };
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800/50 bg-zinc-950/70 backdrop-blur-xl p-4">
      <main className="w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-4 max-sm:hidden">
            <SidebarTrigger className="text-zinc-400" />
          </div>
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar}>
              <Menu className="size-6 text-primary" />
            </Button>
          </div>
          <div className="flex items-center sm:hidden">
            <Select value={currentModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-18 h-7 bg-zinc-900/50 border-zinc-800 text-[10px] uppercase tracking-wider font-bold text-zinc-400 hover:text-zinc-200 transition-colors rounded-full px-3 gap-2 outline-none ring-0 focus:ring-0">
                <Cpu size={12} className="text-blue-500" />
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                {availableModels.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value}
                    className="text-xs focus:bg-zinc-900 focus:text-white cursor-pointer"
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 max-sm:hidden">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-white/20">
              <Sparkles size={18} className="text-primary-foreground" />
            </div>
            <h1 className="font-bold tracking-tight text-lg">Envoy Chat</h1>
          </div>
        </div>
        <div className="flex max-sm:flex-col max-sm:gap-1 items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            {model}
          </div>
          <div className="flex items-center max-sm:hidden">
            <Select value={currentModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-fit h-7 bg-zinc-900/50 border-zinc-800 text-[10px] uppercase tracking-wider font-bold text-zinc-400 hover:text-zinc-200 transition-colors rounded-full px-3 gap-2 outline-none ring-0 focus:ring-0">
                <Cpu size={12} className="text-blue-500" />
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                {availableModels.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value}
                    className="text-xs focus:bg-zinc-900 focus:text-white cursor-pointer"
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 max-sm:hidden">
          {session.isPending ? (
            <Loader2 className="animate-spin size-5" />
          ) : session?.data?.user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <UserAvatar
                    src={session.data?.user.image as string}
                    alt={session.data?.user.name as string}
                    className="w-12 h-12 border-2 border-primary/50 hover:ring-2 ring-primary transition-all"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background/25 backdrop-blur-xl border-white/25 "
                >
                  <div className="p-2 px-3">
                    <p className="text-sm font-medium truncate">{session.data?.user.name}</p>
                    <p className="text-xs text-accent-foreground truncate">
                      {session.data.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {navItemsDashboard.map((item, idx) => {
                    return (
                      <DropdownMenuItem asChild key={idx}>
                        <Link
                          to={item.to}
                          activeProps={{
                            "data-active": true,
                          }}
                          activeOptions={item.activeOptions}
                          className="cursor-pointer hover:bg-primary/10! hover:text-primary! hover:border-r-2! hover:border-primary!"
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoading || isTransition}
                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="text-white mr-2 size-4" />
                    {isLoading || isTransition ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ variant: "secondary" })}>
                Login
              </Link>
            </>
          )}
        </div>
      </main>
    </header>
  );
}
