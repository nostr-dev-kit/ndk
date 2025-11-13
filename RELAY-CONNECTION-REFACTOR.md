# Relay Connection Management - Detailed Refactoring Plan

## Current State Analysis

Looking at the current implementation in `relay/connectivity.ts`, the relay connection management has several areas for improvement:

1. **State Management**: Currently uses numeric enum states with complex conditional logic
2. **Race Conditions**: Multiple timeout handlers that can conflict
3. **Health Tracking**: Basic connection statistics without predictive capabilities
4. **Error Handling**: Limited visibility into failure patterns

## 4.1 Connection State Machine - Detailed Design

### Current Problems

```typescript
// Current approach has implicit state transitions
if (this._status !== NDKRelayStatus.RECONNECTING && 
    this._status !== NDKRelayStatus.DISCONNECTED) {
    // Complex conditional logic
}
```

### Proposed State Machine Implementation

```typescript
// Define all possible states and events
enum ConnectionState {
    INITIAL = 'INITIAL',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    AUTH_PENDING = 'AUTH_PENDING',
    AUTHENTICATING = 'AUTHENTICATING',
    AUTHENTICATED = 'AUTHENTICATED',
    DISCONNECTING = 'DISCONNECTING',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECT_WAITING = 'RECONNECT_WAITING',
    FAILED = 'FAILED',
    BLACKLISTED = 'BLACKLISTED'
}

enum ConnectionEvent {
    CONNECT = 'CONNECT',
    CONNECTION_OPENED = 'CONNECTION_OPENED',
    CONNECTION_CLOSED = 'CONNECTION_CLOSED',
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    AUTH_REQUESTED = 'AUTH_REQUESTED',
    AUTH_SUCCESS = 'AUTH_SUCCESS',
    AUTH_FAILED = 'AUTH_FAILED',
    DISCONNECT = 'DISCONNECT',
    RECONNECT_TIMER_EXPIRED = 'RECONNECT_TIMER_EXPIRED',
    BLACKLIST = 'BLACKLIST',
    FLAPPING_DETECTED = 'FLAPPING_DETECTED'
}

interface StateTransition {
    from: ConnectionState;
    event: ConnectionEvent;
    to: ConnectionState;
    guard?: (context: ConnectionContext) => boolean;
    action?: (context: ConnectionContext) => void | Promise<void>;
}

class RelayConnectionStateMachine {
    private currentState: ConnectionState = ConnectionState.INITIAL;
    private transitions: Map<string, StateTransition> = new Map();
    private context: ConnectionContext;
    
    constructor(relay: NDKRelay) {
        this.context = new ConnectionContext(relay);
        this.defineTransitions();
    }
    
    private defineTransitions(): void {
        // Define all valid state transitions
        this.addTransition({
            from: ConnectionState.INITIAL,
            event: ConnectionEvent.CONNECT,
            to: ConnectionState.CONNECTING,
            action: async (ctx) => {
                ctx.startConnectionTimer();
                await ctx.createWebSocket();
            }
        });
        
        this.addTransition({
            from: ConnectionState.CONNECTING,
            event: ConnectionEvent.CONNECTION_OPENED,
            to: ConnectionState.CONNECTED,
            action: (ctx) => {
                ctx.clearConnectionTimer();
                ctx.updateConnectionStats('success');
                ctx.emit('connected');
            }
        });
        
        this.addTransition({
            from: ConnectionState.CONNECTED,
            event: ConnectionEvent.AUTH_REQUESTED,
            to: ConnectionState.AUTH_PENDING,
            guard: (ctx) => !ctx.isAuthenticating(),
            action: (ctx) => {
                ctx.emit('auth:requested', ctx.authChallenge);
            }
        });
        
        this.addTransition({
            from: ConnectionState.AUTH_PENDING,
            event: ConnectionEvent.AUTH_SUCCESS,
            to: ConnectionState.AUTHENTICATED,
            action: (ctx) => {
                ctx.emit('authenticated');
                ctx.markAsAuthenticated();
            }
        });
        
        // Reconnection flow
        this.addTransition({
            from: ConnectionState.DISCONNECTED,
            event: ConnectionEvent.CONNECT,
            to: ConnectionState.RECONNECT_WAITING,
            guard: (ctx) => ctx.shouldReconnect(),
            action: (ctx) => {
                const delay = ctx.calculateReconnectDelay();
                ctx.scheduleReconnect(delay);
                ctx.emit('reconnect:scheduled', delay);
            }
        });
        
        this.addTransition({
            from: ConnectionState.RECONNECT_WAITING,
            event: ConnectionEvent.RECONNECT_TIMER_EXPIRED,
            to: ConnectionState.CONNECTING,
            action: async (ctx) => {
                await ctx.createWebSocket();
            }
        });
        
        // Flapping protection
        this.addTransition({
            from: ConnectionState.CONNECTED,
            event: ConnectionEvent.FLAPPING_DETECTED,
            to: ConnectionState.FAILED,
            action: (ctx) => {
                ctx.disconnect();
                ctx.scheduleBackoff();
                ctx.emit('flapping', ctx.getFlappingStats());
            }
        });
    }
    
    async dispatch(event: ConnectionEvent, data?: any): Promise<void> {
        const key = `${this.currentState}-${event}`;
        const transition = this.transitions.get(key);
        
        if (!transition) {
            this.context.logger.warn(`Invalid transition: ${key}`);
            return;
        }
        
        if (transition.guard && !transition.guard(this.context)) {
            this.context.logger.debug(`Guard prevented transition: ${key}`);
            return;
        }
        
        const previousState = this.currentState;
        this.currentState = transition.to;
        
        this.context.logger.debug(`State transition: ${previousState} -> ${this.currentState}`);
        
        if (transition.action) {
            try {
                await transition.action(this.context);
            } catch (error) {
                this.context.logger.error(`Action failed for transition ${key}:`, error);
                // Potentially rollback state
            }
        }
        
        this.context.emit('state:changed', {
            from: previousState,
            to: this.currentState,
            event
        });
    }
}
```

