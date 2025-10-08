import type { Proof } from "@cashu/cashu-ts";
import type { WalletContext } from "../wallet-context.js";
import { createTable, drawHeader, drawSection } from "./render.js";
import { eventIdPreview, formatRelativeTime, formatSats, formatTime, theme, truncate } from "./theme.js";

export function renderProofManager(ctx: WalletContext, filter?: { mint?: string; status?: string }): string {
    if (!ctx.wallet) {
        return drawSection("PROOF MANAGER", [theme.muted("Wallet not initialized")]);
    }

    const sections: string[] = [];
    sections.push(drawHeader("PROOF MANAGER", "Detailed Proof Inspection"));
    sections.push("");

    const availableProofs = ctx.wallet.state.getProofs({ onlyAvailable: true });
    const reservedProofs = ctx.wallet.state.getProofs({ onlyReserved: true });
    const allProofs = ctx.wallet.state.getProofs({});

    const destroyed = allProofs.length - availableProofs.length - reservedProofs.length;

    const summary = [
        `Total Proofs: ${theme.info(allProofs.length.toString())}  │  ` +
            `Available: ${theme.success(availableProofs.length.toString())}  │  ` +
            `Reserved: ${theme.warning(reservedProofs.length.toString())}  │  ` +
            `Destroyed: ${theme.muted(destroyed.toString())}`,
    ];

    sections.push(drawSection("", summary));
    sections.push("");

    if (filter?.mint) {
        const mintProofs = ctx.wallet.state.getProofs({ mint: filter.mint, onlyAvailable: true });
        sections.push(renderProofTable(mintProofs, filter.mint));
    } else {
        const mints = Array.from(new Set(availableProofs.map((p: Proof & { mint?: string }) => p.mint || "unknown")));

        for (const mint of mints) {
            if (!mint) continue;
            const mintProofs = ctx.wallet.state.getProofs({ mint, onlyAvailable: true });
            if (mintProofs.length > 0) {
                sections.push(renderProofTable(mintProofs, mint));
                sections.push("");
            }
        }
    }

    const commands = [
        "Commands:",
        "  proofs <mint-url>       - Filter by mint",
        "  proofs --available      - Show only available",
        "  proofs --reserved       - Show reserved proofs",
    ];
    sections.push(drawSection("", commands));

    return sections.join("\n");
}

function renderProofTable(proofs: Proof[], mint: string): string {
    const mintName = new URL(mint).hostname;

    const rows: string[][] = [];

    for (const proof of proofs.slice(0, 10)) {
        const secret = proof.secret.toString();
        const secretPreview = secret.length > 16 ? `${secret.slice(0, 13)}...` : secret;

        rows.push([
            formatSats(proof.amount),
            theme.muted(secretPreview),
            theme.success("✓ Avail"),
            theme.muted("now"), // We'd need created timestamp
            theme.muted("(from event)"),
        ]);
    }

    if (proofs.length > 10) {
        rows.push([theme.muted(`... ${proofs.length - 10} more proofs`), "", "", "", ""]);
    }

    const title = `Available Proofs (${theme.info(mintName)}) - ${proofs.length} total`;

    return drawSection(title, [
        createTable({
            head: ["Amount", "Secret (preview)", "Status", "Created", "Token Event"],
            rows,
        }),
    ]);
}

export function renderStateInspection(ctx: WalletContext): string {
    if (!ctx.wallet) {
        return drawSection("WALLET STATE DEBUG", [theme.muted("Wallet not initialized")]);
    }

    const sections: string[] = [];
    sections.push(drawHeader("WALLET STATE DEBUG", "Deep Dive into Wallet Internals"));
    sections.push("");

    sections.push(renderProofState(ctx));
    sections.push("");
    sections.push(renderBalanceComputation(ctx));
    sections.push("");
    sections.push(renderSubscriptionState(ctx));

    return sections.join("\n");
}

