# NDK-Svelte5 Payment Tracking System
## A Beautiful, Runes-First Architecture

> *"Code that reads like poetry, reactivity that feels like magic"*

## Philosophy

This payment tracking system embraces **Svelte 5's reactive primitives** to create an ergonomic, beautiful API for managing all wallet activity. Built with runes, designed for joy.

### Core Principles

1. **Runes-First**: Everything reactive uses `$state`, `$derived`, `$effect`
2. **Zero Ceremony**: Beautiful APIs that require minimal boilerplate
3. **Type-Safe Magic**: Full TypeScript inference everywhere
4. **Reactive Classes**: For complex state with methods
5. **Global Stores**: For shared payment state
6. **Subscription Streams**: For real-time payment events
7. **Automatic Matching**: Pending → confirmed transitions happen automatically

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Components use:                                             │
│  • payments (global store)                                   │
│  • useTransactions() (reactive rune class)                   │
│  • useZap() (action helper)                                  │
│  • ReactiveTransaction (event wrapper)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Reactive Store Layer                        │
├─────────────────────────────────────────────────────────────┤
│  PaymentStore (singleton)                                    │
│  • transactions = $state<Transaction[]>([])                  │
│  • pending = $state<PendingPayment[]>([])                   │
│  • history = $derived(() => merge(transactions, pending))    │
│  • byTarget = $derived(() => groupByTarget(history))         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Event Stream Layer                         │
├─────────────────────────────────────────────────────────────┤
│  EventSubscription<T> for each kind:                         │
│  • kind:7376 (spending history)                              │
│  • kind:9321 (nutzaps)                                       │
│  • kind:9735 (zap receipts)                                  │
│  Auto-publishes to PaymentStore on events                    │
└─────────────────────────────────────────────────────────────┘
```

## Core Data Model

### Transaction Type System

```typescript
// src/lib/payments/types.ts

export type TransactionDirection = 'in' | 'out';
export type TransactionStatus = 'pending' | 'complete' | 'confirmed' | 'failed';

export type TransactionType =
  | 'zap_sent'           // Outgoing lightning zap
  | 'zap_received'       // Incoming lightning zap
  | 'nutzap_sent'        // Outgoing nutzap
  | 'nutzap_received'    // Incoming nutzap
  | 'token_created'      // Cashu token creation
  | 'token_destroyed'    // Cashu token destruction
  | 'deposit'            // Cashu mint deposit
  | 'withdrawal';        // Cashu withdrawal

/**
 * Unified transaction - the heart of the system
 */
export interface Transaction {
  // Identity
  id: string;              // Internal ID (pending) or event.id (confirmed)
  type: TransactionType;
  direction: TransactionDirection;
  status: TransactionStatus;

  // Core data
  amount: number;
  unit: string;
  timestamp: number;

  // Zap-specific
  target?: NDKUser | NDKEvent;
  targetId?: string;
  targetType?: 'user' | 'event';
  recipient?: string;
  sender?: string;
  comment?: string;

  // Cashu-specific (from kind:7376)
  createdTokens?: string[];    // Event IDs of created tokens
  destroyedTokens?: string[];  // Event IDs of destroyed tokens
  redeemedNutzap?: string;     // Nutzap event ID

  // Metadata
  event?: NDKEvent;            // The receipt event
  error?: string;              // Error message if failed
}

/**
 * Pending payment (pre-confirmation)
 */
export interface PendingPayment {
  internalId: string;
  targetId: string;
  targetType: 'user' | 'event';
  target?: NDKUser | NDKEvent;
  recipient: string;
  sender: string;
  amount: number;
  unit: string;
  status: 'pending' | 'delayed' | 'failed';
  comment?: string;
  timestamp: number;
  zapper?: NDKZapper;
  error?: string;
}
```

## Global Payment Store

### Reactive Singleton Store

```typescript
// src/lib/stores/payments.svelte.ts

import type NDK from '@nostr-dev-kit/ndk';
import { NDKKind, type NDKEvent, type NDKZapper } from '@nostr-dev-kit/ndk';
import type { Transaction, PendingPayment } from '../payments/types.js';
import { parseSpendingHistory, parseZapReceipt, parseNutzap } from '../payments/parsers.js';
import { mergeTransactions } from '../payments/merge.js';

/**
 * Global payment store - manages all transaction state
 *
 * Uses Svelte 5 runes for fine-grained reactivity
 */
class PaymentStore {
  private ndk = $state<NDK | undefined>(undefined);
  private currentUser = $state<string | undefined>(undefined);

