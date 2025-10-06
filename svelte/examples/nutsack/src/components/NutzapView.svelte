<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import ndk from '../lib/ndk';
  import { NDKUser as NDKUserClass } from '@nostr-dev-kit/ndk';
  import { zap } from '@nostr-dev-kit/svelte';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  let recipientInput = $state('');
  let resolvedUser = $state<NDKUser | null>(null);
  let isResolving = $state(false);
  let amount = $state('');
  let comment = $state('');
  let isSending = $state(false);
  let error = $state('');
  let success = $state(false);
  let contacts = $state<NDKUser[]>([]);
  let profileRefresh = $state(0); // Used to trigger reactivity
  let has10019 = $state<Set<string>>(new Set()); // Track which users have kind 10019

  const quickAmounts = [1000, 5000, 10000, 21000, 50000, 100000];

  const balance = $derived(wallet.balance || 0);
  const amountNum = $derived(Number(amount) || 0);
  const canSend = $derived(resolvedUser && amountNum > 0 && amountNum <= balance && !isSending);

  function formatBalance(sats: number): string {
    return new Intl.NumberFormat('en-US').format(sats);
  }

  async function resolveRecipient(input: string) {
    if (!input.trim()) {
      resolvedUser = null;
      return;
    }

    isResolving = true;
    error = '';

    try {
      const user = await ndk.fetchUser(input.trim());

      if (!user) {
        throw new Error('Could not resolve user identifier');
      }

      // Fetch user profile
      await user.fetchProfile();

      resolvedUser = user;
    } catch (e: any) {
      error = e.message || 'Failed to resolve recipient';
      resolvedUser = null;
    } finally {
      isResolving = false;
    }
  }

  async function sendNutzap() {
    if (!canSend || !resolvedUser) return;

    isSending = true;
    error = '';

    try {
      // Use the real zap function from payment tracking
      await zap(resolvedUser, amountNum, { comment: comment || undefined });

      success = true;

      // Reset after showing success
      setTimeout(() => {
        amount = '';
        comment = '';
        recipientInput = '';
        resolvedUser = null;
        success = false;
      }, 2000);
    } catch (e: any) {
      error = e.message || 'Failed to send nutzap';
    } finally {
      isSending = false;
    }
  }

  function selectContact(user: NDKUser) {
    resolvedUser = user;
    recipientInput = user.profile?.nip05 || user.npub;
  }

  // Load contacts on mount
  import { onMount } from 'svelte';

  onMount(async () => {
    // Load user's contacts
    if (ndk.sessions.current) {
      try {
        const user = new NDKUserClass({ pubkey: ndk.sessions.current.pubkey });
        user.ndk = ndk;
        const contactList = await user.follows();
        const contactArray = Array.from(contactList).slice(0, 20);

        contacts = contactArray;

        // Fetch kind 10019 events for all contacts
        const pubkeys = contactArray.map(c => c.pubkey);
        ndk.subscribe(
          { kinds: [10019], authors: pubkeys },
          {
            closeOnEose: true,
            onEvent: (event) => {
              has10019.add(event.pubkey);
              has10019 = has10019; // Force reactivity

              // Re-sort contacts to prioritize those with kind 10019
              contacts = contacts.sort((a, b) => {
                const aHas = has10019.has(a.pubkey);
                const bHas = has10019.has(b.pubkey);
                if (aHas && !bHas) return -1;
                if (!aHas && bHas) return 1;
                return 0;
              });
            }
          }
        );

        // Fetch profiles for all contacts
        contactArray.forEach(async (contact) => {
          contact.ndk = ndk;
          try {
            await contact.fetchProfile();
            // Force reactivity by updating the array
            contacts = [...contacts];
            profileRefresh++;
          } catch (e) {
            console.error(`Failed to fetch profile for ${contact.pubkey}:`, e);
          }
        });
      } catch (e) {
        console.error('Failed to load contacts:', e);
      }
    }
  });
</script>

