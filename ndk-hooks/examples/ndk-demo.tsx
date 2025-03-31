import React, { useEffect } from 'react';
import { useNDK } from '../src/hooks/ndk';
import { useNDKCurrentUser } from '../src/hooks/current-user';
import NDK from '@nostr-dev-kit/ndk';

const NDKDemo = () => {
  const { ndk, setNDK } = useNDK();
  const { currentUser } = useNDKCurrentUser();

  useEffect(() => {
    if (!ndk) {
      const newNdk = new NDK({
        explicitRelayUrls: [
          'wss://relay.damus.io',
          'wss://relay.snort.social',
        ],
      });

      newNdk.on('signer:ready', () => {
        console.log('Signer is ready!');
      });

      setNDK(newNdk);
      newNdk.connect();
    }
  }, [ndk, setNDK]);

  if (!ndk) {
    return <div>Initializing NDK...</div>;
  }

  return (
    <div>
      <h1>NDK Demo</h1>
      <p>NDK is initialized.</p>
      {currentUser ? (
        <div>
          <h2>Current User</h2>
          <p>Pubkey: {currentUser.pubkey}</p>
        </div>
      ) : (
        <p>No current user.</p>
      )}
    </div>
  );
};

export default NDKDemo;