  // Raw event storage (by event ID)
  private spendingHistory = $state(new Map<string, NDKEvent>());
  private zapReceipts = $state(new Map<string, NDKEvent>());
  private nutzaps = $state(new Map<string, NDKEvent>());

  // Pending payments (by internal ID)
  private pendingMap = $state(new Map<string, PendingPayment>());

  /**
   * All pending payments (reactive array)
   */
  pending = $derived(Array.from(this.pendingMap.values()));

  /**
   * All confirmed transactions (merged from all sources)
   */
  transactions = $derived.by(() => {
    if (!this.currentUser) return [];

    return mergeTransactions(
      this.spendingHistory,
      this.zapReceipts,
      this.nutzaps,
      this.pendingMap,
      this.currentUser
    );
  });

  /**
   * Complete history (confirmed + pending)
   */
  history = $derived([...this.transactions, ...this.pending]
    .sort((a, b) => b.timestamp - a.timestamp));

  /**
   * Transactions grouped by target
   */
  byTarget = $derived.by(() => {
    const map = new Map<string, Transaction[]>();

    for (const tx of this.history) {
      if (!tx.targetId) continue;
      const existing = map.get(tx.targetId) || [];
      existing.push(tx);
      map.set(tx.targetId, existing);
    }

    return map;
  });

  /**
   * Aggregate amounts by target
   */
  amountsByTarget = $derived.by(() => {
    const map = new Map<string, number>();

    for (const [targetId, txs] of this.byTarget) {
      const total = txs
        .filter(tx => tx.status === 'confirmed')
        .reduce((sum, tx) => sum + tx.amount, 0);
      map.set(targetId, total);
    }

    return map;
  });

  /**
   * Zapped targets by current user
   */
  zappedByUser = $derived.by(() => {
    const set = new Set<string>();

    for (const tx of this.history) {
      if (tx.sender === this.currentUser &&
          tx.targetId &&
          (tx.status === 'confirmed' || tx.status === 'pending')) {
        set.add(tx.targetId);
      }
    }

    return set;
  });

  /**
   * Initialize the store
   */
  init(ndk: NDK, pubkey?: string) {
    this.ndk = ndk;
    this.currentUser = pubkey;
  }

  /**
   * Set current user (updates derived state)
   */
  setUser(pubkey: string) {
    this.currentUser = pubkey;
  }

  /**
   * Add a pending payment (before zap execution)
   */
  addPending(zapper: NDKZapper, sender: string): PendingPayment[] {
    const splits = zapper.getZapSplits();
    const { id: targetId, type: targetType } = getZapperTarget(zapper);
    const pendingPayments: PendingPayment[] = [];

    for (const split of splits) {
      const payment: PendingPayment = {
        internalId: randomId(),
        targetId,
        targetType,
        target: zapper.target,
        recipient: split.pubkey,
        sender,
        amount: split.amount,
        unit: 'sat',
        status: 'pending',
        comment: zapper.comment,
        timestamp: Math.floor(Date.now() / 1000),
        zapper,
      };

      this.pendingMap.set(payment.internalId, payment);
      pendingPayments.push(payment);
    }

    // Hook into zapper lifecycle
    zapper.on('complete', (results) => {
      for (const [split, result] of results.entries()) {
        const payment = pendingPayments.find(p => p.recipient === split.pubkey);
        if (!payment) continue;

        if (result instanceof Error) {
          payment.status = 'failed';
          payment.error = result.message;
        } else {
          payment.status = 'complete' as 'pending';
        }
      }
    });

    return pendingPayments;
  }

  /**
   * Update pending payment status
   */
  updatePending(id: string, status: 'complete' | 'failed', event?: NDKEvent) {
    const payment = this.pendingMap.get(id);
    if (!payment) return;

    if (status === 'complete' && event) {
      // Remove from pending (will show as confirmed transaction)
      this.pendingMap.delete(id);
    } else {
      payment.status = status as 'pending';
    }
  }

  /**
   * Add spending history event (kind:7376)
   */
  addSpendingHistory(event: NDKEvent) {
    this.spendingHistory.set(event.id, event);
    this.matchToPending(event);
  }

  /**
   * Add zap receipt (kind:9735)
   */
  addZapReceipt(event: NDKEvent) {
    this.zapReceipts.set(event.id, event);
    this.matchToPending(event);
  }

