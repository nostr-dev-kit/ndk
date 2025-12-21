<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner, NDKNip46Signer, nip19 } from '@nostr-dev-kit/ndk';
  import { getContext, onDestroy } from 'svelte';
  import { cn } from '../utils/cn.js';
  import QRCode from 'qrcode';

  interface Props {
    ndk?: NDKSvelte;
    onSuccess?: () => void;
    class?: string;
    forceExtensionState?: boolean | null;
    /** Relay URL for nostrconnect:// flow */
    nostrConnectRelay?: string;
    /** Optional app name for nostrconnect:// metadata */
    appName?: string;
    /** Optional app icon URL for nostrconnect:// metadata */
    appIcon?: string;
  }

  let { ndk: ndkProp, onSuccess, class: className = '', forceExtensionState = null, nostrConnectRelay = 'wss://relay.nsec.app', appName = 'NDK App', appIcon }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  let detectedExtension = $state(false);
  const hasExtension = $derived(forceExtensionState !== null ? forceExtensionState : detectedExtension);
  let credentialInput = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);

  // Bunker signer state
  let showBunkerView = $state(false);
  let bunkerInput = $state('');
  let qrCodeDataUrl = $state('');
  let nostrConnectUri = $state('');
  let nostrConnectSigner: NDKNip46Signer | null = $state(null);
  let isConnectingBunker = $state(false);

  // Detect credential type
  const credentialType = $derived.by(() => {
    const trimmed = credentialInput.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('nsec1')) return 'nsec';
    if (trimmed.startsWith('ncryptsec1')) return 'ncryptsec';
    if (trimmed.startsWith('npub1')) return 'npub';
    if (trimmed.startsWith('bunker://')) return 'bunker';
    if (trimmed.startsWith('nostrconnect://')) return 'nostrconnect';
    if (trimmed.includes('@') && trimmed.includes('.')) return 'nip05';

    return null;
  });

  const showPasswordField = $derived(credentialType === 'ncryptsec');

  $effect(() => {
    // Check for window.nostr extension
    if (typeof window !== 'undefined') {
      detectedExtension = !!window.nostr;
    }
  });

  async function handleExtensionLogin() {
    if (!ndk || !ndk.$sessions) return;

    try {
      isLoading = true;
      error = '';
      await ndk.$sessions.login(new NDKNip07Signer());
      onSuccess?.();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to login with browser extension';
    } finally {
      isLoading = false;
    }
  }

  async function handleCredentialLogin() {
    if (!ndk || !ndk.$sessions || !credentialInput.trim()) return;

    try {
      isLoading = true;
      error = '';

      switch (credentialType) {
        case 'nsec': {
          const decoded = nip19.decode(credentialInput.trim());
          if (decoded.type !== 'nsec') throw new Error('Invalid nsec format');
          const signer = new NDKPrivateKeySigner(decoded.data as string);
          await ndk.$sessions.login(signer);
          credentialInput = '';
          onSuccess?.();
          break;
        }

        case 'ncryptsec': {
          if (!password) {
            error = 'Password required for encrypted key';
            return;
          }
          const signer = await NDKPrivateKeySigner.fromNcryptsec(credentialInput.trim(), password);
          await ndk.$sessions.login(signer);
          credentialInput = '';
          password = '';
          onSuccess?.();
          break;
        }

        case 'npub': {
          const decoded = nip19.decode(credentialInput.trim());
          if (decoded.type !== 'npub') throw new Error('Invalid npub format');
          const user = ndk.getUser({ pubkey: decoded.data as string });
          await user.fetchProfile();
          ndk.activeUser = user;
          credentialInput = '';
          onSuccess?.();
          break;
        }

        case 'bunker': {
          const signer = new NDKNip46Signer(ndk, credentialInput.trim());
          await ndk.$sessions.login(signer);
          credentialInput = '';
          onSuccess?.();
          break;
        }

        case 'nip05': {
          const [name, domain] = credentialInput.trim().split('@');
          const response = await ndk.httpFetch!(`https://${domain}/.well-known/nostr.json?name=${name}`);
          if (!response.ok) throw new Error('NIP-05 address not found');
          const data = await response.json();
          const pubkey = data.names?.[name];
          if (!pubkey) throw new Error('NIP-05 address not found');
          const user = ndk.getUser({ pubkey });
          await user.fetchProfile();
          ndk.activeUser = user;
          credentialInput = '';
          onSuccess?.();
          break;
        }

        default:
          error = 'Unsupported credential format';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to login';
    } finally {
      isLoading = false;
    }
  }

  async function handleBunkerSigner() {
    if (!ndk) return;

    try {
      error = '';
      showBunkerView = true;

      // Create nostrconnect:// signer
      nostrConnectSigner = NDKNip46Signer.nostrconnect(ndk, nostrConnectRelay, undefined, {
        name: appName,
        image: appIcon,
      });

      nostrConnectUri = nostrConnectSigner.nostrConnectUri || '';

      // Generate QR code
      if (nostrConnectUri) {
        qrCodeDataUrl = await QRCode.toDataURL(nostrConnectUri, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
      }

      // Start listening for connection in background
      nostrConnectSigner.blockUntilReady().then(async (user) => {
        if (nostrConnectSigner && ndk.$sessions) {
          await ndk.$sessions.login(nostrConnectSigner);
          resetBunkerView();
          onSuccess?.();
        }
      }).catch((e) => {
        // Only show error if we're still in bunker view (not cancelled)
        if (showBunkerView) {
          error = e instanceof Error ? e.message : 'Failed to connect via nostrconnect://';
        }
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to initialize bunker connection';
    }
  }

  async function handleBunkerConnect() {
    if (!ndk || !ndk.$sessions || !bunkerInput.trim()) return;

    try {
      isConnectingBunker = true;
      error = '';

      // Stop the nostrconnect:// signer
      if (nostrConnectSigner) {
        nostrConnectSigner.stop();
        nostrConnectSigner = null;
      }

      // Connect via bunker://
      const signer = new NDKNip46Signer(ndk, bunkerInput.trim());
      await ndk.$sessions.login(signer);

      resetBunkerView();
      onSuccess?.();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to connect to bunker';
    } finally {
      isConnectingBunker = false;
    }
  }

  function handleQRClick() {
    if (nostrConnectUri) {
      window.open(nostrConnectUri, '_blank');
    }
  }

  function resetBunkerView() {
    showBunkerView = false;
    bunkerInput = '';
    qrCodeDataUrl = '';
    nostrConnectUri = '';
    if (nostrConnectSigner) {
      nostrConnectSigner.stop();
      nostrConnectSigner = null;
    }
  }

  function handleBackFromBunker() {
    resetBunkerView();
    error = '';
  }

  onDestroy(() => {
    if (nostrConnectSigner) {
      nostrConnectSigner.stop();
    }
  });
</script>

<div class={cn('w-full max-w-[480px] bg-card border border-border rounded-2xl p-8 shadow-md', className)}>
  <h2 class="text-2xl font-semibold mb-6 text-foreground">Connect to Nostr</h2>

  {#if showBunkerView}
    <!-- Bunker Signer View -->
    <div class="flex flex-col items-center gap-6">
      <button
        class="self-start flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        onclick={handleBackFromBunker}
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      <div class="text-center">
        <div class="text-[0.8125rem] font-semibold text-foreground mb-2 uppercase tracking-wider">Scan with your signer</div>
        <p class="text-xs text-muted-foreground">Scan this QR code with your nostr signer app</p>
      </div>

      {#if qrCodeDataUrl}
        <button
          onclick={handleQRClick}
          class="p-4 bg-white rounded-xl border border-border cursor-pointer hover:shadow-lg transition-shadow"
          title="Open in signer app"
        >
          <img src={qrCodeDataUrl} alt="Nostrconnect QR Code" class="w-64 h-64" />
        </button>
        <p class="text-xs text-muted-foreground">Tap to open in your signer app</p>
      {:else}
        <div class="w-64 h-64 bg-muted rounded-xl flex items-center justify-center">
          <span class="text-muted-foreground">Generating QR code...</span>
        </div>
      {/if}

      <div class="flex items-center my-2 text-muted-foreground text-xs w-full before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
        <span class="px-4 uppercase tracking-wider">or enter bunker URI</span>
      </div>

      <div class="w-full">
        <input
          type="text"
          class="w-full px-3.5 py-3.5 border-[1.5px] border-border rounded-lg text-sm font-mono bg-background text-foreground transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,24,27,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="bunker://..."
          bind:value={bunkerInput}
          disabled={isConnectingBunker}
        />
        <button
          class="w-full mt-3 px-3.5 py-3.5 bg-primary text-primary-foreground border-none rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={handleBunkerConnect}
          disabled={isConnectingBunker || !bunkerInput.trim().startsWith('bunker://')}
        >
          {isConnectingBunker ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </div>
  {:else if !hasExtension}
    <!-- State 1: No Extension Detected -->
    <div class="mb-6">
      <div class="text-[0.8125rem] font-semibold text-foreground mb-3 block uppercase tracking-wider" role="heading" aria-level="3">Enter your credentials</div>
      <div class="flex gap-2 mb-1.5">
        <input
          type="text"
          class="flex-1 px-3.5 py-3.5 border-[1.5px] border-border rounded-lg text-sm font-mono bg-background text-foreground transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,24,27,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
          bind:value={credentialInput}
          disabled={isLoading}
        />
        <button class="w-11 h-11 p-0 border-[1.5px] border-border rounded-lg bg-background cursor-pointer transition-all flex items-center justify-center flex-shrink-0 text-foreground hover:border-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed" title="Scan QR code" disabled={isLoading}>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          </svg>
        </button>
      </div>

      {#if showPasswordField}
        <div class="mt-2 mb-1.5">
          <input
            type="password"
            class="w-full px-3.5 py-3.5 border-[1.5px] border-border rounded-lg text-sm font-mono bg-background text-foreground transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,24,27,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Password for encrypted key"
            bind:value={password}
            disabled={isLoading}
          />
        </div>
      {/if}

      <p class="text-xs text-muted-foreground mt-2 leading-[1.4] mb-0">Supports nsec, ncryptsec (NIP-49), bunker://, and NIP-05</p>
      <button
        class="w-full px-3.5 py-3.5 bg-primary text-primary-foreground border-none rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 mt-3 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={handleCredentialLogin}
        disabled={isLoading || !credentialInput.trim() || (showPasswordField && !password)}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </div>

    <div class="flex items-center my-6 text-muted-foreground text-xs before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
      <span class="px-4 uppercase tracking-wider">Quick connect</span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button class="w-full px-3.5 py-3.5 border-[1.5px] border-border rounded-lg bg-background text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-foreground hover:border-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed" onclick={handleExtensionLogin} disabled={isLoading}>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        Extension
      </button>
      <button class="w-full px-3.5 py-3.5 border-[1.5px] border-border rounded-lg bg-background text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-foreground hover:border-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed" onclick={handleBunkerSigner} disabled={isLoading}>
        <div style="text-align: center; width: 100%;">
          <div>Bunker Signer</div>
          <div class="text-[0.6875rem] text-muted-foreground font-normal block mt-0.5">nostrconnect://</div>
        </div>
      </button>
    </div>
  {:else}
    <!-- State 2: Extension Detected -->
    <div class="mb-6">
      <div class="text-[0.8125rem] font-semibold text-foreground mb-3 block uppercase tracking-wider" role="heading" aria-level="3">Quick connect</div>
      <button class="w-full px-3.5 py-3.5 bg-primary text-primary-foreground border-none rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 mt-3 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed" onclick={handleExtensionLogin} disabled={isLoading}>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        {isLoading ? 'Connecting...' : 'Use Browser Extension'}
      </button>
    </div>

    <div class="flex items-center my-6 text-muted-foreground text-xs before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
      <span class="px-4 uppercase tracking-wider">Other options</span>
    </div>

    <div class="flex flex-col gap-0">
      <div class="text-[0.8125rem] font-semibold text-foreground mb-3 block uppercase tracking-wider" role="heading" aria-level="3">Enter your credentials</div>
      <div class="flex gap-2 mb-1.5">
        <input
          type="text"
          class="flex-1 px-3.5 py-3.5 border-[1.5px] border-border rounded-lg text-sm font-mono bg-background text-foreground transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,24,27,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
          bind:value={credentialInput}
          disabled={isLoading}
        />
        <button class="w-11 h-11 p-0 border-[1.5px] border-border rounded-lg bg-background cursor-pointer transition-all flex items-center justify-center flex-shrink-0 text-foreground hover:border-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed" title="Scan QR code" disabled={isLoading}>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          </svg>
        </button>
      </div>

      {#if showPasswordField}
        <div class="mt-2 mb-1.5">
          <input
            type="password"
            class="w-full px-3.5 py-3.5 border-[1.5px] border-border rounded-lg text-sm font-mono bg-background text-foreground transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,24,27,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Password for encrypted key"
            bind:value={password}
            disabled={isLoading}
          />
        </div>
      {/if}

      <p class="text-xs text-muted-foreground mt-2 leading-[1.4] mb-0">Supports nsec, ncryptsec (NIP-49), bunker://, and NIP-05</p>
      <button
        class="w-full px-3.5 py-3.5 border-[1.5px] border-border rounded-lg bg-background text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-foreground mt-3 hover:border-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={handleCredentialLogin}
        disabled={isLoading || !credentialInput.trim() || (showPasswordField && !password)}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <button class="w-full px-3.5 py-3.5 border-[1.5px] border-border rounded-lg bg-background text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-foreground mt-2 hover:border-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed" onclick={handleBunkerSigner} disabled={isLoading}>
        <div style="text-align: center; width: 100%;">
          <div>Bunker Signer</div>
          <div class="text-[0.6875rem] text-muted-foreground font-normal block mt-0.5">nostrconnect://</div>
        </div>
      </button>
    </div>
  {/if}

  {#if error}
    <div class="mt-4 py-3 px-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
      {error}
    </div>
  {/if}
</div>
