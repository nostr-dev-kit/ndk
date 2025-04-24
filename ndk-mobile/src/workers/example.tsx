import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import NDK from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { initSignatureVerificationWorklet, verifySignatureAsync } from './index.js';

/**
 * Example component demonstrating the use of the signature verification worklet
 */
export function SignatureVerificationExample() {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [verificationResult, setVerificationResult] = useState<string>('Not verified');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Initialize NDK with the signature verification worklet
  useEffect(() => {
    const initNdk = async () => {
      // Create a new NDK instance
      const ndkInstance = new NDK({
        explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol'],
      });

      // Initialize the signature verification worklet
      initSignatureVerificationWorklet(ndkInstance);

      // Connect to relays
      await ndkInstance.connect();
      setNdk(ndkInstance);
    };

    initNdk();

    // Cleanup
    return () => {
      // Cleanup will be handled by NDK
    };
  }, []);

  // Function to verify a test event
  const verifyTestEvent = async () => {
    if (!ndk) return;

    setIsVerifying(true);
    try {
      // Create a test event
      const event = new NDKEvent(ndk);
      event.kind = 1;
      event.content = 'Hello from NDK Mobile!';
      event.created_at = Math.floor(Date.now() / 1000);
      
      // Sign the event if a signer is available
      if (ndk.signer) {
        await event.sign();
        
        // Verify the signature using our worklet
        const isValid = await verifySignatureAsync(event);
        setVerificationResult(isValid ? 'Valid signature ✅' : 'Invalid signature ❌');
      } else {
        setVerificationResult('No signer available');
      }
    } catch (error) {
      setVerificationResult(`Error: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Function to verify a tampered event
  const verifyTamperedEvent = async () => {
    if (!ndk) return;

    setIsVerifying(true);
    try {
      // Create a test event
      const event = new NDKEvent(ndk);
      event.kind = 1;
      event.content = 'Hello from NDK Mobile!';
      event.created_at = Math.floor(Date.now() / 1000);
      
      // Sign the event if a signer is available
      if (ndk.signer) {
        await event.sign();
        
        // Tamper with the content after signing
        event.content = 'Tampered content!';
        
        // Verify the signature using our worklet
        const isValid = await verifySignatureAsync(event);
        setVerificationResult(isValid ? 'Valid signature ✅' : 'Invalid signature ❌');
      } else {
        setVerificationResult('No signer available');
      }
    } catch (error) {
      setVerificationResult(`Error: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NDK Mobile Signature Verification</Text>
      
      <Text style={styles.status}>
        NDK Status: {ndk ? 'Initialized ✅' : 'Initializing...'}
      </Text>
      
      <Text style={styles.result}>
        Verification Result: {verificationResult}
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Verify Valid Event"
          onPress={verifyTestEvent}
          disabled={!ndk || isVerifying}
        />
        
        <Button
          title="Verify Tampered Event"
          onPress={verifyTamperedEvent}
          disabled={!ndk || isVerifying}
          color="#ff6347"
        />
      </View>
      
      {isVerifying && (
        <Text style={styles.verifying}>Verifying...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    marginBottom: 10,
  },
  result: {
    marginBottom: 20,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 100,
  },
  verifying: {
    marginTop: 20,
    color: '#666',
  },
});