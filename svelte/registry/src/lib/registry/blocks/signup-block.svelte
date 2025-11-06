<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKPrivateKeySigner, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import { getContext } from 'svelte';
  import { cn } from '$lib/registry/utils/cn.js';
  import { createMediaUpload } from '$lib/registry/ui/media-upload/createMediaUpload.svelte.js';

  interface Props {
    ndk?: NDKSvelte;
    onSuccess?: (signer: NDKPrivateKeySigner) => void;
    class?: string;
  }

  let { ndk: ndkProp, onSuccess, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  let signer = $state<NDKPrivateKeySigner | null>(null);
  let name = $state('');
  let bio = $state('');
  let bannerUrl = $state('');
  let avatarUrl = $state('');
  let isCreating = $state(false);
  let error = $state('');

  let bannerFileInput: HTMLInputElement;
  let avatarFileInput: HTMLInputElement;
  let isUploadingBanner = $state(false);
  let isUploadingAvatar = $state(false);

  // Generate initial key and gradient
  $effect(() => {
    signer = NDKPrivateKeySigner.generate();
  });

  // Generate deterministic gradient from private key
  function hexToGradient(hex: string): string {
    const color1 = '#' + hex.substring(0, 6);
    const color2 = '#' + hex.substring(20, 26);
    const angle = parseInt(hex.substring(40, 42), 16) % 360;
    return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  }

  const bannerGradient = $derived.by(() => {
    if (!signer || bannerUrl) return '';
    const hex = signer.privateKey;
    return hexToGradient(hex!);
  });

  async function handleFileUpload(file: File, type: 'banner' | 'avatar') {
    if (!signer) return;

    const uploadState = type === 'banner' ? 'isUploadingBanner' : 'isUploadingAvatar';

    if (type === 'banner') {
      isUploadingBanner = true;
    } else {
      isUploadingAvatar = true;
    }

    try {
      const mediaUpload = createMediaUpload(ndk);
      await mediaUpload.uploadFile(file);

      if (mediaUpload.uploads.length > 0) {
        const result = mediaUpload.uploads[0];
        if (type === 'banner') {
          bannerUrl = result!.url;
        } else {
          avatarUrl = result!.url;
        }
      }
    } catch (e) {
      error = `Failed to upload ${type}: ${e instanceof Error ? e.message : 'Unknown error'}`;
    } finally {
      if (type === 'banner') {
        isUploadingBanner = false;
      } else {
        isUploadingAvatar = false;
      }
    }
  }

  function handleBannerClick() {
    if (isUploadingBanner) return;
    bannerFileInput?.click();
  }

  function handleAvatarClick() {
    if (isUploadingAvatar) return;
    avatarFileInput?.click();
  }

  function handleBannerFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleFileUpload(file, 'banner');
    }
  }

  function handleAvatarFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleFileUpload(file, 'avatar');
    }
  }

  function reshuffle() {
    if (bannerUrl || isUploadingBanner) return;
    signer = NDKPrivateKeySigner.generate();
  }

  async function createProfile() {
    if (!signer || !ndk) return;

    try {
      isCreating = true;
      error = '';

      // Create profile event (kind 0)
      const profileEvent = new NDKEvent(ndk);
      profileEvent.kind = NDKKind.Metadata;
      profileEvent.content = JSON.stringify({
        name: name || undefined,
        about: bio || undefined,
        picture: avatarUrl || undefined,
        banner: bannerUrl || undefined,
      });

      await profileEvent.sign(signer);
      await profileEvent.publish();

      onSuccess?.(signer);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to create profile';
    } finally {
      isCreating = false;
    }
  }
</script>

