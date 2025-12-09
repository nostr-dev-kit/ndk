<script lang="ts">
  import { ndk } from '$lib/site/ndk.svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { cn } from '$lib/registry/utils/cn.js';

  interface Props {
    show: boolean;
    onClose: () => void;
  }

  let { show = $bindable(), onClose }: Props = $props();

  let loginMode = $state<'nip07' | 'nsec'>('nip07');
  let privateKey = $state('');
  let loginError = $state('');

  async function handleNIP07Login() {
    try {
      loginError = '';
      await ndk.$sessions.login(new NDKNip07Signer());
      show = false;
    } catch (e) {
      loginError = e instanceof Error ? e.message : 'Failed to login with NIP-07';
    }
  }

  async function handlePrivateKeyLogin() {
    try {
      loginError = '';
      const signer = new NDKPrivateKeySigner(privateKey);
      await ndk.$sessions.login(signer);
      privateKey = '';
      show = false;
    } catch (e) {
      loginError = e instanceof Error ? e.message : 'Failed to login with private key';
    }
  }

  function close() {
    show = false;
    onClose();
  }
</script>

{#if show}
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    onclick={close}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        close();
      }
    }}
    role="button"
    tabindex="0"
  ></div>

  <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[51] w-[90%] max-w-[500px] bg-card border border-border rounded-lg shadow-lg" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
    <div class="p-6 border-b border-border flex justify-between items-start">
      <div>
        <h2 class="text-xl font-semibold text-foreground m-0">Login to NDK Registry</h2>
        <p class="text-sm text-muted-foreground mt-1 mb-0">Connect your Nostr identity</p>
      </div>
      <button class="p-2 border-0 bg-transparent cursor-pointer rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground" onclick={close} aria-label="Close login modal">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" ></path>
        </svg>
      </button>
    </div>

    <div class="p-6 flex flex-col gap-4">
      <div class="flex gap-1 p-1 bg-muted rounded-md">
        <button
          class={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2 border-0 bg-transparent rounded transition-all text-sm font-medium text-muted-foreground cursor-pointer", loginMode === 'nip07' && "bg-background text-foreground shadow-sm")}
          onclick={() => loginMode = 'nip07'}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" ></path>
          </svg>
          Extension
        </button>
        <button
          class={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2 border-0 bg-transparent rounded transition-all text-sm font-medium text-muted-foreground cursor-pointer", loginMode === 'nsec' && "bg-background text-foreground shadow-sm")}
          onclick={() => loginMode = 'nsec'}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" ></path>
          </svg>
          Private Key
        </button>
      </div>

      {#if loginMode === 'nip07'}
        <div class="flex flex-col gap-4">
          <div class="p-4 rounded-md flex gap-3 border border-primary/30 bg-primary/10">
            <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" ></path>
            </svg>
            <p class="text-sm m-0 text-foreground">Login using a NIP-07 compatible browser extension like <strong>Alby</strong>, <strong>nos2x</strong>, or <strong>Flamingo</strong>.</p>
          </div>
          <button class="w-full px-4 py-2 bg-primary text-primary-foreground border-0 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90" onclick={handleNIP07Login}>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" ></path>
            </svg>
            Connect Extension
          </button>
        </div>
      {:else}
        <div class="flex flex-col gap-4">
          <div class="p-4 rounded-md flex gap-3 border border-[hsl(40_100%_50%_/_0.3)] bg-[hsl(40_100%_50%_/_0.1)]">
            <svg class="w-5 h-5 shrink-0 mt-0.5 text-[hsl(40_100%_40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" ></path>
            </svg>
            <p class="text-sm m-0 text-foreground"><strong>Warning:</strong> Only enter your private key if you trust this device. Consider using an extension instead.</p>
          </div>
          <input
            type="password"
            class="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm transition-all focus:outline-none focus:border-ring focus:shadow-[0_0_0_3px_rgb(var(--ring)_/_0.2)]"
            placeholder="nsec1... or hex private key"
            bind:value={privateKey}
          />
          <button
            class="w-full px-4 py-2 bg-primary text-primary-foreground border-0 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={handlePrivateKeyLogin}
            disabled={!privateKey}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" ></path>
            </svg>
            Login with Private Key
          </button>
        </div>
      {/if}

      {#if loginError}
        <div class="p-4 rounded-md flex gap-3 border border-destructive/30 bg-destructive/10">
          <svg class="w-5 h-5 shrink-0 mt-0.5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" ></path>
          </svg>
          <p class="text-sm m-0 text-foreground">{loginError}</p>
        </div>
      {/if}
    </div>
  </div>
{/if}
