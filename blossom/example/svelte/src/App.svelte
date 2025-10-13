<script lang="ts">
import { NDKNip07Signer, NDKPrivateKeySigner, NDKBlossomList, NDKKind } from "@nostr-dev-kit/ndk";
import { NDKBlossom } from "@nostr-dev-kit/blossom";
import { NDKSvelte, useBlossomUpload } from "@nostr-dev-kit/svelte";

// Initialize NDK with sessions enabled and configured to fetch blossom list
const ndk = new NDKSvelte({
    explicitRelayUrls: [
        "wss://relay.damus.io",
        "wss://relay.nostr.band",
        "wss://nos.lol"
    ],
    session: {
        fetches: {
            eventConstructors: [NDKBlossomList]
        }
    }
});

// Blossom instance - initialized once
const blossom = new NDKBlossom(ndk);
const upload = useBlossomUpload(blossom);

// Session state - using NDKSvelte reactive APIs
const currentUser = $derived(ndk.$currentUser);
const currentProfile = ndk.$fetchProfile(() => currentUser?.pubkey);
let allSessions = $derived(ndk.$sessions?.sessions ?? {});

// Get blossom server list directly from active session
const currentSession = $derived(ndk.$sessions?.activeSession);
const blossomServerList = $derived(
    currentSession?.events.get(NDKKind.BlossomList) as NDKBlossomList | null
);
const blossomServers = $derived(blossomServerList?.servers ?? []);

// Server management
let newServerUrl = $state("");
let savingServers = $state(false);

// File upload
let selectedFile = $state<File | null>(null);

// Login form
let privateKey = $state("");

$effect(() => {
    ndk.connect();
});

async function loginWithExtension() {
    try {
        const signer = new NDKNip07Signer();
        await ndk.$sessions?.login(signer);
    } catch (error) {
        alert("Failed to login with extension. Make sure you have a Nostr extension installed.");
    }
}

async function loginWithPrivateKey() {
    if (!privateKey) {
        alert("Please enter a private key");
        return;
    }
    try {
        const signer = new NDKPrivateKeySigner(privateKey);
        await ndk.$sessions?.login(signer);
        privateKey = ""; // Clear for security
    } catch (error) {
        alert("Failed to login with private key. Make sure the key is valid.");
    }
}

async function generateAndLogin() {
    const signer = NDKPrivateKeySigner.generate();
    await ndk.$sessions?.login(signer);
}

async function logout() {
    if (currentUser) {
        ndk.$sessions?.logout(currentUser.pubkey);
    }
}

async function switchSession(pubkey: string) {
    ndk.$sessions?.switch(pubkey);
}

