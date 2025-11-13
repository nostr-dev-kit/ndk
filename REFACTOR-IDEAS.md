# NDK-Core Refactoring Ideas

## Executive Summary

This document outlines refactoring opportunities for NDK-core to improve performance, maintainability, and developer experience. The suggestions are based on architectural analysis and identified patterns that could benefit from optimization.

## 1. Architecture & Code Organization

### 1.1 Modularize Core Components

**Current State**: The NDK class is becoming a monolith with many responsibilities.

**Proposed Changes**:
```typescript
// Split NDK class into focused modules
class NDKCore {
  readonly relay: RelayManager;
  readonly subscription: SubscriptionManager;
  readonly event: EventManager;
  readonly cache: CacheManager;
  readonly auth: AuthManager;
}

// Each manager handles its domain
class RelayManager {
  pools: Map<string, NDKPool>;
  blacklist: RelayBlacklist;
  scoring: RelayScoring;
  // Consolidated relay logic
}
```

**Benefits**:
- Single Responsibility Principle
- Easier testing and maintenance
- Better code navigation

### 1.2 Dependency Injection Pattern

**Current State**: Hard dependencies throughout the codebase.

**Proposed Changes**:
```typescript
interface NDKConfig {
  relayStrategy?: IRelayStrategy;
  cacheStrategy?: ICacheStrategy;
  signerStrategy?: ISignerStrategy;
}

// Allow injecting custom implementations
const ndk = new NDK({
  relayStrategy: new CustomRelayStrategy(),
  cacheStrategy: new RedisCacheStrategy(),
});
```

## 2. Performance Optimizations

### 2.1 Event Processing Pipeline

**Current State**: Linear event processing with multiple passes.

**Proposed Changes**:
```typescript
// Implement event processing pipeline with stages
class EventPipeline {
  private stages: EventStage[] = [];
  
  addStage(stage: EventStage): void {
    this.stages.push(stage);
  }
  
  async process(event: NDKEvent): Promise<ProcessedEvent> {
    return this.stages.reduce(async (acc, stage) => {
      return stage.process(await acc);
    }, Promise.resolve(event));
  }
}

// Parallel processing for independent stages
class ParallelEventProcessor {
  async process(events: NDKEvent[]): Promise<ProcessedEvent[]> {
    return Promise.all(events.map(e => this.pipeline.process(e)));
  }
}
```

### 2.2 Subscription Deduplication Enhancement

**Current State**: Basic filter fingerprinting.

**Proposed Changes**:
```typescript
// Advanced subscription deduplication
class SubscriptionDeduplicator {
  private activeSubscriptions = new Map<string, SubscriptionGroup>();
  
  findCompatible(newSub: NDKSubscription): SubscriptionGroup | null {
    // Use more sophisticated matching
    // Consider time ranges, limits, and partial overlaps
    return this.activeSubscriptions.get(this.getCompatibilityKey(newSub));
  }
  
  merge(existing: SubscriptionGroup, newSub: NDKSubscription): void {
    // Intelligently merge filters
    // Track reference counts
    // Handle different closeOnEose requirements
  }
}
```

### 2.3 Smart Relay Load Balancing

**Current State**: Basic relay selection.

**Proposed Changes**:
```typescript
interface RelayLoadBalancer {
  selectRelay(filter: NDKFilter, relays: NDKRelay[]): NDKRelay;
  reportLatency(relay: NDKRelay, latency: number): void;
  reportError(relay: NDKRelay, error: Error): void;
}

class AdaptiveLoadBalancer implements RelayLoadBalancer {
  private stats = new Map<string, RelayStats>();
  
  selectRelay(filter: NDKFilter, relays: NDKRelay[]): NDKRelay {
    // Consider:
    // - Current connection count
    // - Average response time
    // - Error rate
    // - Geographic proximity (if available)
    // - Filter-specific performance
  }
}
```

## 3. Memory Management

### 3.1 Unified Cache Management

**Current State**: Multiple separate caches with no coordination.

**Proposed Changes**:
```typescript
class UnifiedCacheManager {
  private totalMemoryLimit: number;
  private caches: Map<string, ManagedCache>;
  
  registerCache(name: string, cache: ManagedCache): void {
    this.caches.set(name, cache);
    this.rebalanceMemory();
  }
  
  private rebalanceMemory(): void {
    // Dynamically adjust cache sizes based on usage patterns
    // Implement global LRU across all caches
  }
}
```

