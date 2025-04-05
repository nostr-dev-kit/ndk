import { NDKEvent, type NostrEvent } from "../events/index.js";
import { NDKKind } from "../events/kinds";
import type { NDK } from "../ndk";
import type { NDKRelaySet } from "../relay/sets";

/**
 * Implements NIP-78 App Settings
 *
 * @example
 * const appSettings = new NDKAppSettings(ndk)
 * appSettings.appName = "My App";
 * appSettings.set("my_key", "my_value");
 * await appSettings.save();
 *
 * @example
 * const appSettings = NDKAppSettings.from(event);
 * appSettings.appName = "My App";
 * console.log(appSettings.get("my_key"));
 *
 * @group Kind Wrapper
 *
 * @see https://github.com/nostr-protocol/nips/blob/master/78.md
 */
export class NDKAppSettings extends NDKEvent {
    public appName: string | undefined;
    public settings: Record<string, unknown> = {};

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.AppSpecificData;
        this.dTag ??= this.appName;

        if (this.content.length > 0) {
            try {
                this.settings = JSON.parse(this.content);
            } catch (error) {
                console.error("Error parsing app settings", error);
            }
        }
    }

    static from(event: NDKEvent) {
        return new NDKAppSettings(event.ndk, event);
    }

    /**
     * Set a value for a given key.
     *
     * @param key
     * @param value
     */
    set(key: string, value: unknown) {
        this.settings[key] = value;
    }

    /**
     * Get a value for a given key.
     *
     * @param key
     * @returns
     */
    get(key: string) {
        return this.settings[key];
    }

    public async publishReplaceable(relaySet?: NDKRelaySet, timeoutMs?: number, requiredRelayCount?: number) {
        this.content = JSON.stringify(this.settings);

        return super.publishReplaceable(relaySet, timeoutMs, requiredRelayCount);
    }
}
