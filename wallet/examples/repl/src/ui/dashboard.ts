import type { WalletContext } from "../wallet-context.js";
import { drawHeader, drawSection, padRight } from "./render.js";
import { eventIdPreview, formatSats, npubPreview, theme } from "./theme.js";

export function renderDashboard(ctx: WalletContext): string {
    const sections: string[] = [];

    sections.push(drawHeader("🥜 NDK Cashu Wallet REPL", "Your Debug-Friendly Wallet"));
    sections.push("");

    sections.push(renderWalletStatus(ctx));
    sections.push("");

    if (ctx.wallet && ctx.isReady) {
        sections.push(renderBalance(ctx));
        sections.push("");
    }

    sections.push(renderQuickActions());
    sections.push("");
    sections.push(renderDebugActions());
    sections.push("");
    sections.push(renderConfigActions());
    sections.push("");

    return sections.join("\n");
}

function renderWalletStatus(ctx: WalletContext): string {
    const content: string[] = [];

    const statusIcon = ctx.isReady ? theme.ready : ctx.wallet ? theme.loading : theme.offline;
    const statusText = ctx.isReady ? "READY" : ctx.wallet ? "LOADING" : "NOT INITIALIZED";

    const userText = ctx.user ? npubPreview(ctx.user.npub) : "Not signed in";
    const relayCount = ctx.ndk.pool.relays.size;
    const warnings = ctx.wallet?.warnings.length || 0;

    content.push(
        padRight(`Status: ${statusIcon}  ${theme.highlight(statusText)}`, 40) +
            padRight(`Active User: ${theme.info(userText)}`, 40),
    );

    if (ctx.wallet) {
        const p2pk = ctx.wallet._p2pk ? eventIdPreview(ctx.wallet._p2pk) : "Not set";

        content.push(
            padRight(`P2PK:   ${theme.muted(p2pk)}`, 40) +
                padRight(`Relay Set:  ${theme.info(relayCount.toString())} relays`, 40),
        );

        const mintCount = ctx.wallet.mints.length;
        const warningColor = warnings > 0 ? theme.warning : theme.success;
        content.push(
            padRight(`Mints:  ${theme.info(mintCount.toString())} configured`, 40) +
                padRight(`Warnings:   ${warningColor(warnings.toString())}`, 40),
        );
    }

    return drawSection("WALLET STATUS", content);
}

function renderBalance(ctx: WalletContext): string {
    if (!ctx.wallet || !ctx.isReady) {
        return drawSection("BALANCE", [theme.muted("Wallet not ready")]);
    }

    const content: string[] = [];
    const balance = ctx.wallet.balance;

    if (balance) {
        content.push(`Total: ${theme.highlight(`${formatSats(balance.amount)} sats`)}`);
        content.push("");

        const mintBalances = ctx.wallet.mintBalances;
        if (Object.keys(mintBalances).length > 0) {
            content.push("By Mint:");

            for (const [mint, amount] of Object.entries(mintBalances)) {
                const mintName = new URL(mint).hostname;

                const proofs = ctx.wallet.state.getProofs({ mint });
                const availableProofs = ctx.wallet.state.getProofs({ mint, onlyAvailable: true });

                const proofText = `${proofs.length} proofs, ${availableProofs.length} available`;

                content.push(
                    `  ${padRight(theme.info(mintName), 30)} ${padRight(
                        theme.success(`${formatSats(amount)} sats`),
                        15,
                    )} ${theme.muted(`(${proofText})`)}`,
                );
            }
        }
    } else {
        content.push(theme.muted("No balance information available"));
    }

    return drawSection("BALANCE", content);
}

function renderQuickActions(): string {
    const content: string[] = [
        `${theme.highlight("[d]")} Deposit            ${theme.highlight("[s]")} Send Token         ${theme.highlight(
            "[r]",
        )} Receive Token`,
        `${theme.highlight("[p]")} Pay Invoice        ${theme.highlight("[n]")} Redeem Nutzaps     ${theme.highlight(
            "[b]",
        )} Backup Wallet`,
    ];

    return drawSection("QUICK ACTIONS", content);
}

function renderDebugActions(): string {
    const content: string[] = [
        `${theme.highlight("[state]")} View State     ${theme.highlight("[proofs]")} List Proofs   ${theme.highlight(
            "[events]",
        )} Event Log`,
        `${theme.highlight("[sync]")} Sync Status     ${theme.highlight("[mints]")} Mint Details   ${theme.highlight(
            "[relays]",
        )} Relay Status`,
    ];

    return drawSection("DEBUG & INSPECTION", content);
}

function renderConfigActions(): string {
    const content: string[] = [
        `${theme.highlight("[user]")} Change User     ${theme.highlight("[+mint]")} Add Mint       ${theme.highlight(
            "[-mint]",
        )} Remove Mint`,
        `${theme.highlight("[relay]")} Config Relays  ${theme.highlight("[restore]")} Restore      ${theme.highlight(
            "[clear]",
        )} Clear Screen`,
    ];

    return drawSection("CONFIGURATION", content);
}
