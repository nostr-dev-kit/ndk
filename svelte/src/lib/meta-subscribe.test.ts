import { describe, it, expect, beforeEach } from 'vitest';
import { createNDK } from './ndk-svelte.svelte.js';
import { createMetaSubscription } from './meta-subscribe.svelte.js';

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
                // @ts-expect-error - Testing runtime validation
                createMetaSubscription(ndk, { filters: [{ kinds: [6] }] });
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createMetaSubscription(ndk, { filters: [{ kinds: [6] }] });
            }).toThrow("$metaSubscribe expects config to be a function");
        });

        it('should throw TypeError when passed string', () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createMetaSubscription(ndk, "not a config");
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createMetaSubscription(ndk, "not a config");
            }).toThrow("$metaSubscribe expects config to be a function");
        });

        it('should throw TypeError when passed array', () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createMetaSubscription(ndk, [{ kinds: [6] }]);
            }).toThrow(TypeError);
        });

        it('should throw TypeError when passed null', () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createMetaSubscription(ndk, null);
            }).toThrow(TypeError);
        });

        it('should throw TypeError when passed undefined', () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createMetaSubscription(ndk, undefined);
            }).toThrow(TypeError);
        });
    });

    describe('NDKSvelte.$metaSubscribe availability', () => {
        it('should be available on NDKSvelte instance', () => {
            expect(typeof ndk.$metaSubscribe).toBe('function');
        });
    });
});
