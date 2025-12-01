import { describe, it, expect, beforeEach } from 'vitest';
import { createNDK, type NDKSvelte } from '../ndk-svelte.svelte.js';
import { createMetaSubscription } from './meta-subscription.svelte.js';

describe('Meta-Subscription Validation', () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = createNDK({
            explicitRelayUrls: ['wss://relay.test']
        });
    });

    describe('createMetaSubscription validation', () => {
        it('should throw TypeError when passed non-function', () => {
            expect(() => {
                createMetaSubscription(ndk, () => ({ filters: [{ kinds: [6] }] }));
            }).toThrow(TypeError);
            expect(() => {
                createMetaSubscription(ndk, () => ({ filters: [{ kinds: [6] }] }));
            }).toThrow("$metaSubscribe expects config to be a function");
        });

        it('should throw TypeError when passed string', () => {
            expect(() => {
                createMetaSubscription(ndk, () => "not a config" as any);
            }).toThrow(TypeError);
            expect(() => {
                createMetaSubscription(ndk, () => "not a config" as any);
            }).toThrow("$metaSubscribe expects config to be a function");
        });

        it('should throw TypeError when passed array', () => {
            expect(() => {
                createMetaSubscription(ndk, () => [{ kinds: [6] }]);
            }).toThrow(TypeError);
        });

        it('should throw TypeError when passed null', () => {
            expect(() => {
                createMetaSubscription(ndk, () => null as any);
            }).toThrow(TypeError);
        });

        it('should throw TypeError when passed undefined', () => {
            expect(() => {
                createMetaSubscription(ndk, () => undefined);
            }).toThrow(TypeError);
        });
    });

    describe('NDKSvelte.$metaSubscribe availability', () => {
        it('should be available on NDKSvelte instance', () => {
            expect(typeof ndk.$metaSubscribe).toBe('function');
        });
    });
});
