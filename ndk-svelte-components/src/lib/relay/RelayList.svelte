<script lang="ts">
    import type { NDKRelay } from '@nostr-dev-kit/ndk';
    import type NDK from '@nostr-dev-kit/ndk';
    import { NDKRelayStatus } from '@nostr-dev-kit/ndk';
    import { onMount } from 'svelte';
    import RelayName from './RelayName.svelte';

    export let ndk: NDK;

    let relays: NDKRelay[] = [];
    let notices: Map<NDKRelay, string[]> = new Map();

    onMount(() => {
        update();
        ndk.pool.on('connect', () => {
            update();
        });
        ndk.pool.on('relay:connect', () => {
            update();
        });
        ndk.pool.on('disconnect', () => {
            update();
        });
        ndk.pool.on('notice', relayNotice);
    });

    function relayNotice(relay: NDKRelay, notice: string) {
        if (!notices.has(relay)) {
            notices.set(relay, []);
        }

        notices.get(relay)?.push(notice);
        notices = notices;

        setTimeout(() => {
            notices.get(relay)?.shift();
            notices = notices;
        }, 60000);
    }

    function update() {
        relays = Array.from(ndk.pool.relays.values());
    }

    let expandSubscriptionList: Record<string, boolean> = {};

    function toggleSubList(relay: NDKRelay) {
        expandSubscriptionList[relay.url] = !expandSubscriptionList[relay.url];
        expandSubscriptionList = expandSubscriptionList;
    }
</script>

<ul>
    {#each relays as relay}
        <li>
            <button
                class="relay-button"
                on:click={() => {
                    toggleSubList(relay);
                }}
            >
                {#if relay.status === NDKRelayStatus.CONNECTING}
                    <span class="relay-status relay-status--connecting" />
                {:else if relay.status === NDKRelayStatus.DISCONNECTED}
                    <span class="relay-status relay-status--disconnected" />
                {:else if relay.status === NDKRelayStatus.CONNECTED}
                    <span class="relay-status relay-status--connected" />
                {:else if relay.status === NDKRelayStatus.FLAPPING}
                    <span class="relay-status relay-status--flapping" />
                {/if}
                <span class="relay-name"><RelayName {relay} /></span>
                {#if relay.activeSubscriptions.size > 0}
                    <div class="relay-subscriptions">
                        {relay.activeSubscriptions.size}
                        {relay.activeSubscriptions.size === 1 ? 'subscription' : 'subscriptions'}
                    </div>
                {/if}
            </button>

            {#if notices.has(relay)}
                <ul>
                    {#each notices.get(relay) as notice}
                        <li class="relay-notice">{notice}</li>
                    {/each}
                </ul>
            {/if}

            {#if expandSubscriptionList[relay.url]}
                <ul>
                    {#each Array.from(relay.activeSubscriptions) as subscription}
                        <li>
                            <div class="relay-subscription-filter">
                                {JSON.stringify(subscription.filter)}
                            </div>
                            <span class="relay-subscription--event-count">
                                {subscription.eventsPerRelay.get(relay)?.size ?? 0} events
                            </span>

                            {#if subscription.eosesSeen.has(relay)}
                                <span class="small-note">EOSE received</span>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {/if}
        </li>
    {/each}
</ul>

<style>
    .relay-name {
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .relay-button {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
    }

    .relay-notice {
        font-size: 0.8em;
        font-weight: 300;
        background-color: #e74c3c88;
        padding: 5px;
        border-radius: 5px;
    }

    .relay-status {
        flex-shrink: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-left: 5px;
    }

    .relay-status--connecting {
        background-color: #f1c40f;
    }

    .relay-status--disconnected {
        background-color: #e74c3c;
    }

    .relay-status--connected {
        background-color: #2ecc71;
    }

    .relay-status--flapping {
        background-color: #3498db;
    }

    .relay-status--flapping::after {
        content: 'flapping';
        color: white;
        font-weight: 500;
        font-size: 0.6em;
    }

    .relay-subscriptions {
        margin-left: 5px;
        float: right;
        font-size: 0.8em;
        font-weight: 300;
        cursor: pointer;
    }

    .relay-subscription-filter {
        font-size: 0.9em;
        font-weight: 300;
        font-family: monospace;
        padding: 5px;
        background-color: white;
        color: #111111;
        border-radius: 5px;
        border: 1px solid #e1e1e1;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        margin-top: 5px;
        overflow: auto;
    }

    .relay-subscription--event-count,
    .small-note {
        font-size: 0.8em;
        font-weight: 300;
        margin-left: 5px;
    }
</style>
