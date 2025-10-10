import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { createMintDiscoveryStore } from "@nostr-dev-kit/wallet";
import inquirer from "inquirer";
import ora from "ora";
import { theme } from "../ui/theme.js";
import type { WalletContext } from "../wallet-context.js";

export interface OnboardingResult {
    privateKey?: string;
    relays: string[];
    mints: string[];
    publishConfig: boolean;
}

export interface OnboardingResultWithoutKey {
    relays: string[];
    mints: string[];
    publishConfig: boolean;
}

const DEFAULT_RELAYS = [
    "wss://relay.damus.io",
    "wss://relay.nostr.band",
    "wss://purplepag.es",
    "wss://nos.lol",
    "wss://relay.primal.net",
];

export class WalletOnboarding {
    constructor(private ctx: WalletContext) {}

    async run(existingPrivateKey?: string): Promise<OnboardingResult> {
        console.log(theme.titleGradient("\n🚀 Wallet Onboarding\n"));

        const privateKey = existingPrivateKey ?? (await this.setupKey());
        const relays = await this.selectRelays();
        const mints = await this.selectMints();
        const publishConfig = await this.confirmPublish(relays, mints);

        return {
            privateKey,
            relays,
            mints,
            publishConfig,
        };
    }

    async runWithoutKeySetup(): Promise<OnboardingResultWithoutKey> {
        console.log(theme.titleGradient("\n🚀 Wallet Onboarding\n"));

        const relays = await this.selectRelays();
        const mints = await this.selectMints();
        const publishConfig = await this.confirmPublish(relays, mints);

        return {
            relays,
            mints,
            publishConfig,
        };
    }

    private async setupKey(): Promise<string | undefined> {
        console.log(theme.highlight("Step 1: Key Setup\n"));

        const answers = await inquirer.prompt([
            {
                type: "confirm",
                name: "useExisting",
                message: "Do you have an existing private key?",
                default: false,
            },
        ]);

        if (answers.useExisting) {
            const keyAnswer = await inquirer.prompt([
                {
                    type: "password",
                    name: "key",
                    message: "Enter your private key (nsec or hex):",
                    mask: "*",
                },
            ]);
            return keyAnswer.key;
        }

        // Generate new key
        const signer = NDKPrivateKeySigner.generate();
        const user = await signer.user();
        console.log(theme.success(`\n✓ New key generated: ${theme.info(user.npub)}\n`));

        return signer.privateKey;
    }

    private async selectRelays(): Promise<string[]> {
        console.log(theme.highlight("\nRelay Selection\n"));

        const choices = DEFAULT_RELAYS.map((relay) => ({
            name: relay,
            value: relay,
            checked: ["wss://relay.damus.io", "wss://relay.nostr.band", "wss://purplepag.es"].includes(relay),
        }));

        choices.push({
            name: theme.muted("➕ Add custom relay..."),
            value: "__custom__",
            checked: false,
        });

        const answers = await inquirer.prompt([
            {
                type: "checkbox",
                name: "relays",
                message: "Select relays for your wallet:",
                choices,
                validate: (input: string[]) => {
                    if (input.length === 0) return "Please select at least one relay";
                    return true;
                },
            },
        ]);

        if (!answers.relays || !Array.isArray(answers.relays) || answers.relays.length === 0) {
            console.log(theme.error("\n✗ No relays selected. Please try again.\n"));
            return this.selectRelays();
        }

        const relays = answers.relays.filter((r: string) => r !== "__custom__");

        // Handle custom relay
        if (answers.relays?.includes("__custom__")) {
            const customAnswer = await inquirer.prompt([
                {
                    type: "input",
                    name: "url",
                    message: "Enter custom relay URL (wss://):",
                    validate: (input: string) => {
                        if (!input.startsWith("wss://")) return "URL must start with wss://";
                        try {
                            new URL(input);
                            return true;
                        } catch {
                            return "Invalid URL";
                        }
                    },
                },
            ]);
            relays.push(customAnswer.url);
        }

        console.log(theme.success(`\n✓ Selected ${relays.length} relays\n`));
        return relays;
    }

