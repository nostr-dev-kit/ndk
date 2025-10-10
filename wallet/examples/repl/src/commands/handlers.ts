import inquirer from "inquirer";
import qrcode from "qrcode-terminal";
import { renderDashboard } from "../ui/dashboard.js";
import { clearScreen } from "../ui/render.js";
import { theme } from "../ui/theme.js";
import { renderEventLog, renderProofManager, renderStateInspection, renderSyncStatus } from "../ui/views.js";
import type { WalletContext } from "../wallet-context.js";

export async function handleCommand(ctx: WalletContext, command: string): Promise<boolean> {
    const cmd = command.trim().toLowerCase();

    switch (cmd) {
        case "exit":
        case "quit":
        case "q":
            return false;

        case "clear":
        case "cls":
            clearScreen();
            console.log(renderDashboard(ctx));
            break;

        case "help":
        case "?":
            showHelp();
            break;

        case "dashboard":
        case "home":
        case "":
            console.log(renderDashboard(ctx));
            break;

        case "proofs":
            console.log(renderProofManager(ctx));
            break;

        case "state":
            console.log(renderStateInspection(ctx));
            break;

        case "sync":
            console.log(renderSyncStatus(ctx));
            break;

        case "events":
            console.log(renderEventLog(ctx));
            break;

        case "d":
        case "deposit":
            await handleDeposit(ctx);
            break;

        case "s":
        case "send":
            await handleSend(ctx);
            break;

        case "r":
        case "receive":
            await handleReceive(ctx);
            break;

        case "p":
        case "pay":
            await handlePay(ctx);
            break;

        case "balance":
        case "bal":
            showBalance(ctx);
            break;

        case "mints":
            showMints(ctx);
            break;

        case "relays":
            showRelays(ctx);
            break;

        default:
            console.log(theme.error(`Unknown command: ${command}`));
            console.log(theme.muted('Type "help" for available commands'));
    }

    return true;
}

function showHelp() {
    console.log(`\n${theme.titleGradient("Available Commands:")}\n`);
    console.log(theme.highlight("Navigation:"));
    console.log("  dashboard, home     - Show main dashboard");
    console.log("  clear, cls          - Clear screen");
    console.log("  help, ?             - Show this help");
    console.log("  exit, quit, q       - Exit the REPL\n");

    console.log(theme.highlight("Quick Actions:"));
    console.log("  d, deposit          - Deposit funds");
    console.log("  s, send             - Send token");
    console.log("  r, receive          - Receive token");
    console.log("  p, pay              - Pay Lightning invoice\n");

    console.log(theme.highlight("Debug & Inspection:"));
    console.log("  state               - View wallet state");
    console.log("  proofs              - List proofs");
    console.log("  events              - View event log");
    console.log("  sync                - Sync status");
    console.log("  balance, bal        - Show balance");
    console.log("  mints               - List mints");
    console.log("  relays              - Show relay status\n");
}

async function handleDeposit(ctx: WalletContext) {
    if (!ctx.wallet || !ctx.isReady) {
        console.log(theme.error("Wallet not ready"));
        return;
    }

    const answers = await inquirer.prompt([
        {
            type: "number",
            name: "amount",
            message: "Amount (sats):",
            validate: (input: number) => input > 0 || "Amount must be greater than 0",
        },
    ]);

    let mint: string;

    if (ctx.wallet.mints.length === 0) {
        const mintAnswer = await inquirer.prompt([
            {
                type: "input",
                name: "mint",
                message: "Enter mint URL:",
                validate: (input: string) => {
                    try {
                        new URL(input);
                        return true;
                    } catch {
                        return "Invalid URL";
                    }
                },
            },
        ]);
        mint = mintAnswer.mint;
    } else if (ctx.wallet.mints.length === 1) {
        mint = ctx.wallet.mints[0];
        console.log(theme.info(`Using mint: ${new URL(mint).hostname}`));
    } else {
        const mintChoices = ctx.wallet.mints.map((m) => ({
            name: new URL(m).hostname,
            value: m,
        }));

        mintChoices.push({ name: "Enter custom mint URL", value: "custom" });

        const mintAnswer = await inquirer.prompt([
            {
                type: "list",
                name: "mint",
                message: "Select mint:",
                choices: mintChoices,
            },
        ]);

        if (mintAnswer.mint === "custom") {
            const customMint = await inquirer.prompt([
                {
                    type: "input",
                    name: "url",
                    message: "Enter mint URL:",
                    validate: (input: string) => {
                        try {
                            new URL(input);
                            return true;
                        } catch {
                            return "Invalid URL";
                        }
                    },
                },
            ]);
            mint = customMint.url;
        } else {
            mint = mintAnswer.mint;
        }
    }

    console.log(`${theme.pending} Creating lightning invoice...\n`);

    try {
        const deposit = ctx.wallet.deposit(answers.amount, mint);

        deposit.on("quote", (quote) => {
            console.log(theme.success("✓ Invoice created!\n"));
            console.log(`Invoice: ${theme.info(quote.request)}\n`);
            qrcode.generate(quote.request, { small: true });
            console.log(`\nAmount: ${theme.highlight(`${answers.amount} sats`)}`);
            console.log(`${theme.pending} Waiting for payment...\n`);
        });

        deposit.on("success", () => {
            console.log(theme.success("\n✓ Payment received and tokens minted!"));
            console.log(theme.info(`New balance: ${ctx.wallet?.balance?.amount} sats\n`));
        });

        deposit.on("error", (error) => {
            console.log(theme.error(`\n✗ Deposit failed: ${error.message}\n`));
        });

        deposit.start();
    } catch (error: unknown) {
        const err = error as Error;
        console.log(theme.error(`Error: ${err.message}`));
    }
}

