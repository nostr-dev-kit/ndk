<script lang="ts">
    import { tick } from "svelte";
    import type { NDKMessenger, NDKConversation, NDKMessage } from "@nostr-dev-kit/messages";
    import type { Contact } from "../lib/types";
    import type { NDKSvelte } from "@nostr-dev-kit/svelte";

    let {
        contact = $bindable(),
        messenger,
        myPubkey,
        ndk
    }: {
        contact: Contact | null;
        messenger: NDKMessenger;
        myPubkey: string;
        ndk: NDKSvelte;
    } = $props();

    let messages = $state<NDKMessage[]>([]);
    let conversation = $state<NDKConversation | null>(null);
    let messageInput = $state("");
    let messagesContainer = $state<HTMLDivElement>();
    let isLoading = $state(false);
    let isSending = $state(false);
    let contactProfile = $state(null);
    let messageProfiles = $state<Map<string, any>>(new Map());

    $effect(() => {
        if (contact) {
            loadConversation();
            // Fetch contact profile
            const user = ndk.getUser({ pubkey: contact.user.pubkey });
            user.fetchProfile().then(p => contactProfile = p);
        } else {
            contactProfile = null;
        }

        return () => {
            // Cleanup: remove message listener when contact changes or component unmounts
            if (conversation) {
                conversation.off("message", handleNewMessage);
            }
        };
    });

    // Fetch profiles for all message senders
    $effect(() => {
        const newProfiles = new Map(messageProfiles);
        for (const message of messages) {
            const pubkey = message.sender.pubkey;
            if (!newProfiles.has(pubkey)) {
                const user = ndk.getUser({ pubkey });
                user.fetchProfile().then(p => {
                    messageProfiles.set(pubkey, p);
                    messageProfiles = new Map(messageProfiles); // Trigger reactivity
                });
            }
        }
    });

    async function loadConversation() {
        if (!contact) return;

        isLoading = true;
        messages = [];

        try {
            // Get or create conversation
            conversation = await messenger.getConversation(contact.user);

            // Load messages
            messages = await conversation.getMessages(50);

            // Listen for new messages in this conversation
            conversation.on("message", handleNewMessage);

            // Mark as read
            await conversation.markAsRead();

            // Scroll to bottom
            await tick();
            scrollToBottom();
        } catch (e) {
            console.error("Error loading conversation:", e);
        } finally {
            isLoading = false;
        }
    }

    function handleNewMessage(message: NDKMessage) {
        messages = [...messages, message];
        tick().then(scrollToBottom);
    }

    async function sendMessage() {
        if (!messageInput.trim() || !conversation || isSending) return;

        const content = messageInput.trim();
        messageInput = "";
        isSending = true;

        try {
            await conversation.sendMessage(content);
        } catch (e) {
            console.error("Error sending message:", e);
            messageInput = content; // Restore message on error
        } finally {
            isSending = false;
        }
    }

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function formatTime(timestamp?: number): string {
        if (!timestamp) return "";
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatDate(timestamp?: number): string {
        if (!timestamp) return "";
        const date = new Date(timestamp * 1000);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString();
        }
    }
</script>

<div class="icq-chat">
    {#if contact}
        <div class="icq-chat-header">
            <div class="icq-contact-status online"></div>
            <strong>
                {contactProfile?.displayName ||
                 contactProfile?.name ||
                 contact.user.npub.slice(0, 20) + "..."}
            </strong>
        </div>

        <div class="icq-chat-messages" bind:this={messagesContainer}>
            {#if isLoading}
                <div class="icq-loading">
                    <div class="icq-spinner"></div>
                    Loading messages...
                </div>
            {:else if messages.length === 0}
                <div class="icq-status-message">
                    No messages yet. Say hi! 👋
                </div>
            {:else}
                {#each messages as message, i (message.id)}
                    {@const isMe = message.sender.pubkey === myPubkey}
                    {@const showDate = i === 0 || formatDate(messages[i - 1].created_at) !== formatDate(message.created_at)}
                    {@const senderProfile = messageProfiles.get(message.sender.pubkey)}

                    {#if showDate && message.created_at}
                        <div style="text-align: center; color: #999; font-size: 10px; margin: 12px 0;">
                            {formatDate(message.created_at)}
                        </div>
                    {/if}

                    <div class="icq-message" class:me={isMe}>
                        <div class="icq-message-sender">
                            {#if isMe}
                                You
                            {:else}
                                {senderProfile?.displayName || senderProfile?.name || message.sender.npub.slice(0, 16) + "..."}
                            {/if}
                            <span class="icq-message-time">
                                {formatTime(message.created_at)}
                            </span>
                        </div>
                        <div class="icq-message-content">
                            {message.content}
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

        <div class="icq-chat-input-area">
            <textarea
                class="icq-chat-input"
                placeholder="Type a message..."
                bind:value={messageInput}
                onkeydown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
                disabled={isSending}
            ></textarea>
            <div class="icq-chat-buttons">
                <button
                    class="icq-button-small"
                    onclick={sendMessage}
                    disabled={!messageInput.trim() || isSending}
                >
                    {isSending ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    {:else}
        <div class="icq-status-message" style="display: flex; align-items: center; justify-content: center; height: 100%;">
            Select a contact to start chatting
        </div>
    {/if}
</div>
