# NDK Session Monitor Example

This is a simple React application that demonstrates how to use the session monitor functionality from `@nostr-dev-kit/react`.

## Running the Example

This example is designed to work with the local ndk-hooks codebase. It imports directly from the source code rather than using the published package.

### Setup

1. Make sure you have the ndk-hooks dependencies installed:
   ```bash
   cd ndk-hooks
   npm install
   ```

2. Build the ndk-hooks package:
   ```bash
   npm run build
   ```

3. Install the example dependencies:
   ```bash
   cd example/session
   npm install
   ```

4. Run the example using Vite:
   ```bash
   npm run dev
   ```

This will start a development server, typically at http://localhost:5173, where you can see the example running.

## Code Explanation

The key components of this example are:

1. **NDK Initialization**: 
   ```typescript
   const ndkInstance = new NDK({
     explicitRelayUrls: [
       'wss://relay.damus.io',
       'wss://relay.nostr.band',
       'wss://nos.lol',
     ],
   });
   ```

2. **Session Storage Setup**:
This instructs NDK to store sessions in the brower's local storage.
   ```typescript
   const sessionStorage = useNDKSessionLocalStorage();
   useNDKSessionMonitor(sessionStorage);
   ```

3. **Signers**:
   ```typescript
   // With browser extension
   const signer = new NDKNip07Signer();
   await login(signer, true);
   
   // With private key
   const signer = new NDKPrivateKeySigner(privateKey);
   await login(signer, true);
   
   // Generate new key
   const signer = NDKPrivateKeySigner.generate();
   await login(signer, true);
   ```

4. **Session Management**:
   ```typescript
   // Logout
   logout(currentPubkey);
   
   // Access current user
   const currentUser = useNDKCurrentUser();
   const currentPubkey = useNDKCurrentPubkey();
   const currentProfile = useCurrentUserProfile();
   ```