### Connection Context

```typescript
class ConnectionContext {
    private relay: NDKRelay;
    private ws?: WebSocket;
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private stats: ConnectionStatistics;
    private authState: AuthenticationState;
    
    constructor(relay: NDKRelay) {
        this.relay = relay;
        this.stats = new ConnectionStatistics();
        this.authState = new AuthenticationState();
    }
    
    async createWebSocket(): Promise<void> {
        this.stats.recordAttempt();
        
        try {
            this.ws = new WebSocket(this.relay.url);
            this.setupWebSocketHandlers();
        } catch (error) {
            this.stats.recordFailure(error);
            throw error;
        }
    }
    
    private setupWebSocketHandlers(): void {
        if (!this.ws) return;
        
        this.ws.onopen = () => {
            this.stats.recordConnection();
            this.relay.stateMachine.dispatch(ConnectionEvent.CONNECTION_OPENED);
        };
        
        this.ws.onclose = () => {
            this.stats.recordDisconnection();
            this.relay.stateMachine.dispatch(ConnectionEvent.CONNECTION_CLOSED);
        };
        
        this.ws.onerror = (error) => {
            this.stats.recordError(error);
            this.relay.stateMachine.dispatch(ConnectionEvent.CONNECTION_ERROR, error);
        };
        
        this.ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };
    }
    
    calculateReconnectDelay(): number {
        const baseDelay = 1000;
        const maxDelay = 60000;
        const attempt = this.stats.reconnectAttempts;
        
        // Exponential backoff with jitter
        const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const jitter = Math.random() * 0.3 * exponentialDelay;
        
        return exponentialDelay + jitter;
    }
    
    shouldReconnect(): boolean {
        // Check various conditions
        if (this.relay.isBlacklisted) return false;
        if (this.stats.isFlapping()) return false;
        if (this.stats.reconnectAttempts > MAX_RECONNECT_ATTEMPTS) return false;
        if (this.relay.isPermanentlyFailed) return false;
        
        return true;
    }
}
```

