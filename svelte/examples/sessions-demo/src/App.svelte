<script lang="ts">
  import { NDKSvelte } from "@nostr-dev-kit/svelte"
  import { NDKPrivateKeySigner, NDKNip07Signer, NDKNip46Signer } from "@nostr-dev-kit/ndk"
  import QRCode from "qrcode"
  import SigVerifyWorker from './sig-verify.worker.ts?worker'

  // Initialize signature verification worker
  const sigVerifyWorker = new SigVerifyWorker()

  // Initialize NDK with reactive stores
  const ndk = new NDKSvelte({
    explicitRelayUrls: [
      'wss://relay.primal.net'
    ],
    signatureVerificationWorker: sigVerifyWorker,
    initialValidationRatio: 1.0,
    lowestValidationRatio: 0.1,
  })

  // Connect to relays
  let initialized = $state(false)
  ndk.connect().then(() => {
    initialized = true
  })

  const currentProfile = $derived(
    ndk.$sessions.current ? ndk.$fetchProfile(() => ndk.$sessions.current?.pubkey) : null
  )

  // Login form state
  let showLoginModal = $state(false)
  let nsecInput = $state('')
  let bunkerInput = $state('')
  let loginError = $state('')
  let loginLoading = $state(false)

  // NIP-46 nostrconnect:// flow state
  let nip46Mode = $state<'bunker' | 'nostrconnect'>('bunker')
  let nostrConnectUri = $state<string | undefined>(undefined)
  let qrCodeDataUrl = $state<string | undefined>(undefined)

  // Generate a new signer for demo
  async function generateAndLogin() {
    const signer = NDKPrivateKeySigner.generate()
    await ndk.$sessions.login(signer, {
      profile: true,
      follows: true,
      mutes: true
    })
  }

  // Login with NIP-07 (browser extension)
  async function loginWithNip07() {
    loginLoading = true
    loginError = ''
    try {
      const signer = new NDKNip07Signer()
      await ndk.$sessions.login(signer, {
        profile: true,
        follows: true,
        mutes: true
      })
      showLoginModal = false
    } catch (error) {
      loginError = error instanceof Error ? error.message : 'Failed to connect to extension'
    } finally {
      loginLoading = false
    }
  }

  // Login with nsec
  async function loginWithNsec() {
    if (!nsecInput.trim()) {
      loginError = 'Please enter an nsec'
      return
    }

    loginLoading = true
    loginError = ''
    try {
      const signer = new NDKPrivateKeySigner(nsecInput.trim())
      await ndk.$sessions.login(signer, {
        profile: true,
        follows: true,
        mutes: true
      })
      nsecInput = ''
      showLoginModal = false
    } catch (error) {
      loginError = error instanceof Error ? error.message : 'Invalid nsec'
    } finally {
      loginLoading = false
    }
  }

  // Login with NIP-46 bunker:// URI (paste from remote signer)
  async function loginWithBunker() {
    if (!bunkerInput.trim()) {
      loginError = 'Please enter a bunker:// URI'
      return
    }

    loginLoading = true
    loginError = ''
    try {
      const signer = new NDKNip46Signer(ndk, bunkerInput.trim())
      await signer.blockUntilReady()
      await ndk.$sessions.login(signer, {
        profile: true,
        follows: true,
        mutes: true
      })
      bunkerInput = ''
      showLoginModal = false
    } catch (error) {
      loginError = error instanceof Error ? error.message : 'Failed to connect via bunker://'
    } finally {
      loginLoading = false
    }
  }

  // Generate nostrconnect:// URI for remote signer to scan
  async function generateNostrConnect() {
    loginLoading = true
    loginError = ''
    try {
      // Use the first relay from NDK config
      const relay = ndk.pool.relays.values().next().value?.url || 'wss://relay.damus.io'

      const signer = NDKNip46Signer.nostrconnect(ndk, relay)

      // Get the generated URI
      nostrConnectUri = signer.nostrConnectUri

      if (!nostrConnectUri) {
        throw new Error('Failed to generate nostrconnect URI')
      }

      // Generate QR code
      qrCodeDataUrl = await QRCode.toDataURL(nostrConnectUri, {
        width: 300,
        margin: 2,
      })

      // Wait for the remote signer to scan and connect
      await signer.blockUntilReady()
      await ndk.$sessions.login(signer, {
        profile: true,
        follows: true,
        mutes: true
      })

      // Reset state and close modal
      nostrConnectUri = undefined
      qrCodeDataUrl = undefined
      showLoginModal = false
    } catch (error) {
      loginError = error instanceof Error ? error.message : 'Failed to generate nostrconnect URI'
    } finally {
      loginLoading = false
    }
  }

  // Login with another account
  async function addAnotherAccount() {
    const signer = NDKPrivateKeySigner.generate()
    await ndk.$sessions.add(signer, {
      profile: true,
      follows: true,
      mutes: true
    })
  }

  // Switch to a different session
  function switchSession(pubkey: string) {
    ndk.$sessions.switch(pubkey)
  }

  // Logout current session
  function logout() {
    ndk.$sessions.logout()
  }

  // Logout all sessions
  function logoutAll() {
    ndk.$sessions.logoutAll()
  }

  // Open login modal
  function openLoginModal() {
    showLoginModal = true
    loginError = ''
    nsecInput = ''
    bunkerInput = ''
    nip46Mode = 'bunker'
    nostrConnectUri = undefined
    qrCodeDataUrl = undefined
  }
