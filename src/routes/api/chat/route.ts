import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { openRouterText } from "@tanstack/ai-openrouter";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                // Check for API key
                if (!process.env.OPENAI_API_KEY) {
                    return new Response(
                        JSON.stringify({
                            error: "OPENAI_API_KEY not configured",
                        }),
                        {
                            status: 500,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }

                const { messages, conversationId } = await request.json();

                try {
                    // Create a streaming chat response
                    const stream = chat({
                        adapter: openRouterText("google/gemini-2.5-flash"),
                        messages,
                        conversationId,
                    });

                    // Convert stream to HTTP response
                    return toServerSentEventsResponse(stream);
                } catch (error) {
                    return new Response(
                        JSON.stringify({
                            error:
                                error instanceof Error ? error.message : "An error occurred",
                        }),
                        {
                            status: 500,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }
            },
        },
    },
});