    private async selectMints(): Promise<string[]> {
        console.log(theme.highlight("\nMint Discovery\n"));

        // Connect NDK temporarily for discovery (will reconnect with selected relays later)
        if (!this.ctx.ndk.pool.relays.size) {
            const tempRelays = ["wss://relay.damus.io", "wss://relay.nostr.band", "wss://purplepag.es"];
            for (const url of tempRelays) {
                this.ctx.ndk.pool.getRelay(url, true);
            }
        }

        const mintStore = createMintDiscoveryStore(this.ctx.ndk);
        const spinner = ora("Discovering mints from NIP-87...").start();

        // Subscribe to progress updates
        let lastUpdate = Date.now();
        const unsubscribe = mintStore.subscribe((state) => {
            const now = Date.now();
            if (now - lastUpdate > 500) {
                // Update every 500ms
                spinner.text = `Discovering mints... (${state.mints.size} found, ${state.progress.announcementsFound} announcements, ${state.progress.recommendationsFound} recommendations)`;
                lastUpdate = now;
            }
        });

        // Start discovery
        mintStore.getState().startDiscovery({
            network: "mainnet",
            timeout: 8000,
        });

        // Wait for discovery
        await new Promise((resolve) => setTimeout(resolve, 8000));
        mintStore.getState().stopDiscovery();
        unsubscribe();

        const topMints = mintStore.getState().getTopMints(15);
        spinner.succeed(`Found ${topMints.length} mints with recommendations`);

        if (topMints.length === 0) {
            console.log(theme.warning("\n⚠ No mints discovered. You can add custom mints manually.\n"));
            return this.addCustomMints();
        }

        // Build choices with mint info
        const choices = topMints.map((mint) => {
            const name = mint.name || new URL(mint.url).hostname;
            const score = `⭐ ${mint.score}`;
            const nuts = mint.nuts.length > 0 ? ` (${mint.nuts.slice(0, 3).join(", ")})` : "";

            return {
                name: `${name} ${theme.muted(score + nuts)}`,
                value: mint.url,
                short: name,
            };
        });

        choices.push({
            name: theme.muted("➕ Add custom mint URL..."),
            value: "__custom__",
            short: "Custom",
        });

        const answers = await inquirer.prompt([
            {
                type: "checkbox",
                name: "mints",
                message: "Select mints to use:",
                choices,
                validate: (input: string[]) => {
                    const filtered = input.filter((m) => m !== "__custom__");
                    if (filtered.length === 0) return "Please select at least one mint";
                    return true;
                },
            },
        ]);

        if (!answers.mints || !Array.isArray(answers.mints) || answers.mints.length === 0) {
            console.log(theme.warning("\n⚠ No mints selected. Adding custom mint...\n"));
            return this.addCustomMints();
        }

        let mints = answers.mints.filter((m: string) => m !== "__custom__");

        // Handle custom mint
        if (answers.mints?.includes("__custom__")) {
            const customMints = await this.addCustomMints();
            mints = [...mints, ...customMints];
        }

        console.log(theme.success(`\n✓ Selected ${mints.length} mints\n`));
        return mints;
    }

    private async addCustomMints(): Promise<string[]> {
        const mints: string[] = [];

        while (true) {
            const answer = await inquirer.prompt([
                {
                    type: "input",
                    name: "url",
                    message: "Enter mint URL (or press Enter to finish):",
                    validate: (input: string) => {
                        if (!input) return true; // Allow empty to finish
                        try {
                            new URL(input);
                            return true;
                        } catch {
                            return "Invalid URL";
                        }
                    },
                },
            ]);

            if (!answer.url) break;
            mints.push(answer.url);
        }

        return mints;
    }

    private async confirmPublish(relays: string[], mints: string[]): Promise<boolean> {
        console.log(theme.highlight("\nPublish Configuration\n"));

        console.log("Your configuration:");
        console.log(`  ${theme.info("•")} Relays: ${theme.muted(relays.length.toString())} selected`);
        console.log(`  ${theme.info("•")} Mints:  ${theme.muted(mints.length.toString())} selected\n`);

        const answer = await inquirer.prompt([
            {
                type: "confirm",
                name: "publish",
                message: "Publish your wallet configuration (kind 10019)?\n  This helps others send you nutzaps.",
                default: true,
            },
        ]);

        return answer.publish;
    }
}
