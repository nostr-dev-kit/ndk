<script lang="ts">
    import type { NDKUser, NDKRelay } from "@nostr-dev-kit/ndk";
    import { NDKRelayStatus } from "@nostr-dev-kit/ndk";
    import type { NDKSvelte } from "@nostr-dev-kit/svelte";
    import type { NDKMessenger, NDKConversation } from "@nostr-dev-kit/messages";
    import type { Contact } from "../lib/types";

    let {
        ndk,
        messenger,
        currentUser,
        selectedContact
    }: {
        ndk: NDKSvelte;
        messenger: NDKMessenger;
        currentUser: NDKUser;
        selectedContact: Contact | null;
    } = $props();

    let relayStats = $state<Array<{
        url: string;
        status: NDKRelayStatus;
        statusText: string;
        connected: boolean;
        connectionStats: any;
    }>>([]);

    let myDMRelays = $state<string[]>([]);
    let counterpartyDMRelays = $state<string[]>([]);
    let conversationInfo = $state<{
        id: string;
        messageCount: number;
        participants: string[];
    } | null>(null);
    let isLoading = $state(true);

    function getStatusText(status: NDKRelayStatus): string {
        switch (status) {
            case NDKRelayStatus.DISCONNECTED:
                return "Disconnected";
            case NDKRelayStatus.CONNECTING:
                return "Connecting";
            case NDKRelayStatus.CONNECTED:
                return "Connected";
            case NDKRelayStatus.RECONNECTING:
                return "Reconnecting";
            case NDKRelayStatus.FLAPPING:
                return "Flapping";
            case NDKRelayStatus.AUTH_REQUESTED:
                return "Auth Requested";
            case NDKRelayStatus.AUTHENTICATING:
                return "Authenticating";
            case NDKRelayStatus.AUTHENTICATED:
                return "Authenticated";
            case NDKRelayStatus.DISCONNECTING:
                return "Disconnecting";
            default:
                return "Unknown";
        }
    }

    function getStatusColor(status: NDKRelayStatus): string {
        switch (status) {
            case NDKRelayStatus.AUTHENTICATED:
                return "#10b981"; // green
            case NDKRelayStatus.CONNECTED:
                return "#3b82f6"; // blue
            case NDKRelayStatus.CONNECTING:
            case NDKRelayStatus.RECONNECTING:
            case NDKRelayStatus.AUTHENTICATING:
                return "#f59e0b"; // amber
            case NDKRelayStatus.AUTH_REQUESTED:
                return "#8b5cf6"; // purple
            case NDKRelayStatus.FLAPPING:
                return "#ef4444"; // red
            default:
                return "#6b7280"; // gray
        }
    }

    async function loadDebugInfo() {
        isLoading = true;

        try {
            // Load relay information
            const relays = Array.from(ndk.pool.relays.values());
            relayStats = relays.map((relay: NDKRelay) => ({
                url: relay.url,
                status: relay.status,
                statusText: getStatusText(relay.status),
                connected: relay.connected,
                connectionStats: relay.connectionStats,
            }));

            // Load my DM relays
            const nip17 = (messenger as any).nip17;
            if (nip17 && currentUser) {
                myDMRelays = await nip17.getUserDMRelays(currentUser);
            }

            // Load counterparty DM relays if a contact is selected
            if (selectedContact && nip17) {
                counterpartyDMRelays = await nip17.getRecipientDMRelays(selectedContact.user);

                // Load conversation info
                const conversation = await messenger.getConversation(selectedContact.user);
                const messages = await conversation.getMessages(1000);
                conversationInfo = {
                    id: conversation.id,
                    messageCount: messages.length,
                    participants: [currentUser.pubkey, selectedContact.user.pubkey],
                };
            } else {
                counterpartyDMRelays = [];
                conversationInfo = null;
            }
        } catch (error) {
            console.error("Failed to load debug info:", error);
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        // Load debug info on mount and when selected contact changes
        loadDebugInfo();
    });
</script>

