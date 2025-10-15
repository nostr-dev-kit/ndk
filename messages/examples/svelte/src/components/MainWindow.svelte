<script lang="ts">
    import { untrack } from "svelte";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import type { NDKSvelte } from "@nostr-dev-kit/svelte";
    import type { NDKMessenger, NDKConversation, NDKMessage } from "@nostr-dev-kit/messages";
    import BuddyList from "./BuddyList.svelte";
    import ChatWindow from "./ChatWindow.svelte";
    import DebugView from "./DebugView.svelte";
    import IcqLogo from "./IcqLogo.svelte";
    import type { Contact } from "../lib/types";

    let { ndk, messenger } = $props<{ ndk: NDKSvelte; messenger: NDKMessenger }>();

    let contacts = $state<Contact[]>([]);
    let selectedContact = $state<Contact | null>(null);
    let showDebug = $state(false);

    $effect(() => {
        const currentUser = ndk.$currentUser;

        if (currentUser) {
            loadConversations();
        }
    });

    $effect(() => {
        // Listen for new messages
        messenger.on("message", handleNewMessage);

        return () => {
            messenger.off("message", handleNewMessage);
        };
    });

    async function loadConversations() {
        try {
            const conversations = await messenger.getConversations();

            // Convert conversations to contacts
            contacts = conversations.map(conv => {
                const otherUser = conv.getOtherParticipant();
                return {
                    user: otherUser!,
                    status: "online" as const,
                    unreadCount: conv.getUnreadCount(),
                    lastMessage: conv.getLastMessage(),
                };
            });
        } catch (e) {
            console.error("Error loading conversations:", e);
        }
    }

    function handleNewMessage(message: NDKMessage) {
        const myPubkey = ndk.$currentUser?.pubkey;
        if (!myPubkey) return;

        // Update contact list
        const contactIndex = contacts.findIndex(c =>
            c.user.pubkey === message.sender.pubkey ||
            c.user.pubkey === message.recipient?.pubkey
        );

        if (contactIndex >= 0) {
            contacts[contactIndex].lastMessage = message;
            if (message.sender.pubkey !== myPubkey) {
                contacts[contactIndex].unreadCount++;
            }
        } else {
            // New conversation
            const otherUser = message.sender.pubkey === myPubkey
                ? message.recipient!
                : message.sender;

            contacts = [...contacts, {
                user: otherUser,
                status: "online",
                unreadCount: message.sender.pubkey === myPubkey ? 0 : 1,
                lastMessage: message,
            }];
        }
    }

    function handleSelectContact(contact: Contact) {
        selectedContact = contact;

        // Mark as read
        const contactIndex = contacts.findIndex(c => c.user.pubkey === selectedContact!.user.pubkey);
        if (contactIndex >= 0) {
            contacts[contactIndex].unreadCount = 0;
        }
    }

    async function handleAddContact(payload: string) {
        try {
            const user = await ndk.fetchUser(payload);

            if (!user) {
                alert("User not found");
                return;
            }

            // Check if contact already exists
            if (contacts.find(c => c.user.pubkey === user.pubkey)) {
                alert("Contact already exists!");
                return;
            }

            contacts = [...contacts, {
                user,
                status: "online",
                unreadCount: 0,
            }];

            // Auto-select the new contact
            selectedContact = contacts[contacts.length - 1];
        } catch (e) {
            alert("Invalid npub, pubkey, or NIP-05 address");
            console.error(e);
        }
    }
</script>

<div class="icq-window icq-window-large">
    <div class="icq-titlebar">
        {#if ndk.$currentUser}
            {@const myProfile = ndk.$fetchProfile(() => ndk.$currentUser.pubkey)}
            <span class="icq-titlebar-text"><IcqLogo size={14} /> ICQ - {myProfile?.displayName || myProfile?.name || "User"}</span>
        {:else}
            <span class="icq-titlebar-text"><IcqLogo size={14} /> ICQ - User</span>
        {/if}
        <div class="icq-titlebar-buttons">
            <button
                class="icq-debug-button"
                class:active={showDebug}
                onclick={() => (showDebug = !showDebug)}
                title="Toggle Debug Info"
            >
                🐛
            </button>
            <button class="icq-titlebar-button">_</button>
            <button class="icq-titlebar-button">□</button>
            <button class="icq-titlebar-button">×</button>
        </div>
    </div>

    {#if ndk.$currentUser}
        <div class="icq-main">
            <BuddyList
                {contacts}
                {selectedContact}
                currentUser={ndk.$currentUser}
                {ndk}
                onSelectContact={handleSelectContact}
                onAddContact={handleAddContact}
            />

            {#if showDebug}
                <DebugView
                    {ndk}
                    {messenger}
                    currentUser={ndk.$currentUser}
                    {selectedContact}
                />
            {:else}
                <ChatWindow
                    contact={selectedContact}
                    {messenger}
                    myPubkey={ndk.$currentUser.pubkey}
                    {ndk}
                />
            {/if}
        </div>
    {:else}
        <div class="icq-loading" style="flex: 1;">
            <div class="icq-spinner"></div>
            Loading...
        </div>
    {/if}
</div>

<style>
    .icq-debug-button {
        background: none;
        border: none;
        font-size: 14px;
        cursor: pointer;
        padding: 0 8px;
        opacity: 0.6;
        transition: opacity 0.2s;
    }

    .icq-debug-button:hover {
        opacity: 1;
    }

    .icq-debug-button.active {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
    }
</style>