### 3.2 Event Pool & Recycling

**Current State**: New event objects created frequently.

**Proposed Changes**:
```typescript
class EventPool {
  private pool: NDKEvent[] = [];
  private maxSize = 1000;
  
  acquire(): NDKEvent {
    return this.pool.pop() || new NDKEvent();
  }
  
  release(event: NDKEvent): void {
    if (this.pool.length < this.maxSize) {
      event.reset(); // Clear all data
      this.pool.push(event);
    }
  }
}
```

## 4. Relay Connection Management

### 4.1 Connection State Machine

**Current State**: Complex state management with potential race conditions.

**Proposed Changes**:
```typescript
// Implement formal state machine
class RelayConnectionStateMachine {
  private transitions = new Map<string, StateTransition>();
  
  constructor() {
    this.defineTransitions();
  }
  
  transition(from: NDKRelayStatus, event: ConnectionEvent): NDKRelayStatus {
    const key = `${from}-${event}`;
    const transition = this.transitions.get(key);
    if (!transition) {
      throw new InvalidTransitionError(from, event);
    }
    return transition.execute();
  }
}
```

### 4.2 Relay Health Monitoring

**Current State**: Basic connection tracking.

**Proposed Changes**:
```typescript
class RelayHealthMonitor {
  private metrics: Map<string, RelayMetrics> = new Map();
  
  startMonitoring(relay: NDKRelay): void {
    // Track:
    // - Message latency percentiles
    // - Subscription success rate
    // - Event delivery rate
    // - Connection stability score
  }
  
  getHealthScore(relay: NDKRelay): number {
    // Composite score based on multiple factors
    // Used for intelligent relay selection
  }
  
  predictFailure(relay: NDKRelay): number {
    // ML-based failure prediction
    // Preemptively switch away from failing relays
  }
}
```

## 5. Type Safety Improvements

### 5.1 Strict Event Types

**Current State**: Loose typing for event kinds.

**Proposed Changes**:
```typescript
// Create discriminated union for all event types
type NostrEvent = 
  | MetadataEvent
  | TextNoteEvent
  | RecommendRelayEvent
  | ContactsEvent
  | EncryptedDirectMessageEvent
  // ... etc

// Type guards for each event type
function isMetadataEvent(event: NDKEvent): event is MetadataEvent {
  return event.kind === NDKKind.Metadata;
}

// Builder pattern with type safety
class EventBuilder<T extends NostrEvent> {
  build(): T {
    // Compile-time type checking
  }
}
```

### 5.2 Filter Type Enhancement

**Current State**: Generic filter type.

**Proposed Changes**:
```typescript
// Strongly typed filters
interface TypedFilter<K extends NDKKind> {
  kinds: K[];
  // Other properties typed based on K
}

// Filter builder with autocompletion
class FilterBuilder<K extends NDKKind> {
  forKind(kind: K): FilterBuilderForKind<K> {
    // Returns specialized builder with kind-specific methods
  }
}
```

## 6. Error Handling & Resilience

### 6.1 Circuit Breaker Pattern

**Current State**: Immediate retry on failures.

**Proposed Changes**:
```typescript
class RelayCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private lastFailureTime = 0;
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitOpenError();
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

### 6.2 Graceful Degradation

**Current State**: Hard failures when components unavailable.

**Proposed Changes**:
```typescript
class GracefulNDK extends NDK {
  async subscribe(filters: NDKFilter[], opts?: NDKSubscriptionOptions): Promise<NDKSubscription> {
    try {
      return super.subscribe(filters, opts);
    } catch (error) {
      // Fallback strategies:
      // 1. Try cache-only mode
      // 2. Use subset of available relays
      // 3. Return partial results with warning
      return this.fallbackSubscribe(filters, opts, error);
    }
  }
}
```

## 7. Developer Experience

### 7.1 Fluent API Design

**Current State**: Imperative API style.

**Proposed Changes**:
```typescript
// Fluent interface for common operations
const events = await ndk
  .query()
  .kinds(1, 7)
  .authors("pubkey1", "pubkey2")
  .since(yesterday)
  .limit(100)
  .fromRelays("wss://relay1.com", "wss://relay2.com")
  .execute();

// Subscription builder
const sub = ndk
  .subscribe()
  .to({ kinds: [1] })
  .withOptions({ closeOnEose: true })
  .onEvent(event => console.log(event))
  .start();