  /**
   * Add nutzap (kind:9321)
   */
  addNutzap(event: NDKEvent) {
    this.nutzaps.set(event.id, event);
    this.matchToPending(event);
  }

  /**
   * Try to match event to pending payment
   */
  private matchToPending(event: NDKEvent) {
    const recipient = event.tagValue('p');
    if (!recipient) return;

    for (const [id, payment] of this.pendingMap) {
      if (payment.recipient === recipient &&
          Math.abs(event.created_at! - payment.timestamp) < 120) {
        this.updatePending(id, 'complete', event);
        return;
      }
    }
  }

  /**
   * Clear all state
   */
  clear() {
    this.spendingHistory.clear();
    this.zapReceipts.clear();
    this.nutzaps.clear();
    this.pendingMap.clear();
  }

  /**
   * Get zap amount for a target
   */
  getZapAmount(target: NDKUser | NDKEvent): number {
    const id = targetToId(target);
    return this.amountsByTarget.get(id) ?? 0;
  }

  /**
   * Check if user has zapped a target
   */
  isZapped(target: NDKUser | NDKEvent): boolean {
    const id = targetToId(target);
    return this.zappedByUser.has(id);
  }
}

// Singleton instance
export const payments = new PaymentStore();

// Helper functions
function randomId() {
  return Math.random().toString(36).substring(2, 15);
}

function targetToId(target: NDKUser | NDKEvent): string {
  if (target instanceof NDKUser) return target.pubkey;
  return target.tagId();
}

function getZapperTarget(zapper: NDKZapper): { id: string; type: 'user' | 'event' } {
  const { target } = zapper;
  if (target instanceof NDKUser) return { id: target.pubkey, type: 'user' };
  return { id: target.tagId(), type: 'event' };
}
```

## Reactive Transaction Subscriptions

### Auto-monitoring Payment Events

```typescript
// src/lib/payments/monitor.svelte.ts

import type NDK from '@nostr-dev-kit/ndk';
import { NDKKind } from '@nostr-dev-kit/ndk';
import { payments } from '../stores/payments.svelte.js';

/**
 * Payment monitor - subscribes to all payment events
 *
 * Usage in component:
 * ```svelte
 * <script>
 *   const monitor = new PaymentMonitor(ndk, pubkey);
 *   $effect(() => monitor.start());
 * </script>
 * ```
 */
export class PaymentMonitor {
  private subscriptions = new Map<string, any>();
  private _started = $state(false);

  get started() {
    return this._started;
  }

  constructor(
    private ndk: NDK,
    private pubkey: string
  ) {}

  /**
   * Start monitoring all payment events
   */
  start() {
    if (this._started) return;
    this._started = true;

    // Subscribe to spending history (kind:7376)
    const historySub = this.ndk.$subscribe(
      [{ kinds: [7376], authors: [this.pubkey] }],
      { groupable: false }
    );
    historySub.on('event', (e) => payments.addSpendingHistory(e));
    this.subscriptions.set('history', historySub);

    // Subscribe to received nutzaps (kind:9321)
    const nutzapSub = this.ndk.$subscribe(
      [{ kinds: [9321], '#p': [this.pubkey] }],
      { groupable: false }
    );
    nutzapSub.on('event', (e) => payments.addNutzap(e));
    this.subscriptions.set('nutzaps', nutzapSub);

    // Subscribe to zap receipts (kind:9735)
    const zapSub = this.ndk.$subscribe(
      [{ kinds: [9735], '#p': [this.pubkey] }],
      { groupable: false }
    );
    zapSub.on('event', (e) => payments.addZapReceipt(e));
    this.subscriptions.set('zaps', zapSub);
  }

  /**
   * Stop monitoring
   */
  stop() {
    for (const sub of this.subscriptions.values()) {
      sub.stop();
    }
    this.subscriptions.clear();
    this._started = false;
  }
}
```

## Component-Level Reactive Runes

### Ergonomic Component APIs

```typescript
// src/lib/payments/runes.svelte.ts

import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
import { payments } from '../stores/payments.svelte.js';
import type { Transaction } from './types.js';

/**
 * Get zap amount for a target (reactive)
 *
 * Usage:
 * ```svelte
 * <script>
 *   const amount = useZapAmount(event);
 * </script>
 * <span>{amount} sats</span>
 * ```
 */
export function useZapAmount(target: NDKUser | NDKEvent) {
  return $derived(payments.getZapAmount(target));
}

/**
 * Check if user has zapped a target (reactive)
 */
