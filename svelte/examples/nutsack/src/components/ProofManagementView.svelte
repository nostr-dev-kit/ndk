<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';
  import { wallet as walletStore } from '../lib/ndk.js';
  import type { ProofEntry } from '@nostr-dev-kit/wallet';
  import { CheckStateEnum } from '@cashu/cashu-ts';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  let proofEntries = $derived(walletStore.proofEntries || []);
  let validationResults = $derived(walletStore.validationResults || new Map());
  let isValidating = $derived(walletStore.isValidating || false);
  let selectedProofs = $state<Set<string>>(new Set());
  let isDeleting = $state(false);
  let error = $state('');

  // Group proofs by mint
  let groupedProofs = $derived.by(() => {
    const groups = new Map();
    for (const entry of proofEntries) {
      const current = groups.get(entry.mint) || [];
      current.push(entry);
      groups.set(entry.mint, current);
    }
    return groups;
  });

  let mintBalances = $derived.by(() => {
    const balances = new Map();
    for (const entry of proofEntries) {
      if (entry.state === 'available') {
        balances.set(entry.mint, (balances.get(entry.mint) || 0) + entry.proof.amount);
      }
    }
    return balances;
  });

  let selectedCount = $derived(selectedProofs.size);
  let selectedAmount = $derived.by(() => {
    let total = 0;
    for (const proofC of selectedProofs) {
      const entry = proofEntries.find(e => e.proof.C === proofC);
      if (entry) total += entry.proof.amount;
    }
    return total;
  });

  async function loadProofs() {
    try {
      await walletStore.loadProofEntries();
    } catch (e: any) {
      error = e.message || 'Failed to load proofs';
    }
  }

  async function validateAll() {
    try {
      error = '';
      await walletStore.validateProofs();
    } catch (e: any) {
      error = e.message || 'Validation failed';
    }
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selectedCount} proofs (${selectedAmount} sats)?`)) return;

    isDeleting = true;
    error = '';

    try {
      const proofsToDelete = proofEntries
        .filter(e => selectedProofs.has(e.proof.C))
        .map(e => e.proof);

      await walletStore.deleteProofs(proofsToDelete);
      selectedProofs.clear();
    } catch (e: any) {
      error = e.message || 'Failed to delete proofs';
    } finally {
      isDeleting = false;
    }
  }

  function toggleSelection(proofC: string) {
    const newSet = new Set(selectedProofs);
    if (newSet.has(proofC)) {
      newSet.delete(proofC);
    } else {
      newSet.add(proofC);
    }
    selectedProofs = newSet;
  }

  function getValidationState(mint: string, proofC: string) {
    const result = validationResults.get(mint);
    if (!result) return null;
    return result.proofStates.get(proofC);
  }

  function formatMintName(url: string): string {
    try {
      const u = new URL(url);
      return u.host.replace('www.', '').replace('mint.', '');
    } catch {
      return url;
    }
  }

  $effect(() => {
    loadProofs();
  });
</script>

<div class="proof-management">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Proof Management</h2>
    <div></div>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <!-- Summary -->
  <div class="summary-card">
    <div class="summary-item">
      <span class="label">Total Proofs</span>
      <span class="value">{proofEntries.length}</span>
    </div>
    {#if selectedCount > 0}
      <div class="summary-item">
        <span class="label">Selected</span>
        <span class="value selected">{selectedCount} ({selectedAmount} sats)</span>
      </div>
    {/if}
  </div>

  <!-- Actions -->
  <div class="actions">
    <button
      class="action-btn validate"
      onclick={validateAll}
      disabled={isValidating || proofEntries.length === 0}
    >
      {isValidating ? 'Validating...' : 'Validate All'}
    </button>
    {#if selectedCount > 0}
      <button class="action-btn clear" onclick={() => selectedProofs.clear()}>
        Clear Selection
      </button>
      <button
        class="action-btn delete"
        onclick={deleteSelected}
        disabled={isDeleting}
      >
        Delete ({selectedCount})
      </button>
    {/if}
  </div>

  <!-- Proofs by Mint -->
  {#if proofEntries.length === 0}
    <div class="empty-state">
      <p>No proofs found</p>
      <p class="hint">Your wallet doesn't contain any proofs</p>
    </div>
  {:else}
    <div class="mints-list">
      {#each Array.from(groupedProofs.entries()).sort((a, b) => a[0].localeCompare(b[0])) as [mint, entries]}
        <div class="mint-section">
          <div class="mint-header">
            <h3>{formatMintName(mint)}</h3>
            <span class="mint-balance">{mintBalances.get(mint) || 0} sats</span>
          </div>

          <div class="proof-list">
            {#each entries.sort((a, b) => b.proof.amount - a.proof.amount) as entry}
              {@const validationState = getValidationState(mint, entry.proof.C)}
              {@const isSelected = selectedProofs.has(entry.proof.C)}
              {@const isSelectable = entry.state === 'available' || validationState?.state === CheckStateEnum.SPENT}

              <div class="proof-item" class:spent={validationState?.state === CheckStateEnum.SPENT}>
                <button
                  class="checkbox"
                  class:checked={isSelected}
                  class:disabled={!isSelectable}
                  onclick={() => isSelectable && toggleSelection(entry.proof.C)}
                  disabled={!isSelectable}
                >
                  {isSelected ? '☑' : '☐'}
                </button>

                <div class="proof-info">
                  <div class="proof-amount">{entry.proof.amount} sats</div>
                  <div class="proof-id">
                    {entry.proof.C.slice(0, 12)}...
                  </div>
                </div>

                <div class="proof-status">
                  {#if validationState}
                    {#if validationState.state === CheckStateEnum.UNSPENT}
                      <span class="status valid">✓ Valid</span>
                    {:else if validationState.state === CheckStateEnum.SPENT}
                      <span class="status spent">✗ Spent</span>
                    {:else}
                      <span class="status pending">⏳ Pending</span>
                    {/if}
                  {:else}
                    {#if entry.state === 'available'}
                      <span class="status available">● Available</span>
                    {:else if entry.state === 'reserved'}
                      <span class="status reserved">🔒 Reserved</span>
                    {:else}
                      <span class="status deleted">🗑️ Deleted</span>
                    {/if}
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .proof-management {
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

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    color: #f87171;
    font-size: 0.875rem;
  }

  .summary-card {
    display: flex;
    gap: 2rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .summary-item .label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .summary-item .value {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .summary-item .value.selected {
    color: rgba(249, 115, 22, 0.9);
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .action-btn.validate {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
  }

  .action-btn.validate:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.2);
  }

  .action-btn.clear {
    background: rgba(156, 163, 175, 0.1);
    border: 1px solid rgba(156, 163, 175, 0.3);
    color: #9ca3af;
  }

  .action-btn.clear:hover {
    background: rgba(156, 163, 175, 0.2);
  }

  .action-btn.delete {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
  }

  .action-btn.delete:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .empty-state p {
    margin: 0.25rem 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-state .hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .mints-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .mint-section {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .mint-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .mint-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .mint-balance {
    font-size: 0.875rem;
    color: rgba(249, 115, 22, 0.9);
    font-weight: 600;
  }

  .proof-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .proof-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    transition: all 0.2s;
  }

  .proof-item.spent {
    opacity: 0.6;
  }

  .proof-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .checkbox {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .checkbox.checked {
    background: rgba(249, 115, 22, 0.2);
    border-color: rgba(249, 115, 22, 0.5);
    color: #f97316;
  }

  .checkbox.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .proof-info {
    flex: 1;
    min-width: 0;
  }

  .proof-amount {
    font-size: 1rem;
    font-weight: 600;
    font-family: monospace;
  }

  .proof-id {
    font-size: 0.75rem;
    font-family: monospace;
    color: rgba(255, 255, 255, 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .proof-status {
    flex-shrink: 0;
  }

  .status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    white-space: nowrap;
  }

  .status.valid {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .status.spent {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .status.pending {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .status.available {
    color: #60a5fa;
    background: rgba(96, 165, 250, 0.1);
  }

  .status.reserved {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .status.deleted {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
</style>