<div class={cn('w-full max-w-[700px] mx-auto', className)}>
  <h1 class="text-center mb-8 text-[1.75rem] font-semibold text-foreground">Create Your Nostr Profile</h1>

  <div class="bg-card border border-border rounded-xl overflow-hidden relative">
    <!-- Banner -->
    <button
      class="h-[200px] w-full relative cursor-pointer overflow-hidden flex items-center justify-center border-none p-0 disabled:cursor-not-allowed"
      style={bannerUrl ? `background-image: url(${bannerUrl}); background-size: cover; background-position: center;` : `background: ${bannerGradient}`}
      onclick={handleBannerClick}
      disabled={isUploadingBanner}
      type="button"
    >
      {#if !bannerUrl && !isUploadingBanner}
        <div class="absolute top-[15px] left-[15px] bg-white/90 backdrop-blur-[10px] px-3 py-1.5 rounded-xl text-[0.625rem] font-semibold text-foreground shadow-sm whitespace-nowrap flex items-center gap-1.5 z-[5]">
          <span>Key-based gradient</span>
          <button
            class="text-xs cursor-pointer inline-flex items-center justify-center w-4 h-4 rounded bg-muted transition-all border-none text-foreground hover:bg-primary hover:text-primary-foreground hover:rotate-180"
            onclick={(e) => {
              e.stopPropagation();
              reshuffle();
            }}
            type="button"
            title="Generate new key"
          >
            ↻
          </button>
        </div>
      {/if}
      <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity text-white text-sm font-semibold hover:opacity-100">
        {isUploadingBanner ? 'Uploading...' : 'Upload Banner Image'}
      </div>
    </button>

    <input
      bind:this={bannerFileInput}
      type="file"
      accept="image/*"
      onchange={handleBannerFileSelect}
      style="display: none"
    />

    <!-- Profile Content -->
    <div class="px-5 pb-10 relative">
      <!-- Avatar -->
      <div class="-mt-[4.6875rem] mb-[0.9375rem] pl-5">
        <button
          class="w-[150px] h-[150px] rounded-full bg-muted cursor-pointer overflow-hidden flex items-center justify-center border-[5px] border-card shadow-sm relative p-0 disabled:cursor-not-allowed"
          onclick={handleAvatarClick}
          disabled={isUploadingAvatar}
          type="button"
        >
          {#if avatarUrl}
            <img src={avatarUrl} alt="Avatar" class="w-full h-full object-cover" />
          {:else if !isUploadingAvatar}
            <div class="text-[3.5rem] text-muted-foreground">?</div>
          {/if}
          <div class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 transition-opacity text-white text-[0.8125rem] font-semibold gap-1 hover:opacity-100">
            {isUploadingAvatar ? 'Uploading...' : 'Upload'}
          </div>
        </button>
      </div>

      <input
        bind:this={avatarFileInput}
        type="file"
        accept="image/*"
        onchange={handleAvatarFileSelect}
        style="display: none"
      />

      <!-- Profile Info -->
      <div class="px-5">
        <input
          type="text"
          class="w-full border-2 border-transparent px-3 py-2 rounded-md transition-all bg-transparent font-[inherit] text-foreground text-xl font-bold mb-2 hover:bg-muted hover:border-border focus:outline-none focus:bg-background focus:border-primary"
          placeholder="Your Name"
          bind:value={name}
        />

        <textarea
          class="w-full border-2 border-transparent px-3 py-2 rounded-md transition-all bg-transparent font-[inherit] text-muted-foreground text-[0.9375rem] min-h-[80px] resize-y leading-normal mb-[0.9375rem] hover:bg-muted hover:border-border focus:outline-none focus:bg-background focus:border-primary"
          placeholder="Tell people about yourself..."
          bind:value={bio}
        ></textarea>
      </div>

      <button
        class="w-full p-4 bg-primary text-primary-foreground border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-[1.5625rem] hover:bg-primary/90 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={createProfile}
        disabled={isCreating}
      >
        {isCreating ? 'Creating Profile...' : 'Create Profile'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="mt-4 px-3 py-3 px-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
      {error}
    </div>
  {/if}

  <div class="text-center text-xs text-muted-foreground mt-[0.9375rem]">
    💡 Tip: The banner gradient is generated from your key. Click shuffle to generate a new key, or upload a custom banner image
  </div>
</div>
