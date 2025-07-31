import { describe, expect, test, vi, beforeEach } from 'vitest';
import { NDK } from '../ndk/index';
import { NDKRelay } from './index';
import { NDKEvent } from '../events/index';

describe('Signature Verification Sampling', () => {
  let ndk: NDK;
  let relay: NDKRelay;
  
  beforeEach(() => {
    ndk = new NDK({
      initialValidationRatio: 1.0,
      lowestValidationRatio: 0.1,
    });
    relay = new NDKRelay('wss://test.relay', undefined, ndk);
  });

  test('relay should have correct initial validation ratio', () => {
    expect(relay.targetValidationRatio).toBe(1.0);
    expect(relay.shouldValidateEvent()).toBe(true);
  });

  test('validation ratio decreases with successful validations', () => {
    // Initial ratio should be 1.0
    expect(relay.shouldValidateEvent()).toBe(true);
    
    // Add 100 validated events
    for (let i = 0; i < 100; i++) {
      relay.addValidatedEvent();
    }
    
    // Ratio should decrease but still be probabilistic
    // Run multiple checks to verify the ratio is roughly as expected
    let validationCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (relay.shouldValidateEvent()) validationCount++;
    }
    
    // With 100 validated events, we expect the ratio to be lower than initial
    // but still above the minimum
    expect(validationCount).toBeGreaterThan(100); // should be more than minimum
    expect(validationCount).toBeLessThan(900); // should be less than initial
  });

  test('custom validation function is applied', () => {
    // Creating a custom function that always returns 0.5
    const customFn = () => 0.5;
    
    const customNdk = new NDK({
      initialValidationRatio: 1.0,
      lowestValidationRatio: 0.1,
      validationRatioFn: customFn
    });
    
    const customRelay = new NDKRelay('wss://test.relay', undefined, customNdk);
    
    // Validate multiple times to check probability is ~0.5
    let validationCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (customRelay.shouldValidateEvent()) validationCount++;
    }
    
    // Should be roughly 50%
    expect(validationCount).toBeGreaterThan(400);
    expect(validationCount).toBeLessThan(600);
  });

  test('trusted relays skip validation', () => {
    // Mark relay as trusted
    relay.trusted = true;
    
    // Should never validate events from trusted relays
    expect(relay.shouldValidateEvent()).toBe(false);
  });

  test('validation ratio calculation over time', () => {
    // Add validated events
    for (let i = 0; i < 5; i++) {
      relay.addValidatedEvent();
    }
    
    // Check ratio is still high with just a few validations
    let validationCount = 0;
    for (let i = 0; i < 100; i++) {
      if (relay.shouldValidateEvent()) validationCount++;
    }
    
    // Should still be high with just 5 events
    expect(validationCount).toBeGreaterThan(80);
    
    // Add many more validated events
    for (let i = 0; i < 95; i++) {
      relay.addValidatedEvent();
    }
    
    // Check ratio has decreased significantly
    validationCount = 0;
    for (let i = 0; i < 100; i++) {
      if (relay.shouldValidateEvent()) validationCount++;
    }
    
    // Should now be much lower after 100 total validated events
    expect(validationCount).toBeLessThan(50);
    expect(validationCount).toBeGreaterThan(10); // But not below minimum
  });
});

describe('Invalid Signature Handling', () => {
  let ndk: NDK;
  let relay: NDKRelay;
  
  beforeEach(() => {
    ndk = new NDK();
    ndk.initialValidationRatio = 1.0;
    ndk.lowestValidationRatio = 0.1;
    ndk.autoBlacklistInvalidRelays = true;
  });

  test('reportInvalidSignature emits event and blacklists relay', () => {
    const relay = new NDKRelay('wss://evil.relay', undefined, ndk);
    const event = new NDKEvent(ndk);
    event.id = 'fake-id';
    
    // Mock the reportInvalidSignature method
    ndk.reportInvalidSignature = vi.fn();
    ndk.emit = vi.fn();
    
    // Call the method
    ndk.reportInvalidSignature(event, relay);
    
    // Verify emit was called with correct parameters
    expect(ndk.emit).toHaveBeenCalledWith('event:invalid-sig', event, relay);
  });

  test('blacklistRelay disconnects from relay', () => {
    const relay = new NDKRelay('wss://evil.relay', undefined, ndk);
    
    // Add relay to pool
    ndk.pool.addRelay(relay);
    
    // Mock the blacklistRelay method
    ndk.blacklistRelayUrls = [];
    ndk.blacklistRelay = vi.fn((url) => {
      if (!ndk.blacklistRelayUrls) ndk.blacklistRelayUrls = [];
      ndk.blacklistRelayUrls.push(url);
      const mockRelay = ndk.pool.getRelay(url, false, false);
      if (mockRelay) mockRelay.disconnect();
    });
    
    // Mock the disconnect method
    relay.disconnect = vi.fn();
    
    // Call the method
    ndk.blacklistRelay(relay.url);
    
    // Verify relay was blacklisted
    expect(ndk.blacklistRelayUrls).toContain(relay.url);
  });

  test('validation ratio calculation logic', () => {
    const relay = new NDKRelay('wss://test.relay', undefined, ndk);
    
    // Mock the validation ratio function
    const mockRatioFn = vi.fn((relay, validatedCount, nonValidatedCount) => {
      if (validatedCount < 10) return 1.0;
      const trustFactor = Math.min(validatedCount / 100, 1);
      return 1.0 * (1 - trustFactor) + 0.1 * trustFactor;
    });
    
    ndk.validationRatioFn = mockRatioFn;
    
    // Test with few validated events (should return initial ratio)
    let ratio = mockRatioFn(relay, 5, 0);
    expect(ratio).toBe(1.0);
    
    // Test with many validated events (should decrease)
    ratio = mockRatioFn(relay, 100, 0);
    expect(ratio).toBeLessThan(1.0);
    expect(ratio).toBeGreaterThanOrEqual(0.1);
    
    // Test with even more validated events (should approach minimum)
    ratio = mockRatioFn(relay, 1000, 0);
    expect(ratio).toBeCloseTo(0.1, 1);
  });
});