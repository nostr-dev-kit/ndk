import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import chalk from "chalk";

export const DEFAULT_RELAYS = [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.primal.net",
];

export async function createNDK(nsec?: string): Promise<NDK> {
    const ndk = new NDK({
        explicitRelayUrls: DEFAULT_RELAYS,
    });

    if (nsec) {
        const signer = new NDKPrivateKeySigner(nsec);
        ndk.signer = signer;
    }

    // Don't await connect - it may hang waiting for all relays
    ndk.connect();
    
    // Wait for at least one relay to connect
    await new Promise<void>((resolve) => {
        let resolved = false;
        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        }, 5000);
        
        ndk.pool.on("relay:connect", () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                // Give a bit more time for other relays
                setTimeout(resolve, 500);
            }
        });
    });
    
    return ndk;
}

export function formatTimestamp(ts: number | undefined): string {
    if (!ts) return "unknown";
    return new Date(ts * 1000).toLocaleString();
}

export function truncate(str: string, maxLength: number = 100): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + "...";
}

export function log(message: string): void {
    console.log(message);
}

export function success(message: string): void {
    console.log(chalk.green("✓ " + message));
}

export function error(message: string): void {
    console.error(chalk.red("✗ " + message));
}

export function info(message: string): void {
    console.log(chalk.blue("ℹ " + message));
}

export function warn(message: string): void {
    console.log(chalk.yellow("⚠ " + message));
}

/**
 * Decode naddr to get collaborative event info
 */
export function decodeNaddr(naddr: string): {
    kind: number;
    pubkey: string;
    identifier: string;
    relays?: string[];
} {
    // Import nostr-tools dynamically to handle both CJS and ESM
    const { nip19 } = require("nostr-tools");
    
    const decoded = nip19.decode(naddr);
    if (decoded.type !== "naddr") {
        throw new Error("Invalid naddr format");
    }
    
    return decoded.data as {
        kind: number;
        pubkey: string;
        identifier: string;
        relays?: string[];
    };
}
