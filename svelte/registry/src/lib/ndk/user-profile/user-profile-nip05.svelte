<!--
  @component UserProfile.Nip05
  Displays user's NIP-05 identifier with optional verification.
  Must be used within UserProfile.Root context.

  When showVerified is true, the component actually verifies the NIP-05 by fetching from the domain
  and checking if the pubkey matches. Shows different states: verifying (⋯), verified (✓), or invalid (✗).

  Default identifiers (_@domain) always show as just the domain.

  @example
  ```svelte
  <UserProfile.Root {ndk} {pubkey}>
    <UserProfile.Nip05 />
    <UserProfile.Nip05 showVerified={false} />
  </UserProfile.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';

  // NIP-05 regex from core
  const NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w.-]+)$/;

  interface Props {
    /** Show NIP-05 identifier */
    showNip05?: boolean;

    /** Show verification checkmark */
    showVerified?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    showNip05 = true,
    showVerified = true,
    class: className = ''
  }: Props = $props();

  const context = getContext<UserProfileContext>(USER_PROFILE_CONTEXT_KEY);
  if (!context) {
    throw new Error('UserProfile.Nip05 must be used within UserProfile.Root');
  }

  const profile = $derived(context.profile);
  const ndkUser = $derived(context.ndkUser);

  const nip05 = $derived(profile?.nip05);

  // Validate nip05 format
  const isValidFormat = $derived(nip05 ? NIP05_REGEX.test(nip05) : false);

  // Parse nip05 into parts
  const nip05Parts = $derived.by(() => {
    if (!nip05) return null;
    const match = nip05.match(NIP05_REGEX);
    if (!match) return null;
    const [_, name = '_', domain] = match;
    return { name, domain };
  });

  // Format display text - always hide default username
  const displayText = $derived.by(() => {
    if (!nip05Parts) return '';
    const { name, domain } = nip05Parts;

    // Always hide default username
    if (name === '_') {
      return domain;
    }

    return `${name}@${domain}`;
  });

  // Actual NIP-05 verification state
  // true = verified, false = invalid, null = not verified/error, undefined = not checked yet
  let verificationStatus = $state<boolean | null | undefined>(undefined);
  let isVerifying = $state(false);

  // Verify NIP-05 when showVerified is true and we have the data
  $effect(() => {
    if (!showVerified || !nip05 || !ndkUser || !isValidFormat) {
      verificationStatus = undefined;
      return;
    }

    // Reset and verify
    verificationStatus = undefined;
    isVerifying = true;

    ndkUser.validateNip05(nip05).then(result => {
      verificationStatus = result;
      isVerifying = false;
    }).catch(() => {
      verificationStatus = null;
      isVerifying = false;
    });
  });
</script>

{#if showNip05 && nip05}
  <span class="user-profile-nip05 {className}">
    {displayText}
    {#if showVerified}
      {#if isVerifying}
        <span class="user-profile-nip05-verifying" title="Verifying NIP-05...">⋯</span>
      {:else if verificationStatus === true}
        <span class="user-profile-nip05-verified" title="NIP-05 verified">✓</span>
      {:else if verificationStatus === false}
        <span class="user-profile-nip05-invalid" title="NIP-05 does not match pubkey">✗</span>
      {/if}
    {/if}
  </span>
{/if}

<style>
  .user-profile-nip05 {
    color: var(--muted-foreground, #6b7280);
    font-size: 0.875rem;
  }

  .user-profile-nip05-verified {
    color: var(--success, #10b981);
    margin-left: 4px;
    font-size: 0.875em;
  }

  .user-profile-nip05-invalid {
    color: var(--destructive, #ef4444);
    margin-left: 4px;
    font-size: 0.875em;
  }

  .user-profile-nip05-verifying {
    color: var(--muted-foreground, #6b7280);
    margin-left: 4px;
    font-size: 0.875em;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
