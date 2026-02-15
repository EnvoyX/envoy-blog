import { createClientOnlyFn } from "@tanstack/react-start";

export const copyToClipboard = createClientOnlyFn(async (url: string) => {
    await navigator.clipboard.writeText(url)
    return
})