## 4.2 Relay Health Monitoring - Detailed Design

### Comprehensive Health Metrics

```typescript
interface RelayHealthMetrics {
    // Connection metrics
    connectionSuccessRate: number;
    averageConnectionDuration: number;
    reconnectFrequency: number;
    lastSuccessfulConnection: number;
    
    // Performance metrics
    messageLatencyP50: number;
    messageLatencyP95: number;
    messageLatencyP99: number;
    throughputMessagesPerSecond: number;
    
    // Reliability metrics
    subscriptionSuccessRate: number;
    eventDeliveryRate: number;
    eoseComplianceRate: number;
    errorRate: number;
    
    // Protocol compliance
    supportedNips: Set<number>;
    protocolViolations: number;
    invalidEventRate: number;
    
    // Resource usage
    activeSubscriptions: number;
    pendingPublications: number;
    memoryUsage: number;
}

class RelayHealthMonitor {
    private metrics: Map<string, RelayHealthMetrics> = new Map();
    private samplers: Map<string, MetricSampler> = new Map();
    private anomalyDetector: AnomalyDetector;
    
    constructor() {
        this.anomalyDetector = new AnomalyDetector();
        this.startPeriodicHealthCheck();
    }
    
    startMonitoring(relay: NDKRelay): void {
        const relayUrl = relay.url;
        
        // Initialize metrics
        this.metrics.set(relayUrl, this.createInitialMetrics());
        
        // Create samplers for different metric types
        const latencySampler = new LatencySampler(relay);
        const throughputSampler = new ThroughputSampler(relay);
        const errorSampler = new ErrorSampler(relay);
        
        this.samplers.set(relayUrl, new CompositeSampler([
            latencySampler,
            throughputSampler,
            errorSampler
        ]));
        
        // Hook into relay events
        this.attachRelayListeners(relay);
    }
    
    private attachRelayListeners(relay: NDKRelay): void {
        // Track connection events
        relay.on('connect', () => this.recordConnectionSuccess(relay));
        relay.on('disconnect', () => this.recordDisconnection(relay));
        relay.on('error', (error) => this.recordError(relay, error));
        
        // Track message flow
        relay.on('message:sent', (msg) => this.recordOutgoingMessage(relay, msg));
        relay.on('message:received', (msg) => this.recordIncomingMessage(relay, msg));
        
        // Track subscription lifecycle
        relay.on('subscription:created', (sub) => this.recordSubscription(relay, sub));
        relay.on('subscription:eose', (sub) => this.recordEose(relay, sub));
        relay.on('subscription:closed', (sub) => this.recordSubscriptionClosed(relay, sub));
    }
    
    getHealthScore(relay: NDKRelay): number {
        const metrics = this.metrics.get(relay.url);
        if (!metrics) return 0;
        
        // Weighted scoring based on different factors
        const weights = {
            connection: 0.2,
            performance: 0.3,
            reliability: 0.4,
            compliance: 0.1
        };
        
        const scores = {
            connection: this.calculateConnectionScore(metrics),
            performance: this.calculatePerformanceScore(metrics),
            reliability: this.calculateReliabilityScore(metrics),
            compliance: this.calculateComplianceScore(metrics)
        };
        
        // Calculate weighted average
        let totalScore = 0;
        for (const [category, weight] of Object.entries(weights)) {
            totalScore += scores[category as keyof typeof scores] * weight;
        }
        
        return Math.round(totalScore * 100) / 100;
    }
    
    private calculatePerformanceScore(metrics: RelayHealthMetrics): number {
        // Score based on latency and throughput
        const latencyScore = this.scoreLatency(metrics.messageLatencyP50);
        const throughputScore = this.scoreThroughput(metrics.throughputMessagesPerSecond);
        
        return (latencyScore + throughputScore) / 2;
    }
    
    private scoreLatency(latencyMs: number): number {
        // Scoring curve: <50ms = 1.0, 50-200ms = 0.8-1.0, >1000ms = 0
        if (latencyMs < 50) return 1.0;
        if (latencyMs < 200) return 0.8 + (200 - latencyMs) / 750;
        if (latencyMs < 1000) return 0.2 + (1000 - latencyMs) / 1000;
        return 0;
    }
}
```