<div class="nutzap-view">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>⚡ Nutzap</h2>
    <div></div>
  </div>

  {#if success}
    <div class="success-screen">
      <div class="success-animation">
        <div class="bolt-icon">⚡</div>
        {#if resolvedUser?.profile?.image}
          <img src={resolvedUser.profile.image} alt="Profile" class="profile-pic" />
        {:else}
          <div class="profile-placeholder">
            {resolvedUser?.profile?.name?.charAt(0) || '?'}
          </div>
        {/if}
      </div>
      <h3>Zapped!</h3>
      <p class="success-amount">{formatBalance(amountNum)} sats</p>
      <p class="success-recipient">
        to {resolvedUser?.profile?.displayName || resolvedUser?.profile?.name || 'recipient'}
      </p>
    </div>
  {:else}
    <div class="nutzap-form">
      <!-- Recipient Input -->
      <div class="form-section">
        <label for="recipient">Recipient</label>
        <input
          id="recipient"
          type="text"
          bind:value={recipientInput}
          placeholder="npub, NIP-05, or pubkey"
          onblur={() => resolveRecipient(recipientInput)}
        />
        <p class="hint">Enter npub, NIP-05 (user@domain.com), or pubkey</p>
      </div>

      <!-- Contacts List -->
      {#if contacts.length > 0 && !resolvedUser}
        <div class="contacts-section">
          <h4>Recent Contacts</h4>
          <div class="contacts-scroll">
            {#each contacts as contact (contact.pubkey)}
              {@const _ = profileRefresh}
              <button
                class="contact-item"
                class:has-cashu={has10019.has(contact.pubkey)}
                onclick={() => selectContact(contact)}
              >
                <div class="avatar-container">
                  {#if contact.profile?.image}
                    <img src={contact.profile.image} alt="" class="contact-avatar" />
                  {:else}
                    <div class="contact-avatar-placeholder">
                      {contact.profile?.name?.charAt(0).toUpperCase() || contact.pubkey.charAt(0).toUpperCase()}
                    </div>
                  {/if}
                  {#if has10019.has(contact.pubkey)}
                    <div class="cashu-badge" title="Has Cashu wallet">🥜</div>
                  {/if}
                </div>
                <div class="contact-info">
                  <div class="contact-name">
                    {contact.profile?.displayName || contact.profile?.name || contact.pubkey.slice(0, 8) + '...'}
                  </div>
                  {#if contact.profile?.nip05}
                    <div class="contact-nip05">{contact.profile.nip05}</div>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Resolved User Display -->
      {#if isResolving}
        <div class="resolving-status">
          <div class="spinner"></div>
          <p>Resolving recipient...</p>
        </div>
      {:else if resolvedUser}
        <div class="resolved-user">
          {#if resolvedUser.profile?.image}
            <img src={resolvedUser.profile.image} alt="Profile" class="user-avatar" />
          {:else}
            <div class="user-avatar-placeholder">
              {resolvedUser.profile?.name?.charAt(0) || '?'}
            </div>
          {/if}
          <div class="user-info">
            <div class="user-name">
              {resolvedUser.profile?.displayName || resolvedUser.profile?.name || 'Unknown User'}
            </div>
            {#if resolvedUser.profile?.nip05}
              <div class="user-nip05">✓ {resolvedUser.profile.nip05}</div>
            {/if}
          </div>
        </div>

        <!-- Amount Input -->
        <div class="form-section">
          <label for="amount">Amount</label>
          <div class="amount-display">
            <input
              id="amount"
              type="number"
              bind:value={amount}
              placeholder="0"
              min="1"
              max={balance}
            />
            <span class="amount-unit">sats</span>
          </div>
          <div class="balance-info">
            Available: {formatBalance(balance)} sats
          </div>

          <!-- Quick Amount Buttons -->
          <div class="quick-amounts">
            {#each quickAmounts as preset}
              <button
                class="amount-preset"
                onclick={() => amount = String(preset)}
                disabled={preset > balance}
              >
                {preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            {/each}
          </div>
        </div>

        <!-- Comment -->
        <div class="form-section">
          <label for="comment">Comment (optional)</label>
          <textarea
            id="comment"
            bind:value={comment}
            placeholder="Nice work! ⚡"
          ></textarea>
        </div>
      {/if}

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <button
        class="primary zap-button"
        onclick={sendNutzap}
        disabled={!canSend}
      >
        {#if isSending}
          <span class="spinner-inline"></span>
          Zapping...
        {:else}
          ⚡ Zap {amountNum > 0 ? formatBalance(amountNum) + ' sats' : ''}
        {/if}
      </button>
    </div>
  {/if}
</div>

<style>
  .nutzap-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .view-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
  }

  .back-button {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  h2 {
    text-align: center;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .nutzap-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .hint {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }

  .contacts-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .contacts-section h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .contacts-scroll {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .contact-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    min-width: 100px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .contact-item.has-cashu {
    border-color: rgba(249, 115, 22, 0.3);
    background: rgba(249, 115, 22, 0.05);
  }

  .contact-item:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(249, 115, 22, 0.3);
  }

  .avatar-container {
    position: relative;
  }

  .cashu-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    border: 2px solid #1a1a1a;
  }

  .contact-avatar,
  .contact-avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }

  .contact-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    font-weight: 600;
    font-size: 1.25rem;
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    text-align: center;
  }

  .contact-name {
    font-size: 0.8125rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .contact-nip05 {
    font-size: 0.6875rem;
    color: rgba(249, 115, 22, 0.8);
  }

  .resolving-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(249, 115, 22, 0.2);
    border-top-color: #f97316;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .resolved-user {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(249, 115, 22, 0.08);
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 12px;
  }

  .user-avatar,
  .user-avatar-placeholder {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .user-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    font-weight: 700;
    font-size: 1.5rem;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .user-nip05 {
    font-size: 0.875rem;
    color: rgba(249, 115, 22, 0.9);
    margin-top: 0.125rem;
  }

  .amount-display {
    position: relative;
    display: flex;
    align-items: center;
  }

  .amount-display input {
    padding-right: 60px;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .amount-unit {
    position: absolute;
    right: 1rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
    pointer-events: none;
  }

  .balance-info {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .quick-amounts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .amount-preset {
    padding: 0.5rem;
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 8px;
    color: #f97316;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .amount-preset:hover:not(:disabled) {
    background: rgba(249, 115, 22, 0.2);
    border-color: rgba(249, 115, 22, 0.4);
  }

  .amount-preset:disabled {
    opacity: 0.3;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    color: #f87171;
    font-size: 0.875rem;
  }

  .zap-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.125rem;
  }

  .spinner-inline {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .success-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 3rem 1rem;
  }

  .success-animation {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .profile-pic,
  .profile-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
  }

  .profile-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    font-weight: 700;
    font-size: 3rem;
  }

  .bolt-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    animation: zap-pulse 0.6s ease-out;
  }

  @keyframes zap-pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0;
    }
  }

  h3 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
  }

  .success-amount {
    font-size: 1.75rem;
    font-weight: 700;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .success-recipient {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
</style>