function formatPubkey(pubkey: string | null): string {
    if (!pubkey) return "None";
    return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 8)}`;
}

async function addServer() {
    if (!newServerUrl.trim() || !currentUser || !ndk) {
        alert("Please enter a valid server URL and make sure you are logged in");
        return;
    }

    savingServers = true;
    try {
        // Normalize the URL
        let url = newServerUrl.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        // Get or create blossom list
        let list = blossomServerList;
        if (!list) {
            list = new NDKBlossomList(ndk);
        }

        // Add server and publish
        list.addServer(url);
        await list.publish();

        newServerUrl = "";
    } catch (error) {
        alert(`Failed to add server: ${(error as Error).message}`);
    } finally {
        savingServers = false;
    }
}

async function removeServer(serverToRemove: string) {
    if (!currentUser || !ndk || !blossomServerList) return;

    savingServers = true;
    try {
        blossomServerList.removeServer(serverToRemove);
        await blossomServerList.publish();
    } catch (error) {
        alert(`Failed to remove server: ${(error as Error).message}`);
    } finally {
        savingServers = false;
    }
}

function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        selectedFile = target.files[0];
        upload.reset();
    }
}

async function uploadFile() {
    if (!selectedFile || !currentUser) {
        alert("Please select a file and make sure you are logged in");
        return;
    }
    if (blossomServers.length === 0) {
        alert("No Blossom servers found. Please add servers to your profile first.");
        return;
    }

    try {
        await upload.upload(selectedFile);
    } catch (error) {
        alert(`Upload failed: ${(error as Error).message}`);
    }
}
</script>

<div>
    <h1>NDK Blossom Upload Example (Svelte)</h1>
    <p>A demonstration of using @nostr-dev-kit/svelte sessions and blossom for file uploads</p>

    <!-- Current Session Info -->
    <div class="card">
        <h2>Current Session</h2>
        {#if currentUser}
            <div>
                <img
                    src={currentProfile?.image || "https://via.placeholder.com/50"}
                    alt="Profile"
                    class="profile-pic"
                />
                <div>
                    <h3>{currentProfile?.displayName || currentProfile?.name || "Anonymous User"}</h3>
                    <p>{currentProfile?.about || "No bio available"}</p>
                    <p>Pubkey: {formatPubkey(currentUser.pubkey)}</p>
                </div>
                <button type="button" onclick={logout}>Logout</button>
            </div>
        {:else}
            <p>No active session. Please login.</p>
        {/if}
    </div>

    <!-- Available Sessions -->
    <div class="card">
        <h2>Available Sessions</h2>
        {#if Object.keys(allSessions).length > 0}
            <div>
                <p>Select a session to switch:</p>
                <div>
                    {#each Object.entries(allSessions) as [pubkey, session] (pubkey)}
                        <div class="session-item" class:active={pubkey === currentUser?.pubkey}>
                            <div>
                                <strong>{session.profile?.displayName || session.profile?.name || "Anonymous User"}</strong>
                                <p>Pubkey: {formatPubkey(pubkey)}</p>
                            </div>
                            {#if pubkey !== currentUser?.pubkey}
                                <button type="button" onclick={() => switchSession(pubkey)}>
                                    Switch to this session
                                </button>
                            {:else}
                                <span>Active</span>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <p>No saved sessions available.</p>
        {/if}
    </div>

    <!-- Blossom Servers -->
    {#if currentUser}
        <div class="card">
            <h2>Blossom Servers</h2>
            {#if blossomServers.length > 0}
                    <ul>
                        {#each blossomServers as server (server)}
                            <li class="server-item">
                                <span>{server}</span>
                                <button
                                    type="button"
                                    onclick={() => removeServer(server)}
                                    disabled={savingServers}
                                    style="background-color: #dc3545;"
                                >
                                    Remove
                                </button>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p>No Blossom servers configured. Add some servers below to upload files.</p>
                {/if}

            <!-- Add Server Form -->
                <div style="margin-top: 20px; padding: 15px; border: 1px solid #333; border-radius: 4px;">
                    <h3>Add Blossom Server</h3>
                    <p>Enter a Blossom server URL (e.g., blossom.oxtr.dev)</p>
                    <input
                        type="text"
                        bind:value={newServerUrl}
                        placeholder="Enter server URL"
                        disabled={savingServers}
                        onkeydown={(e) => e.key === "Enter" && addServer()}
                    />
                    <button
                        type="button"
                        onclick={addServer}
                        disabled={savingServers || !newServerUrl.trim()}
                    >
                        {savingServers ? "Saving..." : "Add Server"}
                    </button>
                </div>
        </div>
    {/if}

    <!-- File Upload -->
    {#if currentUser}
        <div class="card">
            <h2>File Upload</h2>
            <label class="file-input-label">
                <input
                    type="file"
                    style="display: none;"
                    onchange={handleFileSelect}
                />
                <button type="button" onclick={(e) => { e.preventDefault(); e.currentTarget.parentElement?.querySelector('input')?.click(); }}>
                    Select File
                </button>
            </label>

            {#if selectedFile}
                <div>
                    <p>
                        Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                    <button
                        type="button"
                        onclick={uploadFile}
                        disabled={upload.status === "uploading"}
                    >
                        Upload File
                    </button>

                    {#if upload.status === "uploading"}
                        <div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: {upload.progress?.percentage}%"></div>
                            </div>
                            <p>{upload.progress?.percentage}% uploaded</p>
                        </div>
                    {/if}

                    {#if upload.status === "success" && upload.result?.url}
                        <div>
                            <p>Upload successful!</p>
                            <p>
                                URL: <a href={upload.result.url} target="_blank" rel="noopener noreferrer">
                                    {upload.result.url}
                                </a>
                            </p>
                        </div>
                    {/if}

                    {#if upload.status === "error"}
                        <p style="color: #dc3545;">Upload failed: {upload.error?.message}</p>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- Login Options -->
    {#if !currentUser}
        <div class="card">
            <h2>Login Options</h2>

            <div style="margin-bottom: 2em;">
                <h3>Login with Browser Extension (NIP-07)</h3>
                <p>Use a Nostr browser extension like nos2x or Alby</p>
                <button type="button" onclick={loginWithExtension}>
                    Login with Extension
                </button>
            </div>

            <div style="margin-bottom: 2em;">
                <h3>Login with Private Key</h3>
                <p>Enter your Nostr private key (nsec or hex)</p>
                <input
                    type="password"
                    bind:value={privateKey}
                    placeholder="Enter private key (nsec or hex)"
                />
                <button type="button" onclick={loginWithPrivateKey}>
                    Login with Private Key
                </button>
            </div>

            <div>
                <h3>Generate New Key</h3>
                <p>Create a new Nostr identity</p>
                <button type="button" onclick={generateAndLogin}>
                    Generate & Login
                </button>
            </div>
        </div>
    {/if}
</div>