function renderProofState(ctx: WalletContext): string {
    if (!ctx.wallet) return "";

    const availableProofs = ctx.wallet.state.getProofs({ onlyAvailable: true });
    const reservedProofs = ctx.wallet.state.getProofs({ onlyReserved: true });

    const content = [
        "Proof Store:",
        `  Available:  Map(${theme.info(availableProofs.length.toString())} entries)`,
        `  Reserved:   Map(${theme.warning(reservedProofs.length.toString())} entries)`,
        "",
        `Token Events: Map entries tracked`,
    ];

    return drawSection("PROOF STATE", content);
}

function renderBalanceComputation(ctx: WalletContext): string {
    if (!ctx.wallet) return "";

    const balance = ctx.wallet.balance;
    const mintBalances = ctx.wallet.mintBalances;

    const content = [
        `Available Balance:  ${theme.highlight(`${formatSats(balance?.amount || 0)} sats`)}`,
        "",
        "By Mint (available only):",
    ];

    for (const [mint, amount] of Object.entries(mintBalances)) {
        const mintName = new URL(mint).hostname;
        content.push(`  ${truncate(mintName, 30)}:  ${theme.success(`${formatSats(amount)} sats`)}`);
    }

    return drawSection("BALANCE COMPUTATION", content);
}

function renderSubscriptionState(ctx: WalletContext): string {
    const content = [
        `Active Subscription: ${theme.info("cashu-wallet-state")}`,
        "  Filters:",
        `    - kind 7375 (CashuToken)`,
        `    - kind 7376 (CashuQuote)`,
        `    - kind 5 (Deletion)  #k: [7375]`,
        "",
        `  Events Received: ${theme.info(ctx.eventLog.length.toString())} events`,
    ];

    return drawSection("SUBSCRIPTION STATE", content);
}

export function renderSyncStatus(ctx: WalletContext): string {
    const sections: string[] = [];
    sections.push(drawHeader("SYNC STATUS", "Negentropy Sync & Relay Information"));
    sections.push("");

    const cacheStatus = ctx.cacheAdapter ? theme.success("✓ Available (SQLite)") : theme.error("✗ Not available");

    const content = [
        `Sync Engine: ${theme.success("✓ Active (Negentropy-based)")}`,
        `Cache Adapter: ${cacheStatus}`,
        "",
    ];

    if (ctx.syncInfo.lastSync) {
        const timeSince = Math.floor(Date.now() / 1000) - ctx.syncInfo.lastSync;
        content.push(`Last Sync: ${theme.info(formatRelativeTime(timeSince))} ago`);

        if (ctx.syncInfo.duration) {
            content.push(`  Duration: ${theme.muted(`${ctx.syncInfo.duration}ms`)}`);
        }
        if (ctx.syncInfo.eventsCount) {
            content.push(`  Events:   ${theme.muted(`${ctx.syncInfo.eventsCount} events synchronized`)}`);
        }
    }

    sections.push(drawSection("SYNC INFO", content));

    const relayContent: string[] = ["Relay Status:"];
    for (const relay of ctx.ndk.pool.relays.values()) {
        const status = relay.status === 1 ? theme.success("✓ Connected") : theme.error("✗ Disconnected");
        relayContent.push(`  ${truncate(relay.url, 30)}  ${status}`);
    }

    sections.push("");
    sections.push(drawSection("RELAYS", relayContent));

    return sections.join("\n");
}

export function renderEventLog(ctx: WalletContext, limit = 20): string {
    const sections: string[] = [];
    sections.push(drawHeader("EVENT LOG", "Recent Wallet Events"));
    sections.push("");

    const events = ctx.getEventLog({ limit });

    if (events.length === 0) {
        sections.push(drawSection("", [theme.muted("No events logged yet")]));
        return sections.join("\n");
    }

    const rows: string[][] = [];

    for (const entry of events) {
        const time = formatTime(entry.timestamp);
        const kindText = `${entry.kind}`;
        const eventId = eventIdPreview(entry.eventId);
        const details = truncate(entry.details, 50);

        rows.push([theme.muted(time), theme.info(kindText), theme.muted(eventId), details]);
    }

    const table = createTable({
        head: ["Time", "Kind", "Event ID", "Details"],
        rows,
    });

    sections.push(drawSection("", [table]));

    return sections.join("\n");
}
