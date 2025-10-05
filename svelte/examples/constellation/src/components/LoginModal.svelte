<script lang="ts">
  import { ndk, fetchUserRelays } from '../lib/ndk';
  import { NDKNip07Signer, NDKPrivateKeySigner, NDKNip46Signer, nip19 } from '@nostr-dev-kit/ndk';
  import QRCode from 'qrcode';

  type LoginMethod = 'select' | 'nip07' | 'nip46-bunker' | 'nip46-qr' | 'nsec' | 'register';

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();

  let currentMethod = $state<LoginMethod>('select');
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  // NIP-46 bunker flow
  let bunkerUrl = $state('');

  // NIP-46 QR code flow
  let nostrConnectUrl = $state('');
  let qrCodeDataUrl = $state<string | null>(null);

  // nsec flow
  let nsecInput = $state('');

  // Register flow
  let newAccountGenerated = $state(false);
  let generatedNsec = $state('');
  let generatedNpub = $state('');

  async function handleNip07Login() {
    isLoading = true;
    error = null;

    try {
      if (!window.nostr) {
        throw new Error('No NIP-07 extension found. Please install Alby, nos2x, or similar.');
      }

      const signer = new NDKNip07Signer();
      await signer.blockUntilReady();
      await ndk.sessions.login(signer);

      await fetchUserRelays();
      onClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to login with NIP-07';
    } finally {
      isLoading = false;
    }
  }

  async function handleBunkerLogin() {
    if (!bunkerUrl.trim()) {
      error = 'Please enter a bunker:// URL';
      return;
    }

    isLoading = true;
    error = null;

    try {
      const signer = new NDKNip46Signer(ndk, bunkerUrl);
      await signer.blockUntilReady();
      await ndk.sessions.login(signer);

      await fetchUserRelays();
      onClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to login with bunker URL';
    } finally {
      isLoading = false;
    }
  }

  async function handleGenerateQRCode() {
    isLoading = true;
    error = null;

    try {
      // Generate a local signer for this session
      const localSigner = NDKPrivateKeySigner.generate();
      const localUser = await localSigner.user();

      // Create nostrconnect:// URL
      const pubkey = localUser.pubkey;
      const relays = Array.from(ndk.pool.relays.keys()).slice(0, 3);
      const relayParams = relays.map(r => `relay=${encodeURIComponent(r)}`).join('&');
      nostrConnectUrl = `nostrconnect://${pubkey}?${relayParams}&metadata={"name":"Constellation"}`;

      // Generate QR code
      qrCodeDataUrl = await QRCode.toDataURL(nostrConnectUrl);

      // Set up the signer
      const signer = new NDKNip46Signer(ndk, nostrConnectUrl, localSigner);

      // Wait for remote signer to connect (with timeout)
      const timeout = setTimeout(() => {
        error = 'Connection timeout. Please try again.';
        isLoading = false;
      }, 120000); // 2 minute timeout

      await signer.blockUntilReady();
      clearTimeout(timeout);

      await ndk.sessions.login(signer);

      await fetchUserRelays();
      onClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to generate QR code';
    } finally {
      isLoading = false;
    }
  }

  async function handleNsecLogin() {
    if (!nsecInput.trim()) {
      error = 'Please enter your nsec';
      return;
    }

    isLoading = true;
    error = null;

    try {
      // Decode nsec
      const decoded = nip19.decode(nsecInput.trim());
      if (decoded.type !== 'nsec') {
        throw new Error('Invalid nsec format');
      }

      const privateKey = decoded.data as Uint8Array;
      const signer = new NDKPrivateKeySigner(privateKey);
      await ndk.sessions.login(signer);

      await fetchUserRelays();
      onClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to login with nsec';
    } finally {
      isLoading = false;
    }
  }

  function handleGenerateNewAccount() {
    try {
      const signer = NDKPrivateKeySigner.generate();
      signer.user().then(user => {
        generatedNpub = user.npub;
      });

      // Get the private key as hex string
      const privateKeyHex = signer.privateKey;
      if (privateKeyHex) {
        // Convert hex string to Uint8Array for nip19.nsecEncode
        const privateKeyBytes = new Uint8Array(privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        generatedNsec = nip19.nsecEncode(privateKeyBytes);
        newAccountGenerated = true;
        error = null;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to generate new account';
    }
  }

  async function handleUseNewAccount() {
    isLoading = true;
    error = null;

    try {
      const decoded = nip19.decode(generatedNsec);
      const privateKey = decoded.data as Uint8Array;
      const signer = new NDKPrivateKeySigner(privateKey);
      await ndk.sessions.login(signer);

      await fetchUserRelays();
      onClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to use new account';
    } finally {
      isLoading = false;
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
</script>

<div class="modal-backdrop" onclick={onClose} role="presentation">
  <div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
    <div class="modal-header">
      <h2>Login to Constellation</h2>
      <button class="close-btn" onclick={onClose} type="button" aria-label="Close">×</button>
    </div>

    <div class="modal-content">
      {#if error}
        <div class="error-banner">
          <span class="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      {/if}

      {#if currentMethod === 'select'}
        <div class="login-methods">
          <button
            class="method-btn"
            onclick={() => (currentMethod = 'nip07')}
            type="button"
          >
            <span class="method-icon">🔌</span>
            <div class="method-info">
              <h3>Browser Extension</h3>
              <p>Login with Alby, nos2x, or similar (NIP-07)</p>
            </div>
          </button>

          <button
            class="method-btn"
            onclick={() => (currentMethod = 'nip46-bunker')}
            type="button"
          >
            <span class="method-icon">🔗</span>
            <div class="method-info">
              <h3>Bunker URL</h3>
              <p>Login with bunker:// URL (NIP-46)</p>
            </div>
          </button>

          <button
            class="method-btn"
            onclick={() => (currentMethod = 'nip46-qr')}
            type="button"
          >
            <span class="method-icon">📱</span>
            <div class="method-info">
              <h3>QR Code</h3>
              <p>Scan with mobile app (NIP-46)</p>
            </div>
          </button>

          <button class="method-btn" onclick={() => (currentMethod = 'nsec')} type="button">
            <span class="method-icon">🔑</span>
            <div class="method-info">
              <h3>Private Key</h3>
              <p>Login with your nsec</p>
            </div>
          </button>

          <button class="method-btn register" onclick={() => (currentMethod = 'register')} type="button">
            <span class="method-icon">✨</span>
            <div class="method-info">
              <h3>New Account</h3>
              <p>Generate a new Nostr account</p>
            </div>
          </button>
        </div>
      {:else if currentMethod === 'nip07'}
        <div class="login-flow">
          <button class="back-btn" onclick={() => (currentMethod = 'select')} type="button">
            ← Back
          </button>
          <h3>Browser Extension Login</h3>
          <p>Click the button below to connect with your browser extension (Alby, nos2x, etc.)</p>
          <button
            class="primary-btn"
            onclick={handleNip07Login}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? 'Connecting...' : 'Connect Extension'}
          </button>
        </div>
      {:else if currentMethod === 'nip46-bunker'}
        <div class="login-flow">
          <button class="back-btn" onclick={() => (currentMethod = 'select')} type="button">
            ← Back
          </button>
          <h3>Bunker URL Login</h3>
          <p>Enter your bunker:// URL to connect</p>
          <input
            type="text"
            placeholder="bunker://..."
            bind:value={bunkerUrl}
            class="text-input"
          />
          <button
            class="primary-btn"
            onclick={handleBunkerLogin}
            disabled={isLoading || !bunkerUrl.trim()}
            type="button"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      {:else if currentMethod === 'nip46-qr'}
        <div class="login-flow">
          <button class="back-btn" onclick={() => (currentMethod = 'select')} type="button">
            ← Back
          </button>
          <h3>QR Code Login</h3>
          {#if !qrCodeDataUrl}
            <p>Generate a QR code to scan with your mobile app</p>
            <button
              class="primary-btn"
              onclick={handleGenerateQRCode}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? 'Generating...' : 'Generate QR Code'}
            </button>
          {:else}
            <p>Scan this QR code with your Nostr mobile app</p>
            <div class="qr-container">
              <img src={qrCodeDataUrl} alt="QR Code" />
            </div>
            <p class="waiting-text">Waiting for connection...</p>
          {/if}
        </div>
      {:else if currentMethod === 'nsec'}
        <div class="login-flow">
          <button class="back-btn" onclick={() => (currentMethod = 'select')} type="button">
            ← Back
          </button>
          <h3>Private Key Login</h3>
          <p class="warning">
            <span class="warning-icon">⚠️</span>
            Never share your nsec with anyone. We recommend using a browser extension instead.
          </p>
          <input
            type="password"
            placeholder="nsec1..."
            bind:value={nsecInput}
            class="text-input"
          />
          <button
            class="primary-btn"
            onclick={handleNsecLogin}
            disabled={isLoading || !nsecInput.trim()}
            type="button"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      {:else if currentMethod === 'register'}
        <div class="login-flow">
          <button class="back-btn" onclick={() => (currentMethod = 'select')} type="button">
            ← Back
          </button>
          <h3>Create New Account</h3>
          {#if !newAccountGenerated}
            <p>Generate a new Nostr account to get started</p>
            <button class="primary-btn" onclick={handleGenerateNewAccount} type="button">
              Generate Account
            </button>
          {:else}
            <div class="account-generated">
              <p class="success">✅ New account generated!</p>
              <div class="key-display">
                <label>Your npub (public key):</label>
                <div class="key-box">
                  <code>{generatedNpub}</code>
                  <button
                    class="copy-btn"
                    onclick={() => copyToClipboard(generatedNpub)}
                    type="button"
                    title="Copy"
                  >
                    📋
                  </button>
                </div>
              </div>
              <div class="key-display">
                <label>Your nsec (private key):</label>
                <div class="key-box danger">
                  <code>{generatedNsec}</code>
                  <button
                    class="copy-btn"
                    onclick={() => copyToClipboard(generatedNsec)}
                    type="button"
                    title="Copy"
                  >
                    📋
                  </button>
                </div>
                <p class="warning">
                  <span class="warning-icon">⚠️</span>
                  Save your nsec in a safe place! You'll need it to access your account. If you lose
                  it, you cannot recover your account.
                </p>
              </div>
              <button
                class="primary-btn"
                onclick={handleUseNewAccount}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? 'Logging in...' : 'Use This Account'}
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }

  .modal-content {
    padding: 1.5rem;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    color: #ef4444;
    margin-bottom: 1rem;
  }

  .error-icon {
    font-size: 1.25rem;
  }

  .login-methods {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .method-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .method-btn:hover {
    border-color: var(--accent-purple);
    background: var(--bg-card);
    transform: translateX(4px);
  }

  .method-btn.register {
    border-color: var(--accent-purple);
    background: rgba(168, 85, 247, 0.1);
  }

  .method-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .method-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .method-info p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .login-flow {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .back-btn {
    align-self: flex-start;
    background: none;
    border: none;
    color: var(--accent-purple);
    cursor: pointer;
    padding: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .back-btn:hover {
    transform: translateX(-4px);
  }

  .login-flow h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .login-flow p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .text-input {
    width: 100%;
    padding: 0.75rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-family: 'Monaco', 'Menlo', monospace;
    transition: all 0.2s;
  }

  .text-input:focus {
    outline: none;
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  .primary-btn {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    border: none;
    border-radius: 0.5rem;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(168, 85, 247, 0.4);
  }

  .primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 0.5rem;
    color: #fbbf24;
    font-size: 0.75rem;
  }

  .warning-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .qr-container {
    display: flex;
    justify-content: center;
    padding: 1rem;
    background: white;
    border-radius: 0.75rem;
  }

  .qr-container img {
    max-width: 100%;
    height: auto;
  }

  .waiting-text {
    text-align: center;
    color: var(--accent-purple);
    font-weight: 500;
  }

  .account-generated {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .success {
    color: #10b981;
    font-weight: 600;
    text-align: center;
  }

  .key-display {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .key-display label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .key-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .key-box.danger {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.05);
  }

  .key-box code {
    flex: 1;
    font-size: 0.75rem;
    color: var(--text-primary);
    font-family: 'Monaco', 'Menlo', monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem;
    flex-shrink: 0;
    transition: transform 0.2s;
  }

  .copy-btn:hover {
    transform: scale(1.2);
  }

  @media (max-width: 640px) {
    .modal {
      max-width: 100%;
      margin: 0;
      border-radius: 1rem 1rem 0 0;
      max-height: 95vh;
    }

    .modal-backdrop {
      align-items: flex-end;
      padding: 0;
    }
  }
</style>
