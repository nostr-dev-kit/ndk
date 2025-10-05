# ndk-svelte5 API Reference

Complete TypeScript API definitions for ndk-svelte5.

## Core Types

### Initialization

```typescript
/**
 * Initialize global stores with an NDK instance
 * @param ndk - NDK instance
 * @param options - Configuration options
 */
async function initStores(
  ndk: NDKSvelte,
  options?: {
    /**
     * Storage adapter for session persistence
     * - undefined (default): uses NDKSessionLocalStorage (browser localStorage)
     * - NDKSessionStorageAdapter: custom storage implementation
     * - false: disables session persistence
     */
    sessionStorage?: NDKSessionStorageAdapter | false;
  }
): Promise<void>;
```

### NDKSvelte

```typescript
import type NDK from '@nostr-dev-kit/ndk';
import type { NDKEvent, NDKFilter, NDKRelaySet, NDKSigner } from '@nostr-dev-kit/ndk';

class NDKSvelte extends NDK {
  /**
   * Create a reactive subscription to Nostr events
   * @param filters - NDK filters or array of filters
   * @param opts - Subscription options
   * @returns EventSubscription instance with reactive state
   */
  subscribe<T extends NDKEvent>(
    filters: NDKFilter | NDKFilter[],
    opts?: SubscriptionOptions<T>
  ): EventSubscription<T>;

  /**
   * Global profile store
   */
  profiles: ProfileStore;

  /**
   * Session management store
   */
  sessions: SessionStore;

  /**
   * Mute management store
   */
  mutes: MuteStore;

  /**
   * Wallet integration store
   */
  wallet: WalletStore;
}
```

### EventSubscription

```typescript
class EventSubscription<T extends NDKEvent> {
  /**
   * Array of events, sorted by created_at descending
   * @reactive - Updates automatically when new events arrive
   */
  readonly events: T[];

  /**
   * End of stored events flag
   * @reactive - Becomes true when all relays have sent EOSE
   */
  readonly eosed: boolean;

  /**
   * Number of events in the subscription
   * @derived - Computed from events.length
   */
  readonly count: number;

  /**
   * Whether the subscription has no events
   * @derived - Computed from events.length === 0
   */
  readonly isEmpty: boolean;

  /**
   * Current error state
   * @reactive - Updates when errors occur
   */
  readonly error: Error | undefined;

  /**
   * Connection status
   * @reactive - Updates with relay connections
   */
  readonly status: 'connecting' | 'connected' | 'disconnected' | 'error';

  /**
   * The NDK filters for this subscription
   */
  readonly filters: NDKFilter[];

  /**
   * Reference count for shared subscriptions
   */
  readonly refCount: number;

  /**
   * Start the subscription
   * Called automatically unless autoStart: false
   */
  start(): void;

  /**
   * Stop the subscription
   */
  stop(): void;

  /**
   * Restart the subscription (stop + start)
   */
  restart(): void;

  /**
   * Clear all events and restart
   */
  clear(): void;

  /**
   * Change subscription filters
   * Clears existing events and restarts with new filters
   */
  changeFilters(filters: NDKFilter[]): void;

  /**
   * Fetch more events (pagination)
   * @param limit - Number of additional events to fetch
   */
  fetchMore(limit: number): Promise<void>;

  /**
   * Manually add an event to the subscription
   */
  add(event: T): void;

  /**
   * Remove an event by ID
   */
  remove(eventId: string): void;

  /**
   * Increment reference count
   * Starts subscription if refCount goes from 0 to 1
   * @returns Current reference count
   */
  ref(): number;

  /**
   * Decrement reference count
   * Stops subscription if refCount reaches 0
   * @returns Current reference count
   */
  unref(): number;
}
```

### SubscriptionOptions

