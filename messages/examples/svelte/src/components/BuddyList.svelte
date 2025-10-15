<script lang="ts">
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import type { NDKSvelte } from "@nostr-dev-kit/svelte";
    import type { Contact } from "../lib/types";

    let {
        contacts,
        selectedContact,
        currentUser,
        ndk,
        onSelectContact,
        onAddContact
    } = $props<{
        contacts: Contact[];
        selectedContact: Contact | null;
        currentUser: NDKUser;
        ndk: NDKSvelte;
        onSelectContact: (contact: Contact) => void;
        onAddContact: (payload: string) => Promise<void>;
    }>();

    let showAddContact = $state(false);
    let newContactInput = $state("");

    function handleContactClick(contact: Contact) {
        onSelectContact(contact);
    }

    function handleAddContact() {
        if (newContactInput.trim()) {
            onAddContact(newContactInput.trim());
            newContactInput = "";
            showAddContact = false;
        }
    }

    function formatTime(timestamp?: number): string {
        if (!timestamp) return "";
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
</script>

<div class="icq-buddy-list">
    <div class="icq-status-bar">
        <div class="icq-status-indicator online"></div>
        <div class="icq-user-info">
            {#if currentUser}
                {@const myProfile = ndk.$fetchProfile(() => currentUser.pubkey)}
                {myProfile?.displayName || myProfile?.name || currentUser.npub.slice(0, 16) + "..."}
            {/if}
        </div>
    </div>

    <div class="icq-contacts-header">
        <span>Contacts ({contacts.length})</span>
        <button
            class="icq-button-small"
            style="float: right; padding: 2px 8px; margin-top: -2px;"
            onclick={() => showAddContact = !showAddContact}
        >
            {showAddContact ? "Cancel" : "Add"}
        </button>
    </div>

    {#if showAddContact}
        <div style="padding: 8px; background: #fff8e8; border-bottom: 1px solid #b8c8d8;">
            <input
                type="text"
                class="icq-input"
                placeholder="Enter npub, hex pubkey, or NIP-05"
                bind:value={newContactInput}
                onkeydown={(e) => e.key === 'Enter' && handleAddContact()}
                style="margin-bottom: 6px;"
            />
            <button
                class="icq-button-small"
                onclick={handleAddContact}
                style="width: 100%;"
            >
                Add Contact
            </button>
        </div>
    {/if}

    <div class="icq-contacts-list">
        {#if contacts.length === 0}
            <div class="icq-status-message">
                No contacts yet. Click "Add" to add a contact.
            </div>
        {:else}
            {#each contacts as contact (contact.user.pubkey)}
                {@const contactProfile = ndk.$fetchProfile(() => contact.user.pubkey)}
                <button
                    class="icq-contact"
                    class:selected={selectedContact?.user.pubkey === contact.user.pubkey}
                    onclick={() => handleContactClick(contact)}
                >
                    <div class="icq-contact-status {contact.status}"></div>
                    <div class="icq-contact-name">
                        {contactProfile?.displayName ||
                         contactProfile?.name ||
                         contact.user.npub.slice(0, 16) + "..."}
                    </div>
                    {#if contact.unreadCount > 0}
                        <div class="icq-contact-unread">{contact.unreadCount}</div>
                    {/if}
                </button>
            {/each}
        {/if}
    </div>
</div>
