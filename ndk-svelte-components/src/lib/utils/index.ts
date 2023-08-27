export * from "./relay";
export * from "./user";

export function truncatedBech32(bech32: string, length?: number): string {
    return `${bech32.substring(0, length || 9)}...`;
}

export async function copyToClipboard(textToCopy: string | undefined) {
    try {
        await navigator.clipboard.writeText(textToCopy as string);
    } catch (err) {
        console.error("Failed to copy: ", err);
    }
}