```typescript
interface SubscriptionOptions<T extends NDKEvent> {
  /**
   * Buffer time in milliseconds for batching events
   * Set to false to disable buffering
   * @default 30
   * Automatically reduces to 16ms after EOSE for ~60fps updates
   */
  bufferMs?: number | false;

  /**
   * Automatically filter out deleted events
   * @default true
   */
  skipDeleted?: boolean;

  /**
   * Automatically filter out muted content
   * @default true
   */
  skipMuted?: boolean;

  /**
   * Class to convert raw events to
   * Must extend NDKEvent and have a static from() method
   */
  eventClass?: EventClass<T>;

  /**
   * Relay set to use for this subscription
   */
  relaySet?: NDKRelaySet;

  /**
   * Whether to start the subscription automatically
   * @default true
   */
  autoStart?: boolean;

  /**
   * Configuration for fetching reposts
   */
  reposts?: {
    /**
     * Filters for repost events
     */
    filters: NDKFilter[];

    /**
     * Whether to automatically fetch reposted events
     * @default true
     */
    autoFetch?: boolean;
  };

  /**
   * Callback when a new event is received
   */
  onEvent?: (event: T, relay?: NDKRelay) => void;

  /**
   * Callback when EOSE is reached
   */
  onEose?: () => void;

  /**
   * Callback when an event is deleted
   */
  onEventDeleted?: (eventId: string) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Callback when connection status changes
   */
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

  /**
   * Auto-reconnect on disconnection
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Maximum reconnection attempts
   * @default Infinity
   */
  maxReconnectAttempts?: number;

  /**
   * Reconnection delay in milliseconds
   * @default 1000
   */
  reconnectDelay?: number;
}

/**
 * Event class with static from() method for conversion
 */
type EventClass<T extends NDKEvent> = {
  from(event: NDKEvent): T | undefined;
} & (new (...args: any[]) => T);
```

## Store Types

### ProfileStore

```typescript
interface ProfileStore {
  /**
   * Get a profile by pubkey
   * Fetches automatically if not in cache
   * @reactive - Updates when profile is fetched or updated
   */
  get(pubkey: string): NDKUserProfile | undefined;

  /**
   * Batch fetch multiple profiles
   * @param pubkeys - Array of pubkeys to fetch
   * @param opts - Fetch options
   */
  fetch(pubkeys: string[], opts?: ProfileFetchOptions): Promise<void>;

  /**
   * Update current user's profile
   * Publishes kind:0 event and updates cache
   */
  update(profile: Partial<NDKUserProfile>): Promise<void>;

  /**
   * Set a profile in the cache without fetching
   */
  set(pubkey: string, profile: NDKUserProfile): void;

  /**
   * Check if a profile is cached
   */
  has(pubkey: string): boolean;

  /**
   * Clear profile cache
   */
  clear(): void;

  /**
   * All cached profiles
   * @reactive
   */
  readonly all: Map<string, NDKUserProfile>;
}

interface ProfileFetchOptions {
  /**
   * Force refetch even if cached
   * @default false
   */
  refresh?: boolean;

  /**
   * Timeout in milliseconds
   * @default 5000
   */
  timeout?: number;
}
```

### SessionStore

```typescript
interface SessionStore {
  /**
   * Current active session
   * @reactive
   */
  readonly current: Session | undefined;

  /**
   * All sessions
   * @reactive
   */
  readonly all: Session[];

  /**
   * Login with a signer
   * Sessions are automatically persisted to storage if configured
   * @param signer - NDK signer (NIP-07, NIP-46, NIP-55)
   * @param setActive - Whether to set as active session
   */
  login(signer: NDKSigner, setActive?: boolean): Promise<void>;

  /**
   * Add a session without setting it as active
   */
  add(signer: NDKSigner): Promise<void>;

  /**
   * Switch to a different session
   * Active session is persisted to storage if configured
   */
  switch(pubkey: string): void;

  /**
   * Logout a specific user
   * Session is removed from storage if configured
   */
  logout(pubkey?: string): void;

  /**
   * Logout all users
   * All sessions are removed from storage if configured
   */
  logoutAll(): void;

  /**
   * Get a session by pubkey
   */
  get(pubkey: string): Session | undefined;
}

/**
 * Storage adapter interface for session persistence
 */
interface NDKSessionStorageAdapter {
  /**
   * Get an item from storage by key
   */
  getItem(key: string): string | null;

  /**
   * Set an item in storage
   */
  setItem(key: string, value: string): void;

  /**
   * Delete an item from storage
   */
  deleteItem(key: string): void;
}

/**
 * Default localStorage implementation
 */
class NDKSessionLocalStorage implements NDKSessionStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  deleteItem(key: string): void;
}

/**
 * Stored session structure
 */
interface StoredSession {
  pubkey: string;
  signerPayload?: string; // Serialized signer payload from signer.toPayload()
}

interface Session {
  /**
   * User's public key
   */
  pubkey: string;

  /**
   * NDK signer for this session
   */
  signer: NDKSigner;

  /**
   * User's profile
   * @reactive
   */
  profile?: NDKUserProfile;

  /**
   * Set of followed pubkeys (kind:3)
   * @reactive
   */
  follows: Set<string>;

  /**
   * Set of muted pubkeys (kind:10000)
   * @reactive
   */
  mutes: Set<string>;

  /**
   * User's relay set (kind:10002)
   * @reactive
   */
  relays: NDKRelaySet;

  /**
   * Cached replaceable events
   * Map of kind to event
   * @reactive
   */
  events: Map<number, NDKEvent>;

  /**
   * Session metadata
   */
  metadata: {
    createdAt: number;
    lastActive: number;
  };
}
```