### Predictive Failure Detection

```typescript
class RelayAnomalyDetector {
    private historyWindow = 3600000; // 1 hour
    private history: Map<string, TimeSeries> = new Map();
    private models: Map<string, PredictionModel> = new Map();
    
    detectAnomalies(relay: NDKRelay, metrics: RelayHealthMetrics): AnomalyReport {
        const relayUrl = relay.url;
        const timeSeries = this.getOrCreateTimeSeries(relayUrl);
        
        // Update time series with latest metrics
        timeSeries.addPoint({
            timestamp: Date.now(),
            latency: metrics.messageLatencyP50,
            errorRate: metrics.errorRate,
            throughput: metrics.throughputMessagesPerSecond
        });
        
        // Detect anomalies using multiple methods
        const anomalies: Anomaly[] = [];
        
        // Statistical anomaly detection
        const statisticalAnomalies = this.detectStatisticalAnomalies(timeSeries);
        anomalies.push(...statisticalAnomalies);
        
        // Pattern-based anomaly detection
        const patternAnomalies = this.detectPatternAnomalies(timeSeries);
        anomalies.push(...patternAnomalies);
        
        // Threshold-based anomaly detection
        const thresholdAnomalies = this.detectThresholdAnomalies(metrics);
        anomalies.push(...thresholdAnomalies);
        
        return {
            relay: relayUrl,
            anomalies,
            severity: this.calculateSeverity(anomalies),
            predictedFailureTime: this.predictFailureTime(timeSeries, anomalies)
        };
    }
    
    private detectStatisticalAnomalies(timeSeries: TimeSeries): Anomaly[] {
        const anomalies: Anomaly[] = [];
        
        // Use sliding window for anomaly detection
        const window = timeSeries.getLastNPoints(20);
        if (window.length < 20) return anomalies;
        
        // Calculate statistics
        const latencies = window.map(p => p.latency);
        const mean = this.calculateMean(latencies);
        const stdDev = this.calculateStdDev(latencies, mean);
        
        // Check latest point
        const latest = window[window.length - 1];
        const zScore = Math.abs((latest.latency - mean) / stdDev);
        
        if (zScore > 3) {
            anomalies.push({
                type: 'LATENCY_SPIKE',
                severity: zScore > 4 ? 'HIGH' : 'MEDIUM',
                value: latest.latency,
                baseline: mean,
                deviation: zScore
            });
        }
        
        return anomalies;
    }
    
    predictFailureTime(timeSeries: TimeSeries, anomalies: Anomaly[]): number | null {
        if (anomalies.length === 0) return null;
        
        // Simple prediction based on anomaly trend
        const recentAnomalies = anomalies.filter(a => 
            a.timestamp > Date.now() - 300000 // Last 5 minutes
        );
        
        if (recentAnomalies.length < 3) return null;
        
        // Calculate rate of degradation
        const degradationRate = this.calculateDegradationRate(recentAnomalies);
        
        if (degradationRate > 0) {
            // Estimate time to failure based on current rate
            const currentHealth = 100 - (recentAnomalies.length * 10);
            const timeToZero = currentHealth / degradationRate;
            
            return Date.now() + timeToZero;
        }
        
        return null;
    }
}
```

### Adaptive Relay Selection