async function handleSend(ctx: WalletContext) {
    if (!ctx.wallet || !ctx.isReady) {
        console.log(theme.error("Wallet not ready"));
        return;
    }

    const answers = await inquirer.prompt([
        {
            type: "number",
            name: "amount",
            message: "Amount (sats):",
            validate: (input: number) => {
                if (input <= 0) return "Amount must be greater than 0";
                if (!ctx.wallet?.balance || input > ctx.wallet.balance.amount) {
                    return "Insufficient balance";
                }
                return true;
            },
        },
    ]);

    try {
        const result = await ctx.wallet.mintNuts([answers.amount]);

        if (result) {
            const token = result.send;
            console.log(theme.success("\n✓ Token created!\n"));
            console.log("Token (send this to recipient):");
            console.log(theme.info(JSON.stringify(token, null, 2)));
        }
    } catch (error: unknown) {
        const err = error as Error;
        console.log(theme.error(`\nError: ${err.message}`));
    }
}

async function handleReceive(ctx: WalletContext) {
    if (!ctx.wallet || !ctx.isReady) {
        console.log(theme.error("Wallet not ready"));
        return;
    }

    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "token",
            message: "Paste token:",
            validate: (input: string) => input.length > 0 || "Token cannot be empty",
        },
        {
            type: "input",
            name: "description",
            message: "Description (optional):",
        },
    ]);

    try {
        await ctx.wallet.receiveToken(answers.token, answers.description || undefined);
        console.log(theme.success("\n✓ Token received!"));
        console.log(theme.info(`New balance: ${ctx.wallet.balance?.amount} sats\n`));
    } catch (error: unknown) {
        const err = error as Error;
        console.log(theme.error(`\nError: ${err.message}`));
    }
}

async function handlePay(ctx: WalletContext) {
    if (!ctx.wallet || !ctx.isReady) {
        console.log(theme.error("Wallet not ready"));
        return;
    }

    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "invoice",
            message: "Lightning invoice:",
            validate: (input: string) => input.startsWith("lnbc") || "Invalid Lightning invoice",
        },
    ]);

    try {
        console.log(`${theme.pending} Processing payment...\n`);

        const result = await ctx.wallet.lnPay({
            pr: answers.invoice,
        });

        if (result) {
            console.log(theme.success("\n✓ Payment successful!"));
            console.log(theme.info(`New balance: ${ctx.wallet.balance?.amount} sats\n`));
        }
    } catch (error: unknown) {
        const err = error as Error;
        console.log(theme.error(`\nError: ${err.message}`));
    }
}

function showBalance(ctx: WalletContext) {
    if (!ctx.wallet) {
        console.log(theme.error("Wallet not initialized"));
        return;
    }

    console.log(`\n${theme.titleGradient("Balance")}\n`);
    console.log(`Total: ${theme.highlight(`${(ctx.wallet.balance?.amount || 0).toString()} sats`)}\n`);
}

function showMints(ctx: WalletContext) {
    if (!ctx.wallet) {
        console.log(theme.error("Wallet not initialized"));
        return;
    }

    console.log(`\n${theme.titleGradient("Configured Mints")}\n`);

    if (ctx.wallet.mints.length === 0) {
        console.log(theme.muted("No mints configured\n"));
        return;
    }

    for (const mint of ctx.wallet.mints) {
        const balance = ctx.wallet.mintBalance(mint);
        console.log(`${theme.info("•")} ${new URL(mint).hostname}`);
        console.log(`  ${theme.muted("Balance:")} ${theme.success(`${balance.toString()} sats`)}`);
        console.log(`  ${theme.muted("URL:")} ${theme.muted(mint)}\n`);
    }
}

function showRelays(ctx: WalletContext) {
    console.log(`\n${theme.titleGradient("Relay Status")}\n`);

    for (const relay of ctx.ndk.pool.relays.values()) {
        const status = relay.status === 1 ? theme.success("✓ Connected") : theme.error("✗ Disconnected");
        console.log(`${status} ${relay.url}\n`);
    }
}
