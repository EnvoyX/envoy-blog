import { ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "../ui/button";

export function DefaultErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const navigate = useNavigate();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent px-6 py-24 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-[20%] right-[10%] h-125 w-125 rounded-full bg-red-900/10 blur-[120px]" />
        <div className="absolute -top-[10%] left-[10%] h-100 w-100 rounded-full bg-white/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-950/50 ring-1 ring-white/50">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Something went wrong
        </h1>

        <p className="mt-4 text-slate-400">
          An unexpected error occurred while processing your request. Please try again or come back
          later.
        </p>

        <div className="mt-8 overflow-hidden rounded-lg bg-slate-900/50 border border-slate-800 p-4 text-left">
          <pre className="font-mono whitespace-pre-wrap text-xs text-zinc-400 ">
            {error.message || "Unknown system error"}
          </pre>
        </div>

        <div className="mt-10 flex items-center justify-center gap-x-4">
          <Button
            onClick={() => {
              reset();
              router.invalidate();
            }}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
          >
            Try Again
          </Button>

          <Button
            onClick={() => {
              navigate({
                to: "/",
                replace: true,
              });
            }}
            className="rounded-md bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