<div class="debug-view">
    <div class="debug-header">
        <h2>🐛 Debug Information</h2>
        <button class="refresh-button" onclick={loadDebugInfo}>
            🔄 Refresh
        </button>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="spinner"></div>
            Loading debug information...
        </div>
    {:else}
        <!-- Relay Information -->
        <section class="debug-section">
            <h3>Relay Status</h3>
            <div class="relay-list">
                {#each relayStats as relay}
                    <div class="relay-item">
                        <div class="relay-header">
                            <span
                                class="status-indicator"
                                style="background-color: {getStatusColor(relay.status)};"
                            ></span>
                            <span class="relay-url">{relay.url}</span>
                        </div>
                        <div class="relay-details">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">{relay.statusText}</span>
                        </div>
                        {#if relay.connectionStats.connectedAt}
                            <div class="relay-details">
                                <span class="detail-label">Connected:</span>
                                <span class="detail-value">
                                    {new Date(relay.connectionStats.connectedAt).toLocaleString()}
                                </span>
                            </div>
                        {/if}
                        <div class="relay-details">
                            <span class="detail-label">Attempts/Success:</span>
                            <span class="detail-value">
                                {relay.connectionStats.attempts} / {relay.connectionStats.success}
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
        </section>

        <!-- My DM Relays (10050) -->
        <section class="debug-section">
            <h3>My DM Relays (kind 10050)</h3>
            {#if myDMRelays.length > 0}
                <div class="relay-list-simple">
                    {#each myDMRelays as relay}
                        <div class="relay-simple-item">
                            <span class="relay-icon">📡</span>
                            {relay}
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="empty-state">
                    <p>No DM relay list (kind 10050) found.</p>
                    <p class="hint">Using general relay list as fallback.</p>
                </div>
            {/if}
        </section>

        <!-- Counterparty Information -->
        {#if selectedContact}
            <section class="debug-section">
                <h3>Selected Contact</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Display Name:</span>
                        <span class="info-value">
                            {selectedContact.user.profile?.displayName ||
                                selectedContact.user.profile?.name ||
                                "N/A"}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">npub:</span>
                        <span class="info-value mono">
                            {selectedContact.user.npub.slice(0, 20)}...
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">pubkey:</span>
                        <span class="info-value mono">
                            {selectedContact.user.pubkey.slice(0, 16)}...{selectedContact.user.pubkey.slice(-8)}
                        </span>
                    </div>
                </div>

                <h4>Contact's DM Relays (kind 10050)</h4>
                {#if counterpartyDMRelays.length > 0}
                    <div class="relay-list-simple">
                        {#each counterpartyDMRelays as relay}
                            <div class="relay-simple-item">
                                <span class="relay-icon">📡</span>
                                {relay}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="empty-state">
                        <p>No DM relay list (kind 10050) found for this contact.</p>
                        <p class="hint">Using general relay list as fallback.</p>
                    </div>
                {/if}
            </section>

            <!-- Conversation Information -->
            {#if conversationInfo}
                <section class="debug-section">
                    <h3>Conversation Details</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Conversation ID:</span>
                            <span class="info-value mono">
                                {conversationInfo.id ? conversationInfo.id.slice(0, 30) + '...' : 'N/A'}
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Messages:</span>
                            <span class="info-value">{conversationInfo.messageCount}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Participants:</span>
                            <span class="info-value">{conversationInfo.participants.length}</span>
                        </div>
                    </div>
                </section>
            {/if}
        {:else}
            <section class="debug-section">
                <div class="empty-state">
                    <p>Select a contact to see conversation details</p>
                </div>
            </section>
        {/if}

        <!-- Current User Info -->
        <section class="debug-section">
            <h3>Current User</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Display Name:</span>
                    <span class="info-value">
                        {currentUser.profile?.displayName ||
                            currentUser.profile?.name ||
                            "N/A"}
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">npub:</span>
                    <span class="info-value mono">
                        {currentUser.npub.slice(0, 20)}...
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">pubkey:</span>
                    <span class="info-value mono">
                        {currentUser.pubkey.slice(0, 16)}...{currentUser.pubkey.slice(-8)}
                    </span>
                </div>
            </div>
        </section>
    {/if}
</div>

<style>
    .debug-view {
        padding: 1rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
    }

    .debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #fff;
    }

    h3 {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    h4 {
        margin: 1rem 0 0.5rem 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .refresh-button {
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: #fff;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
    }

    .refresh-button:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.05);
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 3rem;
        color: rgba(255, 255, 255, 0.6);
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .debug-section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
    }

    .relay-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .relay-item {
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
    }

    .relay-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .relay-url {
        font-family: monospace;
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
    }

    .relay-details {
        display: flex;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 0.25rem;
    }

    .detail-label {
        font-weight: 500;
    }

    .detail-value {
        color: rgba(255, 255, 255, 0.8);
    }

    .relay-list-simple {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .relay-simple-item {
        padding: 0.5rem 0.75rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.8125rem;
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .relay-icon {
        font-size: 0.875rem;
    }

    .empty-state {
        padding: 1.5rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
    }

    .empty-state p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
    }

    .hint {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.4);
        font-style: italic;
    }

    .info-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem 0.75rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .info-label {
        font-size: 0.6875rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .info-value {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.9);
    }

    .mono {
        font-family: monospace;
        font-size: 0.8125rem;
    }
</style>
