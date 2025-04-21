import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import NDK, {
  useNDKInit,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKSessionLocalStorage,
  useAvailableSessions,
  useNDKSessionSwitch,
  useNDK,
  useNDKCurrentUser,
  useNDKCurrentPubkey,
  useNDKSessionMonitor,
  useNDKSessionLogin,
  useNDKSessionLogout,
  useFollows,
  useCurrentUserProfile,
  useNDKSessionSessions,
} from '../../src';

// Initialize NDK outside of any component
const ndkInstance = new NDK({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol',
  ],
});

// Connect to relays
ndkInstance.connect();

const sessionStorage = new NDKSessionLocalStorage();

// Main App Component
const App: React.FC = () => {
  const initializeNDK = useNDKInit();
  const { ndk } = useNDK();
  const availableSessions = useAvailableSessions();
  const currentUser = useNDKCurrentUser();
  const currentPubkey = useNDKCurrentPubkey();
  const currentProfile = useCurrentUserProfile();
  const switchSession = useNDKSessionSwitch();
  const follows = useFollows();
  const login = useNDKSessionLogin();
  const logout = useNDKSessionLogout();
  const sessions = useNDKSessionSessions();
  
  // State for private key input
  const [privateKey, setPrivateKey] = useState('');
  
  // Initialize NDK on component mount
  useEffect(() => {
    if (!ndk) {
      initializeNDK(ndkInstance);
    }
  }, [ndk, initializeNDK]);
  
  // Set up session storage and monitor
  useNDKSessionMonitor(sessionStorage, { follows: true });
  
  // Login with NIP-07 (browser extension)
  const loginWithExtension = async () => {
    const signer = new NDKNip07Signer();
    await login(signer, true);
  };
  
  // Login with private key
  const loginWithPrivateKey = async () => {
    if (!privateKey) {
      alert('Please enter a private key');
      return;
    }
    
    try {
      const signer = new NDKPrivateKeySigner(privateKey);
      await login(signer, true);
      setPrivateKey(''); // Clear the input for security
      console.log('Logged in with private key');
    } catch (error) {
      console.error('Failed to login with private key:', error);
      alert('Failed to login with private key. Make sure the key is valid.');
    }
  };
  
  // Generate a new private key and login
  const generateAndLogin = async () => {
    const signer = NDKPrivateKeySigner.generate();
    await login(signer, true);
  };
  
  // Logout current user
  const handleLogout = () => {
    if (currentPubkey) {
      logout(currentPubkey);
      console.log('Logged out');
    }
  };
  
  // Format pubkey for display
  const formatPubkey = (pubkey: string | null) => {
    if (!pubkey) return 'None';
    return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 8)}`;
  };
  
  return (
    <div>
      <h1>NDK Session Monitor Example</h1>
      <p>A demonstration of using ndk-hooks session monitor</p>
      
      {/* Current Session Info */}
      <div>
        <h2>Current Session</h2>
        {currentUser ? (
          <div>
            <div>
              <img 
                src={currentProfile?.picture || 'https://via.placeholder.com/50'} 
                alt="Profile" 
                width="50"
                height="50"
              />
              <div>
                <h3>{currentProfile?.name || 'Anonymous User'}</h3>
                <p>{currentProfile?.about || 'No bio available'}</p>
                <p>Pubkey: {formatPubkey(currentPubkey)}</p>
                <p>Following: {follows.size} users</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <p>No active session. Please login.</p>
        )}
      </div>
      
      {/* Available Sessions */}
      <div>
        <h2>Available Sessions</h2>
        {availableSessions.availablePubkeys.length > 0 ? (
          <div>
            <p>Select a session to switch:</p>
            <ul>
              {availableSessions.availablePubkeys.map((pubkey) => {
                const session = sessions.get(pubkey);
                const isActive = pubkey === currentPubkey;
                
                return (
                  <li key={pubkey} data-active={isActive}>
                    <div>
                      <div>
                        <strong>{session?.profile?.name || 'Anonymous User'}</strong>
                        <p>Pubkey: {formatPubkey(pubkey)}</p>
                      </div>
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => switchSession(pubkey)}
                        >
                          Switch to this session
                        </button>
                      )}
                      {isActive && (
                        <span>Active</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p>No saved sessions available.</p>
        )}
      </div>
      
      {/* Login Options */}
      <div>
        <h2>Login Options</h2>
        
        <div>
          <h3>Login with Browser Extension (NIP-07)</h3>
          <p>Use a Nostr browser extension like nos2x or Alby</p>
          <button 
            type="button"
            onClick={loginWithExtension}
          >
            Login with Extension
          </button>
        </div>
        
        <div>
          <h3>Login with Private Key</h3>
          <p>Enter your Nostr private key (nsec or hex)</p>
          <input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Enter private key (nsec or hex)"
          />
          <button 
            type="button"
            onClick={loginWithPrivateKey}
          >
            Login with Private Key
          </button>
        </div>
        
        <div>
          <h3>Generate New Key</h3>
          <p>Create a new Nostr identity</p>
          <button 
            type="button"
            onClick={generateAndLogin}
          >
            Generate & Login
          </button>
        </div>
      </div>
    </div>
  );
};

// Render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;