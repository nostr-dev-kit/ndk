#!/usr/bin/env node

import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import inquirer from "inquirer";
import ora from "ora";
import { handleCommand } from "./commands/handlers.js";
import { WalletOnboarding } from "./onboarding/index.js";
import { renderDashboard } from "./ui/dashboard.js";
import { clearScreen } from "./ui/render.js";
import { theme } from "./ui/theme.js";
import { WalletContext } from "./wallet-context.js";

async function main() {
    clearScreen();

    console.log(
        gradient.pastel.multiline(
            figlet.textSync("NDK Wallet", {
                font: "Standard",
                horizontalLayout: "default",
            }),
        ),
    );

    console.log(theme.muted("  A beautiful debugging REPL for NDK Cashu Wallet\n"));

    const ctx = new WalletContext();
    let spinner: ReturnType<typeof ora> | undefined;

    try {
        // Initialize cache adapter before onboarding so NDK can query cache
        spinner = ora("Initializing cache...").start();
        await ctx.cacheAdapter.initializeAsync(ctx.ndk);
        spinner.succeed("Cache initialized");

        // Ask for private key first
        const keyAnswer = await inquirer.prompt([
            {
                type: "confirm",
                name: "useExisting",
                message: "Do you have an existing private key?",
                default: false,
            },
        ]);

        let privateKey: string | undefined;
        let mints: string[];
        let relays: string[];

        if (!keyAnswer.useExisting) {
            // User doesn't have a key - generate one and run full onboarding
            const newSigner = NDKPrivateKeySigner.generate();
            privateKey = newSigner.privateKey;

            const user = await newSigner.user();
            console.log(theme.success(`\n✓ New key generated: ${theme.info(user.npub)}\n`));

            const onboarding = new WalletOnboarding(ctx);
            const result = await onboarding.runWithoutKeySetup();

            mints = result.mints;
            relays = result.relays;
        } else {
            // User has existing key - get it and check for config
            const pkAnswer = await inquirer.prompt([
                {
                    type: "password",
                    name: "key",
                    message: "Enter your private key (nsec or hex):",
                    mask: "*",
                },
            ]);
            privateKey = pkAnswer.key;

            if (!privateKey) {
                throw new Error("Private key is required");
            }

            const signer = new NDKPrivateKeySigner(privateKey);
            ctx.ndk.signer = signer;
            await ctx.ndk.connect();

            spinner = ora("Checking for existing wallet configuration...").start();

            const user = await signer.user();

            // Fetch user's mint list (kind 10019)
            const mintListEvent = await ctx.ndk.fetchEvent({
                kinds: [10019],
                authors: [user.pubkey],
            });

            let existingMints: string[] = [];
            let existingRelays: string[] = [];

            if (mintListEvent) {
                existingMints = mintListEvent.getMatchingTags("mint").map((t) => t[1]);
                existingRelays = mintListEvent.getMatchingTags("relay").map((t) => t[1]);
            }

            if (existingMints.length > 0 || existingRelays.length > 0) {
                spinner.succeed("Found existing wallet configuration!");

                console.log(theme.info("\nExisting configuration:"));
                console.log(`  ${theme.muted("•")} Mints:  ${existingMints.length} configured`);
                console.log(`  ${theme.muted("•")} Relays: ${existingRelays.length} configured\n`);

                const useExisting = await inquirer.prompt([
                    {
                        type: "confirm",
                        name: "use",
                        message: "Use existing wallet configuration?",
                        default: true,
                    },
                ]);

                if (useExisting.use) {
                    mints = existingMints;
                    relays = existingRelays;
                } else {
                    spinner.info("Starting fresh onboarding...");
                    const onboarding = new WalletOnboarding(ctx);
                    const result = await onboarding.runWithoutKeySetup();

                    mints = result.mints;
                    relays = result.relays;
                }
            } else {
                spinner.info("No existing wallet configuration found");

                const onboarding = new WalletOnboarding(ctx);
                const result = await onboarding.runWithoutKeySetup();

                mints = result.mints;
                relays = result.relays;
                publishConfig = result.publishConfig;
            }
        }

        spinner = ora("Initializing wallet...").start();

        await ctx.initializeWithConfig(privateKey, { mints, relays });

        spinner.succeed("Wallet initialized");

        // Note: Mint list publishing (kind 10019) is now handled by the wallet during initialization

        console.log(theme.info("\nConnecting to relays..."));

        ctx.on("wallet:ready", () => {
            console.log(theme.success("✓ Wallet ready!\n"));
            console.log(renderDashboard(ctx));
            console.log();
        });

        ctx.on("wallet:balance_updated", () => {
            console.log(theme.info("\n💰 Balance updated!\n"));
        });

        ctx.on("wallet:warning", (warning) => {
            console.log(theme.warning(`\n⚠ Warning: ${warning.msg}\n`));
        });

        ctx.on("event:logged", () => {
            // Silent for now
        });

        setTimeout(() => {
            if (!ctx.isReady) {
                console.log(renderDashboard(ctx));
                console.log();
            }
        }, 2000);
    } catch (error: unknown) {
        spinner?.fail("Failed to initialize");
        const err = error as Error;
        console.error(chalk.red(err.message));
        console.error(chalk.red(err.stack || "No stack trace available"));
        process.exit(1);
    }

    const rl = readline.createInterface({ input, output });

    console.log(theme.muted('Type "help" for available commands, "exit" to quit\n'));

    let running = true;

    while (running) {
        try {
            const command = await rl.question(theme.highlight("wallet> "));

            if (command.trim()) {
                running = await handleCommand(ctx, command);
            }

            if (running) {
                console.log();
            }
        } catch (error: unknown) {
            if ((error as Error).message === "readline was closed") {
                running = false;
            } else {
                const err = error as Error;
                console.error(chalk.red(`Error: ${err.message}`));
            }
        }
    }

    console.log(theme.info("\nShutting down...\n"));
    await ctx.shutdown();
    rl.close();

    console.log(theme.success("Goodbye! 👋\n"));
    process.exit(0);
}

main().catch((error: unknown) => {
    const err = error as Error;
    console.error(chalk.red(`Fatal error: ${err.message}`));
    process.exit(1);
});