### MuteStore

```typescript
interface MuteStore {
  /**
   * Check if content should be muted
   */
  check(criteria: MuteCriteria): boolean;

  /**
   * Add a mute
   */
  add(item: MuteItem): void;

  /**
   * Remove a mute
   */
  remove(item: MuteItem): void;

  /**
   * Clear all mutes
   */
  clear(): void;

  /**
   * Publish mute list (NIP-51)
   */
  publish(): Promise<void>;

  /**
   * All muted pubkeys
   * @reactive
   */
  readonly pubkeys: Set<string>;

  /**
   * All muted words
   * @reactive
   */
  readonly words: Set<string>;

  /**
   * All muted hashtags
   * @reactive
   */
  readonly hashtags: Set<string>;

  /**
   * All muted event IDs
   * @reactive
   */
  readonly eventIds: Set<string>;
}

type MuteCriteria =
  | { pubkey: string }
  | { content: string }
  | { hashtag: string }
  | { eventId: string }
  | { event: NDKEvent };

type MuteItem =
  | { pubkey: string }
  | { word: string }
  | { hashtag: string }
  | { eventId: string };
```

### WalletStore

```typescript
import type { NDKWallet, NDKCashuWallet, NDKWalletNWC } from '@nostr-dev-kit/ndk-wallet';

interface WalletStore {
  /**
   * Set the active wallet
   */
  set(wallet: NDKWallet): void;

  /**
   * Current wallet balance
   * @reactive
   */
  readonly balance: number;

  /**
   * Balance by mint (for Cashu wallets)
   * @reactive
   */
  readonly balanceByMint: Map<string, number>;

  /**
   * Whether wallet is connected
   * @reactive
   */
  readonly connected: boolean;

  /**
   * Wallet type
   * @reactive
   */
  readonly type: 'cashu' | 'nwc' | 'webln' | undefined;

  /**
   * Send a payment
   */
  pay(opts: PaymentOptions): Promise<PaymentResult>;

  /**
   * Generate invoice
   */
  createInvoice(opts: InvoiceOptions): Promise<string>;

  /**
   * Transaction history
   * @reactive
   */
  readonly history: Transaction[];

  /**
   * Nutzap monitor
   */
  readonly nutzaps: NutzapMonitor;
}

interface PaymentOptions {
  amount: number;
  recipient?: string;
  comment?: string;
  invoice?: string;
}

interface PaymentResult {
  success: boolean;
  preimage?: string;
  error?: string;
}

interface InvoiceOptions {
  amount: number;
  description?: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

interface NutzapMonitor {
  /**
   * Start monitoring for nutzaps
   */
  start(): Promise<void>;

  /**
   * Stop monitoring
   */
  stop(): void;

  /**
   * Pending nutzaps
   * @reactive
   */
  readonly pending: Nutzap[];

  /**
   * Redeemed nutzaps
   * @reactive
   */
  readonly redeemed: Nutzap[];
}

interface Nutzap {
  id: string;
  sender: string;
  amount: number;
  timestamp: number;
  token?: string;
  redeemed: boolean;
}
```

## Reactive Event Types

### ReactiveEvent

```typescript
class ReactiveEvent extends NDKEvent {
  /**
   * Whether this event has been deleted
   * @reactive - Updates when deletion event is received
   */
  readonly deleted: boolean;

  /**
   * Map of reaction emoji to count
   * @reactive - Updates when reactions are received
   */
  readonly reactions: Map<string, number>;

  /**
   * Total zap amount in millisats
   * @reactive - Updates when zaps are received
   */
  readonly zaps: number;

  /**
   * Number of replies
   * @reactive - Updates when replies are received
   */
  readonly replies: number;

  /**
   * Repost events (if using reposts option)
   * @reactive
   */
  readonly reposts?: NDKEvent[];

  /**
   * React to this event
   */
  react(emoji: string): Promise<void>;

  /**
   * Zap this event
   */
  zap(amount: number, comment?: string): Promise<void>;

  /**
   * Reply to this event
   */
  reply(content: string): Promise<NDKEvent>;

  /**
   * Delete this event
   */
  delete(reason?: string): Promise<void>;
}
```