</script>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  h1 {
    color: #333;
    border-bottom: 2px solid #0066cc;
    padding-bottom: 10px;
  }
  .section {
    margin: 30px 0;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }
  .section h2 {
    margin-top: 0;
    color: #0066cc;
  }
  button {
    padding: 10px 16px;
    margin: 5px 5px 5px 0;
    border: 1px solid #0066cc;
    border-radius: 6px;
    background: #0066cc;
    color: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }
  button:hover {
    background: #0052a3;
    border-color: #0052a3;
  }
  button.secondary {
    background: white;
    color: #0066cc;
  }
  button.secondary:hover {
    background: #f5f5f5;
  }
  button.danger {
    background: #dc3545;
    border-color: #dc3545;
  }
  button.danger:hover {
    background: #c82333;
    border-color: #c82333;
  }
  .info-box {
    background: white;
    padding: 15px;
    border-radius: 6px;
    margin: 10px 0;
    border: 1px solid #ddd;
  }
  .info-row {
    display: flex;
    gap: 10px;
    margin: 8px 0;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    font-weight: 600;
    color: #666;
    min-width: 120px;
  }
  .info-value {
    color: #333;
    word-break: break-all;
    flex: 1;
    font-family: monospace;
    font-size: 12px;
  }
  .session-card {
    background: white;
    padding: 15px;
    border-radius: 6px;
    margin: 10px 0;
    border: 2px solid #ddd;
  }
  .session-card.active {
    border-color: #0066cc;
    background: #f0f7ff;
  }
  .badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    margin-left: 10px;
  }
  .badge.active {
    background: #0066cc;
    color: white;
  }
  .empty {
    color: #999;
    font-style: italic;
    padding: 20px;
    text-align: center;
  }
  .follows-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }
  .follow-item {
    background: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
    border: 1px solid #ddd;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal {
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  .modal h2 {
    margin-top: 0;
    color: #333;
  }
  .login-method {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .login-method h3 {
    margin-top: 0;
    font-size: 16px;
    color: #0066cc;
  }
  .login-method p {
    color: #666;
    font-size: 13px;
    margin: 8px 0;
  }
  input[type="text"], input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: monospace;
    box-sizing: border-box;
  }
  input[type="text"]:focus, input[type="password"]:focus {
    outline: none;
    border-color: #0066cc;
  }
  .error {
    color: #dc3545;
    font-size: 13px;
    margin: 10px 0;
    padding: 10px;
    background: #fff5f5;
    border: 1px solid #ffcccc;
    border-radius: 6px;
  }
  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }
  .nip46-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  .nip46-tab {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  .nip46-tab:hover {
    background: #f5f5f5;
  }
  .nip46-tab.active {
    background: #0066cc;
    border-color: #0066cc;
    color: white;
    font-weight: 600;
  }
  .qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
  .qr-code {
    border: 4px solid white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .uri-display {
    font-family: monospace;
    font-size: 11px;
    word-break: break-all;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    max-width: 100%;
    color: #666;
  }
  .copy-button {
    padding: 6px 12px;
    font-size: 12px;
  }
</style>

<div class="container">
  <h1>NDK Svelte5 Sessions Demo</h1>

  {#if !initialized}
    <div class="section">
      <p>Initializing...</p>
    </div>
  {:else}
    <!-- Login Section -->
    <div class="section">
      <h2>Login Controls</h2>
      {#if !ndk.$sessions.current}
        <button onclick={openLoginModal} data-testid="login-existing">
          Login with Existing Account
        </button>
        <button class="secondary" onclick={generateAndLogin}>
          Generate & Login with New Account
        </button>
        <p style="color: #666; margin-top: 10px; font-size: 14px;">
          Login with your browser extension (NIP-07), private key (nsec), or remote signer (NIP-46).
        </p>
      {:else}
        <button class="secondary" onclick={addAnotherAccount}>
          Add Another Account
        </button>
        <button class="danger" onclick={logout}>
          Logout Current
        </button>
        <button class="danger" onclick={logoutAll}>
          Logout All
        </button>
      {/if}
    </div>

    <!-- Current Session Info -->
    <div class="section">
      <h2>Current Session</h2>
      {#if ndk.$sessions.current}
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Pubkey:</span>
            <span class="info-value" data-testid="current-pubkey">{ndk.$sessions.current.pubkey}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Profile Name:</span>
            <span class="info-value" data-testid="profile-name">
              {currentProfile?.name || currentProfile?.display_name || currentProfile?.displayName || '(no name set)'}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">About:</span>
            <span class="info-value">
              {currentProfile?.about || '(no bio)'}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Follows:</span>
            <span class="info-value" data-testid="follows-count">{ndk.$sessions.follows.size} pubkeys</span>
          </div>
          <div class="info-row">
            <span class="info-label">Mutes:</span>
            <span class="info-value">{ndk.$sessions.mutes.size} pubkeys</span>
          </div>
        </div>

        <!-- Follows List -->
        {#if ndk.$sessions.follows.size > 0}
          <h3 style="margin-top: 20px;">Following:</h3>
          <div class="follows-list" data-testid="follows-list">
            {#each Array.from(ndk.$sessions.follows) as followPubkey}
              <div class="follow-item">{followPubkey.slice(0, 16)}...</div>
            {/each}
          </div>
        {/if}
      {:else}
        <div class="empty">No active session. Please login to continue.</div>
      {/if}
    </div>

    <!-- All Sessions -->
    <div class="section">
      <h2>All Sessions ({ndk.$sessions.all.length})</h2>
      {#if ndk.$sessions.all.length === 0}
        <div class="empty">No sessions available.</div>
      {:else}
        {#each ndk.$sessions.all as session}
          <div 
            class="session-card" 
            class:active={ndk.$sessions.current?.pubkey === session.pubkey}
            data-testid="session-card"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>Pubkey:</strong>
                <span style="font-family: monospace; font-size: 12px; margin-left: 8px;">
                  {session.pubkey.slice(0, 16)}...
                </span>
                {#if ndk.$sessions.current?.pubkey === session.pubkey}
                  <span class="badge active">Active</span>
                {/if}
              </div>
              {#if ndk.$sessions.current?.pubkey !== session.pubkey}
                <button
                  class="secondary"
                  onclick={() => switchSession(session.pubkey)}
                  data-testid="switch-session"
                >
                  Switch
                </button>
              {/if}
            </div>
            {#if ndk.$sessions.current?.pubkey === session.pubkey}
              <div style="margin-top: 10px; font-size: 13px; color: #666;">
                <div>Follows: {ndk.$sessions.follows.size}</div>
                <div>Mutes: {ndk.$sessions.mutes.size}</div>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<!-- Login Modal -->
{#if showLoginModal}
  <div class="modal-overlay" onclick={() => showLoginModal = false}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <h2>Login to Nostr</h2>

      {#if loginError}
        <div class="error">{loginError}</div>
      {/if}

      <!-- NIP-07 Browser Extension -->
      <div class="login-method">
        <h3>🔌 Browser Extension (NIP-07)</h3>
        <p>Login using a Nostr browser extension like nos2x or Alby</p>
        <button
          onclick={loginWithNip07}
          disabled={loginLoading}
          data-testid="nip07-login"
        >
          {loginLoading ? 'Connecting...' : 'Connect Extension'}
        </button>
      </div>

      <!-- nsec Private Key -->
      <div class="login-method">
        <h3>🔑 Private Key (nsec)</h3>
        <p>Enter your private key (nsec1...)</p>
        <input
          type="password"
          bind:value={nsecInput}
          placeholder="nsec1..."
          disabled={loginLoading}
          data-testid="nsec-input"
        />
        <button
          onclick={loginWithNsec}
          disabled={loginLoading}
          data-testid="nsec-submit"
        >
          {loginLoading ? 'Logging in...' : 'Login with nsec'}
        </button>
      </div>

      <!-- NIP-46 Remote Signer -->
      <div class="login-method">
        <h3>🔗 Remote Signer (NIP-46)</h3>
        <p>Connect using a remote signer application</p>

        <!-- Mode tabs -->
        <div class="nip46-tabs">
          <button
            class="nip46-tab"
            class:active={nip46Mode === 'nostrconnect'}
            onclick={() => nip46Mode = 'nostrconnect'}
            disabled={loginLoading}
          >
            Generate QR Code
          </button>
          <button
            class="nip46-tab"
            class:active={nip46Mode === 'bunker'}
            onclick={() => nip46Mode = 'bunker'}
            disabled={loginLoading}
          >
            Paste bunker:// URI
          </button>
        </div>

        {#if nip46Mode === 'nostrconnect'}
          <!-- nostrconnect:// flow - generate QR for remote signer to scan -->
          {#if qrCodeDataUrl && nostrConnectUri}
            <div class="qr-container">
              <p style="margin: 0; color: #666; font-size: 13px;">
                Scan this QR code with your remote signer app
              </p>
              <img src={qrCodeDataUrl} alt="nostrconnect QR code" class="qr-code" />
              <div class="uri-display">{nostrConnectUri}</div>
              <button
                class="secondary copy-button"
                onclick={() => navigator.clipboard.writeText(nostrConnectUri!)}
              >
                Copy URI
              </button>
              <p style="margin: 0; color: #999; font-size: 12px;">
                Waiting for remote signer to connect...
              </p>
            </div>
          {:else}
            <button
              onclick={generateNostrConnect}
              disabled={loginLoading}
              data-testid="generate-nostrconnect"
            >
              {loginLoading ? 'Generating...' : 'Generate QR Code'}
            </button>
          {/if}
        {:else}
          <!-- bunker:// flow - paste URI from remote signer -->
          <input
            type="text"
            bind:value={bunkerInput}
            placeholder="bunker://..."
            disabled={loginLoading}
            data-testid="bunker-input"
          />
          <button
            onclick={loginWithBunker}
            disabled={loginLoading}
            data-testid="bunker-submit"
          >
            {loginLoading ? 'Connecting...' : 'Connect with bunker://'}
          </button>
        {/if}
      </div>

      <div class="modal-actions">
        <button
          class="secondary"
          onclick={() => showLoginModal = false}
          disabled={loginLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