export function useIsZapped(target: NDKUser | NDKEvent) {
  return $derived(payments.isZapped(target));
}

/**
 * Get all transactions for a target (reactive)
 */
export function useTargetTransactions(target: NDKUser | NDKEvent) {
  const id = targetToId(target);
  return $derived(payments.byTarget.get(id) ?? []);
}

/**
 * Get pending payments (reactive)
 */
export function usePendingPayments() {
  return $derived(payments.pending);
}

/**
 * Get transaction history (reactive)
 */
export function useTransactions(opts?: {
  direction?: 'in' | 'out';
  type?: string;
  limit?: number;
}) {
  return $derived.by(() => {
    let txs = payments.history;

    if (opts?.direction) {
      txs = txs.filter(tx => tx.direction === opts.direction);
    }
    if (opts?.type) {
      txs = txs.filter(tx => tx.type === opts.type);
    }
    if (opts?.limit) {
      txs = txs.slice(0, opts.limit);
    }

    return txs;
  });
}

/**
 * Zap action (returns Promise)
 */
export async function zap(
  target: NDKEvent | NDKUser,
  amount: number,
  opts?: { comment?: string; delay?: number }
) {
  const { wallet } = await import('../stores/wallet.svelte.js');
  const { sessions } = await import('../stores/sessions.svelte.js');

  if (!wallet.wallet) throw new Error('No wallet connected');
  if (!sessions.current) throw new Error('No active session');

  const { NDKZapper } = await import('@nostr-dev-kit/ndk');

  const zapper = new NDKZapper(target, amount, 'msat', {
    comment: opts?.comment,
  });

  // Auto-track
  payments.addPending(zapper, sessions.current.pubkey);

  // Execute with optional delay
  if (opts?.delay) {
    return new Promise((resolve) => {
      setTimeout(() => {
        zapper.zap().then(resolve);
      }, opts.delay);
    });
  }

  return zapper.zap();
}

function targetToId(target: NDKUser | NDKEvent): string {
  if (target instanceof NDKUser) return target.pubkey;
  return target.tagId();
}
```

## Reactive Transaction Class

### Rich Transaction Object

```typescript
// src/lib/payments/reactive-transaction.svelte.ts

import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { Transaction } from './types.js';

/**
 * Reactive transaction wrapper
 *
 * Extends base transaction with reactive computed properties
 */
export class ReactiveTransaction {
  private _tx = $state<Transaction>();

  // Reactive getters
  get id() { return this._tx?.id; }
  get type() { return this._tx?.type; }
  get amount() { return this._tx?.amount ?? 0; }
  get timestamp() { return this._tx?.timestamp ?? 0; }
  get status() { return this._tx?.status; }
  get direction() { return this._tx?.direction; }
  get comment() { return this._tx?.comment; }
  get sender() { return this._tx?.sender; }
  get recipient() { return this._tx?.recipient; }
  get error() { return this._tx?.error; }

  // Computed properties
  get isPending() {
    return $derived(this.status === 'pending');
  }

  get isConfirmed() {
    return $derived(this.status === 'confirmed');
  }

  get isFailed() {
    return $derived(this.status === 'failed');
  }

  get isIncoming() {
    return $derived(this.direction === 'in');
  }

  get isOutgoing() {
    return $derived(this.direction === 'out');
  }

  get formattedAmount() {
    return $derived.by(() => {
      const sign = this.isOutgoing ? '-' : '+';
      return `${sign}${this.amount.toLocaleString()} sats`;
    });
  }

  get relativeTime() {
    return $derived.by(() => {
      const now = Date.now() / 1000;
      const diff = now - this.timestamp;

      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    });
  }

  constructor(tx: Transaction) {
    this._tx = tx;
  }

  static from(tx: Transaction): ReactiveTransaction {
    return new ReactiveTransaction(tx);
  }
}
```

## Beautiful Component Examples

### Transaction List Component

```svelte
<!-- src/lib/components/TransactionList.svelte -->
<script lang="ts">
  import { useTransactions } from '../payments/runes.svelte.js';
  import { ReactiveTransaction } from '../payments/reactive-transaction.svelte.js';

  interface Props {
    limit?: number;
    direction?: 'in' | 'out';
  }

  let { limit, direction }: Props = $props();

  // Reactive transaction list
  const transactions = useTransactions({ limit, direction });

  // Wrap in reactive class
  const reactiveTxs = $derived(transactions.map(tx => ReactiveTransaction.from(tx)));
</script>