```typescript
class AdaptiveRelaySelector {
    private healthMonitor: RelayHealthMonitor;
    private selectionHistory: Map<string, SelectionRecord[]> = new Map();
    private learningRate = 0.1;
    
    selectOptimalRelay(
        filter: NDKFilter,
        availableRelays: NDKRelay[],
        context: SelectionContext
    ): NDKRelay {
        // Score each relay based on multiple factors
        const scores = availableRelays.map(relay => ({
            relay,
            score: this.calculateRelayScore(relay, filter, context)
        }));
        
        // Sort by score and apply selection strategy
        scores.sort((a, b) => b.score - a.score);
        
        // Apply selection strategy
        const selected = this.applySelectionStrategy(scores, context);
        
        // Record selection for learning
        this.recordSelection(selected, filter, context);
        
        return selected;
    }
    
    private calculateRelayScore(
        relay: NDKRelay,
        filter: NDKFilter,
        context: SelectionContext
    ): number {
        // Base health score
        let score = this.healthMonitor.getHealthScore(relay);
        
        // Adjust for filter-specific performance
        if (filter.authors) {
            // Check if relay is preferred for these authors
            const authorScore = this.getAuthorRelayScore(relay, filter.authors);
            score = score * 0.7 + authorScore * 0.3;
        }
        
        // Adjust for current load
        const loadFactor = this.getRelayLoadFactor(relay);
        score *= (2 - loadFactor); // Penalize heavily loaded relays
        
        // Adjust based on historical performance for similar filters
        const historicalScore = this.getHistoricalScore(relay, filter);
        if (historicalScore !== null) {
            score = score * 0.8 + historicalScore * 0.2;
        }
        
        // Context-specific adjustments
        if (context.priority === 'latency') {
            const latencyScore = this.getLatencyScore(relay);
            score = score * 0.5 + latencyScore * 0.5;
        } else if (context.priority === 'reliability') {
            const reliabilityScore = this.getReliabilityScore(relay);
            score = score * 0.5 + reliabilityScore * 0.5;
        }
        
        return score;
    }
    
    private applySelectionStrategy(
        scores: { relay: NDKRelay; score: number }[],
        context: SelectionContext
    ): NDKRelay {
        if (context.strategy === 'best') {
            // Always pick the best
            return scores[0].relay;
        } else if (context.strategy === 'weighted-random') {
            // Probabilistic selection based on scores
            return this.weightedRandomSelection(scores);
        } else if (context.strategy === 'load-balanced') {
            // Consider current load more heavily
            return this.loadBalancedSelection(scores);
        }
        
        return scores[0].relay;
    }
    
    private recordSelection(
        relay: NDKRelay,
        filter: NDKFilter,
        context: SelectionContext
    ): void {
        const record: SelectionRecord = {
            timestamp: Date.now(),
            relay: relay.url,
            filter: this.serializeFilter(filter),
            context,
            outcome: 'pending'
        };
        
        const history = this.selectionHistory.get(relay.url) || [];
        history.push(record);
        this.selectionHistory.set(relay.url, history);
        
        // Set up outcome tracking
        this.trackSelectionOutcome(record, relay);
    }
}
```

### Benefits of This Approach

1. **Predictability**: State machine ensures only valid transitions occur
2. **Debuggability**: Clear state flow and transition logging
3. **Resilience**: Sophisticated failure detection and recovery
4. **Performance**: Intelligent relay selection based on real metrics
5. **Adaptability**: System learns from past behavior
6. **Maintainability**: Modular design with clear separation of concerns

### Integration Example

```typescript
// How it would integrate with NDK
class NDK {
    private relayManager: RelayManager;
    
    constructor(opts: NDKOptions) {
        this.relayManager = new RelayManager({
            healthMonitor: new RelayHealthMonitor(),
            selector: new AdaptiveRelaySelector(),
            anomalyDetector: new RelayAnomalyDetector()
        });
    }
    
    async connect(): Promise<void> {
        // The relay manager handles all complexity
        await this.relayManager.connectToRelays(this.explicitRelayUrls);
    }
    
    selectRelayForFilter(filter: NDKFilter): NDKRelay {
        return this.relayManager.selectOptimal(filter, {
            priority: 'latency',
            strategy: 'weighted-random'
        });
    }
}
```

This refactoring would significantly improve reliability, performance, and maintainability of the relay connection system.