<script lang="ts">
    import { loginWithPrivateKey, loginWithNip07, generatePrivateKey } from "../lib/ndk";
    import type { NDKSvelte } from "@nostr-dev-kit/svelte";
    import type { NDKMessenger } from "@nostr-dev-kit/messages";
    import IcqLogo from "./IcqLogo.svelte";

    let {
        isLoading = $bindable(false),
        onLogin
    } = $props<{
        isLoading: boolean;
        onLogin: (data: { ndk: NDKSvelte; messenger: NDKMessenger }) => void;
    }>();

    let privateKey = $state("");
    let error = $state("");
    let hasNip07 = $state(true);

    async function handleLogin() {
        if (!privateKey.trim()) {
            error = "Please enter a private key";
            return;
        }

        error = "";
        isLoading = true;

        try {
            const { ndk, messenger } = await loginWithPrivateKey(privateKey);
            onLogin({ ndk, messenger });
        } catch (e) {
            error = "Failed to connect. Please check your key and try again.";
            console.error(e);
        } finally {
            isLoading = false;
        }
    }

    async function handleNip07Login() {
        if (!hasNip07) {
            error = "No NIP-07 extension found. Please install nos2x, Alby, or another Nostr extension.";
            return;
        }

        error = "";
        isLoading = true;

        try {
            const { ndk, messenger } = await loginWithNip07();
            onLogin({ ndk, messenger });
        } catch (e) {
            error = "Failed to connect with extension. Please check your extension and try again.";
            console.error(e);
        } finally {
            isLoading = false;
        }
    }

    function handleGenerateKey() {
        privateKey = generatePrivateKey();
    }
</script>

<div class="icq-window">
    <div class="icq-titlebar">
        <span class="icq-titlebar-text"><IcqLogo size={14} /> ICQ - Login</span>
        <div class="icq-titlebar-buttons">
            <button class="icq-titlebar-button">_</button>
            <button class="icq-titlebar-button">□</button>
            <button class="icq-titlebar-button">×</button>
        </div>
    </div>

    <div class="icq-login">
        <div class="icq-logo"><IcqLogo size={48} /> ICQ</div>
        <p style="margin-bottom: 20px; text-align: center; color: #666;">
            Nostr Messenger
        </p>

        <div class="icq-login-form">
            <div class="icq-input-group">
                <label class="icq-label" for="privateKey">Private Key (hex):</label>
                <input
                    id="privateKey"
                    type="password"
                    class="icq-input"
                    bind:value={privateKey}
                    onkeydown={(e) => e.key === 'Enter' && handleLogin()}
                    disabled={isLoading}
                    placeholder="Enter your private key"
                />
            </div>

            {#if error}
                <p style="color: red; margin-bottom: 12px; font-size: 10px;">{error}</p>
            {/if}

            <button
                class="icq-button"
                onclick={handleLogin}
                disabled={isLoading}
                style="margin-bottom: 8px;"
            >
                {#if isLoading}
                    <div class="icq-loading">
                        <div class="icq-spinner"></div>
                        Connecting...
                    </div>
                {:else}
                    Login
                {/if}
            </button>

            <button
                class="icq-button"
                onclick={handleGenerateKey}
                disabled={isLoading}
                style="margin-bottom: 8px;"
            >
                Generate New Key
            </button>

            <div style="text-align: center; margin: 12px 0; color: #999; font-size: 11px;">
                OR
            </div>

            <button
                class="icq-button"
                onclick={handleNip07Login}
                disabled={isLoading || !hasNip07}
                style="background: {hasNip07 ? '#6B46C1' : '#999'};"
            >
                {#if isLoading}
                    <div class="icq-loading">
                        <div class="icq-spinner"></div>
                        Connecting...
                    </div>
                {:else}
                    Login with Browser Extension
                {/if}
            </button>

            {#if !hasNip07}
                <p style="color: #999; margin-top: 8px; font-size: 10px; text-align: center;">
                    No NIP-07 extension detected
                </p>
            {/if}
        </div>
    </div>
</div>
