import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/proxy-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url).searchParams.get("url");
        if (!url) return new Response("No URL", { status: 400 });

        const imageRes = await fetch(url);
        return new Response(imageRes.body, {
          headers: { "Content-Type": "image/jpeg" },
        });
      },
    },
  },
});