## Component Types

### Component Props

```typescript
// UserAvatar
interface UserAvatarProps {
  pubkey: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  class?: string;
}

// UserName
interface UserNameProps {
  pubkey: string;
  class?: string;
}

// UserProfile
interface UserProfileProps {
  pubkey: string;
  showAvatar?: boolean;
  showNip05?: boolean;
  showAbout?: boolean;
  class?: string;
}

// WalletBalance
interface WalletBalanceProps {
  format?: 'sats' | 'btc' | 'usd';
  class?: string;
}

// WalletHistory
interface WalletHistoryProps {
  limit?: number;
  class?: string;
}

// PaymentButton
interface PaymentButtonProps {
  amount: number;
  recipient?: string;
  comment?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: Error) => void;
  class?: string;
}

// InfiniteScroll
interface InfiniteScrollProps {
  threshold?: number;
  onloadmore: () => void | Promise<void>;
  class?: string;
}

// VirtualList
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((item: T) => number);
  class?: string;
}
```

## Utility Types

### ReactiveFilter

```typescript
class ReactiveFilter implements NDKFilter {
  /**
   * Event kinds to filter
   * @reactive - Changing this updates subscriptions using this filter
   */
  kinds?: number[];

  /**
   * Author pubkeys to filter
   * @reactive
   */
  authors?: string[];

  /**
   * Event IDs to filter
   * @reactive
   */
  ids?: string[];

  /**
   * Generic tags to filter
   * @reactive
   */
  [key: `#${string}`]: string[] | undefined;

  /**
   * Time range filters
   * @reactive
   */
  since?: number;
  until?: number;

  /**
   * Limit
   * @reactive
   */
  limit?: number;

  /**
   * Search query
   * @reactive
   */
  search?: string;

  /**
   * Convert to plain NDKFilter object
   */
  toFilter(): NDKFilter;
}
```

## Error Types

```typescript
class SubscriptionError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

class ProfileError extends Error {
  constructor(message: string, public pubkey: string, public cause?: Error) {
    super(message);
    this.name = 'ProfileError';
  }
}

class WalletError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'WalletError';
  }
}
```

## Usage Examples

### Type-Safe Subscriptions

```typescript
import { NDKHighlight } from '@nostr-dev-kit/ndk';
import { ndk } from '$lib/ndk';

// Type is inferred as EventSubscription<NDKHighlight>
const highlights = ndk.subscribe<NDKHighlight>(
  [{ kinds: [9802] }],
  { eventClass: NDKHighlight }
);

// Type-safe access to NDKHighlight methods
highlights.events[0].highlightedContent;
```

### Custom Event Classes

```typescript
import { NDKEvent } from '@nostr-dev-kit/ndk';

class CustomArticle extends NDKEvent {
  static from(event: NDKEvent): CustomArticle | undefined {
    if (event.kind !== 30023) return undefined;
    return new CustomArticle(event.ndk, event.rawEvent());
  }

  get title(): string {
    return this.tagValue('title') || '';
  }

  get summary(): string {
    return this.tagValue('summary') || '';
  }

  get image(): string | undefined {
    return this.tagValue('image');
  }
}

// Use custom class
const articles = ndk.subscribe<CustomArticle>(
  [{ kinds: [30023] }],
  { eventClass: CustomArticle }
);

// Type-safe access to custom properties
articles.events[0].title;
articles.events[0].summary;
```

## Constants

```typescript
/**
 * Default buffer time in milliseconds
 */
export const DEFAULT_BUFFER_MS = 30;

/**
 * Post-EOSE buffer time in milliseconds (~60fps)
 */
export const POST_EOSE_BUFFER_MS = 16;

/**
 * Default profile fetch timeout
 */
export const DEFAULT_PROFILE_TIMEOUT = 5000;

/**
 * Maximum subscription reference count
 */
export const MAX_REF_COUNT = 1000;
```