<div class="transaction-list">
  {#if reactiveTxs.length === 0}
    <div class="empty">
      <span class="icon">💸</span>
      <p>No transactions yet</p>
    </div>
  {:else}
    {#each reactiveTxs as tx (tx.id)}
      <div class="tx-item" class:pending={tx.isPending} class:failed={tx.isFailed}>
        <div class="tx-icon" class:incoming={tx.isIncoming} class:outgoing={tx.isOutgoing}>
          {tx.isIncoming ? '↓' : '↑'}
        </div>

        <div class="tx-info">
          <div class="tx-type">
            {tx.isIncoming ? 'Received' : 'Sent'}
            {#if tx.comment}
              <span class="comment">· {tx.comment}</span>
            {/if}
          </div>
          <div class="tx-time">{tx.relativeTime}</div>
        </div>

        <div class="tx-amount" class:incoming={tx.isIncoming} class:outgoing={tx.isOutgoing}>
          {tx.formattedAmount}
        </div>

        {#if tx.isPending}
          <div class="tx-status">⏳</div>
        {/if}
        {#if tx.isFailed}
          <div class="tx-status">❌</div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .transaction-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tx-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .tx-item.pending {
    opacity: 0.7;
  }

  .tx-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .tx-icon.incoming {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .tx-icon.outgoing {
    background: rgba(249, 115, 22, 0.2);
    color: #f97316;
  }

  .tx-amount.incoming {
    color: #10b981;
  }

  .tx-amount.outgoing {
    color: #f97316;
  }
</style>
```

### Zap Button Component

```svelte
<!-- src/lib/components/ZapButton.svelte -->
<script lang="ts">
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import { useZapAmount, useIsZapped, zap } from '../payments/runes.svelte.js';

  interface Props {
    target: NDKEvent | NDKUser;
    amount?: number;
    comment?: string;
  }

  let { target, amount = 21, comment }: Props = $props();

  // Reactive state
  const zapAmount = useZapAmount(target);
  const isZapped = useIsZapped(target);
  let zapping = $state(false);

  async function handleZap() {
    zapping = true;
    try {
      await zap(target, amount, { comment });
    } catch (error) {
      console.error('Zap failed:', error);
    } finally {
      zapping = false;
    }
  }
</script>

<button
  onclick={handleZap}
  disabled={zapping || isZapped}
  class="zap-button"
  class:zapped={isZapped}
>
  {#if zapping}
    ⏳ Zapping...
  {:else if isZapped}
    ⚡ Zapped ({zapAmount})
  {:else}
    ⚡ Zap {amount}
  {/if}
</button>

<style>
  .zap-button {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .zap-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
  }

  .zap-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .zap-button.zapped {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }
</style>
```

### Payment Monitor Component

```svelte
<!-- src/lib/components/PaymentMonitor.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PaymentMonitor } from '../payments/monitor.svelte.js';
  import { sessions } from '../stores/sessions.svelte.js';

  const ndk = $state.raw(/* get from context */);
  let monitor: PaymentMonitor | undefined;

  $effect(() => {
    if (sessions.current?.pubkey && ndk) {
      monitor = new PaymentMonitor(ndk, sessions.current.pubkey);
      monitor.start();
    }

    return () => {
      monitor?.stop();
    };
  });
</script>

<!-- Invisible monitoring component - just mount it -->
```

## Complete App Integration

### App.svelte Setup

```svelte
<!-- examples/wallet-app/src/App.svelte -->
<script lang="ts">
  import { ndk } from './lib/ndk.js';
  import { payments } from '@nostr-dev-kit/svelte/stores';
  import { PaymentMonitor } from '@nostr-dev-kit/svelte/payments';
  import { sessions } from '@nostr-dev-kit/svelte/stores';

  import TransactionList from './components/TransactionList.svelte';
  import ZapButton from './components/ZapButton.svelte';

  // Initialize payment store
  $effect(() => {
    if (sessions.current) {
      payments.init(ndk, sessions.current.pubkey);
    }
  });

  // Auto-monitor payments
  let monitor: PaymentMonitor | undefined;
  $effect(() => {
    if (sessions.current) {
      monitor = new PaymentMonitor(ndk, sessions.current.pubkey);
      monitor.start();
    }

    return () => monitor?.stop();
  });
</script>

<main>
  <h1>My Wallet</h1>
  <TransactionList limit={50} />
</main>
```

### Usage in Feed

```svelte
<!-- Post.svelte -->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { useZapAmount, useIsZapped } from '@nostr-dev-kit/svelte/payments';
  import ZapButton from './ZapButton.svelte';

  interface Props {
    event: NDKEvent;
  }

  let { event }: Props = $props();

  // Reactive zap state
  const zapAmount = useZapAmount(event);
  const isZapped = useIsZapped(event);
</script>

<article>
  <p>{event.content}</p>

  <footer>
    <span class="zap-count">{zapAmount} sats</span>
    <ZapButton {event} amount={21} />
  </footer>
</article>
```

## File Structure

```
src/lib/payments/
├── types.ts                      # Core types
├── parsers.ts                    # Event parsers
├── merge.ts                      # Transaction merging
├── monitor.svelte.ts             # Payment monitor class
├── reactive-transaction.svelte.ts # Reactive transaction wrapper
└── runes.svelte.ts               # Component runes (useZapAmount, etc.)

src/lib/stores/
└── payments.svelte.ts            # Global payment store

src/lib/components/
├── TransactionList.svelte        # Transaction list component
├── ZapButton.svelte              # Zap button component
└── PaymentMonitor.svelte         # Invisible monitor component
```

## API Summary

### Global Store

```typescript
import { payments } from '@nostr-dev-kit/svelte/stores';

// Reactive state (all $derived)
payments.transactions    // All confirmed transactions
payments.pending         // All pending payments
payments.history         // Combined (sorted)
payments.byTarget        // Grouped by target
payments.amountsByTarget // Aggregated amounts
payments.zappedByUser    // Zapped target IDs

// Methods
payments.init(ndk, pubkey)
payments.addPending(zapper, sender)
payments.getZapAmount(target)
payments.isZapped(target)
```

### Component Runes

```typescript
import {
  useZapAmount,
  useIsZapped,
  useTransactions,
  usePendingPayments,
  zap
} from '@nostr-dev-kit/svelte/payments';

// In component
const amount = useZapAmount(event);       // Reactive number
const isZapped = useIsZapped(event);      // Reactive boolean
const txs = useTransactions({ limit: 50 }); // Reactive array
const pending = usePendingPayments();     // Reactive array

// Actions
await zap(target, 21, { comment: 'GM!' });
```

### Monitoring

```typescript
import { PaymentMonitor } from '@nostr-dev-kit/svelte/payments';

const monitor = new PaymentMonitor(ndk, pubkey);
monitor.start();
monitor.stop();
```

## Why This Design is Gorgeous

### 1. **Runes-First Reactivity**
```svelte
const amount = useZapAmount(event);  // Just works, reactive, beautiful
```

### 2. **Zero Ceremony**
```svelte
<!-- No stores, no subscriptions, just pure reactivity -->
{zapAmount} sats
```

### 3. **Automatic Everything**
- Pending → confirmed transitions happen automatically
- Events match to pending payments automatically
- Reactive updates happen automatically

### 4. **Type-Safe Magic**
```typescript
const txs = useTransactions();  // Type: Transaction[]
```

### 5. **Composable Primitives**
```svelte
const received = useTransactions({ direction: 'in' });
const recentReceived = $derived(received.slice(0, 10));
```

### 6. **Beautiful DX**
```svelte
<ZapButton {event} amount={21} />  <!-- That's it -->
```

## Implementation Checklist

- [ ] Create payment types and interfaces
- [ ] Implement event parsers (kind:7376, 9321, 9735)
- [ ] Implement transaction merging logic
- [ ] Create PaymentStore class with runes
- [ ] Create PaymentMonitor class
- [ ] Create ReactiveTransaction class
- [ ] Create component runes (useZapAmount, etc.)
- [ ] Build TransactionList component
- [ ] Build ZapButton component
- [ ] Write tests for parsers
- [ ] Write tests for store
- [ ] Write tests for reactive classes
- [ ] Add to package exports
- [ ] Document in README
- [ ] Create example app

## Future Enhancements

1. **Storage Persistence**: IndexedDB adapter for transaction history
2. **Optimistic Updates**: Show pending immediately in feeds
3. **Transaction Filtering**: Advanced filters (date ranges, amounts, etc.)
4. **Analytics**: Transaction summaries, charts, insights
5. **Export**: Export history to CSV/JSON
6. **Search**: Full-text search through comments
7. **Notifications**: Toast notifications on transaction events
8. **Virtual Scrolling**: For large transaction lists
9. **Pagination**: Lazy-load old transactions
10. **Multi-wallet**: Track across multiple wallets

---

*Built with ❤️ for Svelte 5*