```

### 7.2 Better Debugging Tools

**Current State**: Limited debugging visibility.

**Proposed Changes**:
```typescript
class NDKDebugger {
  // Real-time subscription viewer
  getActiveSubscriptions(): SubscriptionInfo[] {
    // Returns detailed info about all active subs
  }
  
  // Relay connection inspector
  getRelayStats(): RelayStats[] {
    // Detailed metrics for each relay
  }
  
  // Event flow tracer
  traceEvent(eventId: string): EventTrace {
    // Shows complete path of event through system
  }
  
  // Performance profiler
  startProfiling(): ProfileSession {
    // Records detailed performance metrics
  }
}
```

## 8. Testing Infrastructure

### 8.1 Mockable Architecture

**Current State**: Difficult to mock dependencies.

**Proposed Changes**:
```typescript
// All external dependencies behind interfaces
interface IWebSocketFactory {
  create(url: string): IWebSocket;
}

interface ITimeProvider {
  now(): number;
  setTimeout(fn: Function, delay: number): number;
}

// Easily testable components
class NDK {
  constructor(
    private wsFactory: IWebSocketFactory = new DefaultWebSocketFactory(),
    private timeProvider: ITimeProvider = new DefaultTimeProvider()
  ) {}
}
```

### 8.2 Testing Utilities

**Current State**: Limited testing helpers.

**Proposed Changes**:
```typescript
// Rich testing utilities
class NDKTestKit {
  // Relay simulator
  createMockRelay(behavior: RelayBehavior): MockRelay {
    // Simulates various relay behaviors
  }
  
  // Event factory
  createEvent(template: Partial<NDKEvent>): NDKEvent {
    // Generates valid test events
  }
  
  // Time control
  async advanceTime(ms: number): Promise<void> {
    // Fast-forward time for testing
  }
}
```

## 9. Protocol Evolution Support

### 9.1 NIP Feature Detection

**Current State**: Static NIP support.

**Proposed Changes**:
```typescript
class NIPManager {
  private supportedNIPs = new Map<number, NIPImplementation>();
  
  async detectRelaySupport(relay: NDKRelay): Promise<Set<number>> {
    // Query relay for supported NIPs
    // Cache results
  }
  
  isSupported(nip: number, relay?: NDKRelay): boolean {
    // Check if NIP is supported globally or by specific relay
  }
  
  register(nip: number, implementation: NIPImplementation): void {
    // Dynamically register new NIP support
  }
}
```

### 9.2 Backward Compatibility Layer

**Current State**: Breaking changes difficult to manage.

**Proposed Changes**:
```typescript
// Version-aware API
class NDK {
  constructor(opts: NDKOptions & { apiVersion?: string }) {
    this.initializeAPI(opts.apiVersion || 'latest');
  }
  
  private initializeAPI(version: string): void {
    // Load appropriate API surface for version
    // Provide migration warnings
  }
}
```

## 10. Performance Monitoring

### 10.1 Built-in Metrics Collection

**Current State**: Limited performance visibility.

**Proposed Changes**:
```typescript
interface NDKMetrics {
  // Event metrics
  eventsReceived: Counter;
  eventsProcessed: Counter;
  eventProcessingTime: Histogram;
  
  // Relay metrics
  relayConnections: Gauge;
  relayLatency: Histogram;
  relayErrors: Counter;
  
  // Subscription metrics
  activeSubscriptions: Gauge;
  subscriptionLifetime: Histogram;
  
  // Cache metrics
  cacheHits: Counter;
  cacheMisses: Counter;
  cacheSize: Gauge;
}

class MetricsCollector {
  export(): PrometheusFormat {
    // Export metrics in standard format
  }
}
```

## Implementation Priority

### Phase 1: Foundation (High Priority)
1. Modularize core components
2. Implement unified cache management
3. Add circuit breaker pattern
4. Improve type safety

### Phase 2: Performance (Medium Priority)
1. Event processing pipeline
2. Smart relay load balancing
3. Connection state machine
4. Memory pooling

### Phase 3: Developer Experience (Medium Priority)
1. Fluent API design
2. Better debugging tools
3. Testing utilities
4. Built-in metrics

### Phase 4: Advanced Features (Low Priority)
1. ML-based relay health prediction
2. Protocol evolution support
3. Advanced subscription deduplication

## Conclusion

These refactoring ideas aim to transform NDK-core into a more maintainable, performant, and developer-friendly library while maintaining backward compatibility. The modular approach allows for incremental implementation, letting the team prioritize based on immediate needs and available resources.