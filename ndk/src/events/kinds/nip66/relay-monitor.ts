
import { NDKKind } from "../index.js";
import type { NDKUser } from "../../../user/index.js";
import type { NDKRelayList } from "../NDKRelayList.js";
// import { NDKRelay } from "../../../relay/index.js";

import type { NDKEvent } from "../../index.js";
import type { NostrEvent } from "../../index.js";
import type { NDKFilter } from "../../../subscription/index.js";
import type { NDK } from "../../../ndk/index.js";
import type { NDKUserProfile } from "../../../user/profile.js";

import { NDKEventGeoCoded } from "../../geocoded.js";


import type { NDKRelayMeta } from "./relay-meta.js";
import type { NDKRelayDiscovery } from "./relay-discovery.js";
// import type { FetchNearbyRelayOptions } from "../../geocoded.js";
// import { FetchNearbyOptions } from "../../../ndk/fetch-geospatial.js";

export type RelayListSet = Set<string> | undefined
export type RelayMonitorSet = Set<NDKRelayMonitor> | undefined
export type RelayDiscoveryResult = Set<NDKRelayDiscovery> | undefined
export type RelayMetaSet = Set<NDKRelayMeta> | undefined

export type LivenessFilter = { 
    since?: number, 
    until?: number 
}

export const enum RelayLiveness {
    All = "all",
    Online = "online",
    Offline = "offline",
    Dead = "dead",
}

export type RelayMonitorCriterias = {
    kinds?: number[], 
    checks?: string[]
}

export enum RelayMonitorDiscoveryTags {
    kinds = "k",
    checks = "c"
}

export type RelayMonitorDiscoveryFilters = {
    [K in RelayMonitorDiscoveryTags as `#${K}`]?: string[];
};

// export type FetchRelaysOptions = {
//     filter?: NDKFilter;
//     indexedTags?: RelayDiscoveryFilters;
//     geohash?: string,
//     nearby?: FetchNearbyOptions;
//     activeOnly?: boolean;
//     tolerance?: number;
//     offlineAfter?: number;
//     deadAfter?: number; 
// }

/**
 * A `NDKRelayMonitor` event represents a NIP-66 Relay Monitor.
 * 
 * @author sandwich.farm
 * @extends NDKEventGeoCoded
 * @summary Relay Monitor (NIP-66)
 * @implements NDKKind.RelayMonitor
 * @example
 * ```javascript
 * import { NDK } from "@nosplatform/ndk";
 * import { NDKRelayMonitor } from "@nosplatform/ndk/dist/events/kinds/nip66/relay-monitor";
 * 
 * const ndk = new NDK();
 * const monitorEvent = {...}
 * const monitor = new NDKRelayMonitor(ndk, monitorEvent);
 * const online = await monitor.fetchOnlineRelays();
 * 
 * console.log(online)
 * ```
 */
export class NDKRelayMonitor extends NDKEventGeoCoded {

    protected _relays: NDKRelayList | undefined;
    protected _tolerance: number = 1.2;
    protected _offlineAfter: number = 24;
    protected _deadAfter: number = 24*7*24*60*60*1000;  
    protected _active: boolean | undefined;
    protected _user: NDKUser | undefined;
    private debug: debug.Debugger | undefined;

    constructor( ndk: NDK | undefined, event?: NostrEvent, debug?: debug.IDebugger ) {
        super(ndk, event);
        this.kind ??= NDKKind.RelayMonitor; 

        if(!ndk) return;

        this.debug = debug || ndk.debug.extend("relay-monitor");

        if(this.pubkey) { 
            this._user = ndk.getUser({ pubkey: this.pubkey });
        }
    }

    static from(event: NDKEvent, debug?: debug.IDebugger): NDKRelayMonitor {
        return new NDKRelayMonitor(event.ndk, event.rawEvent(), debug);
    }

    get user(): NDKUser | undefined {
        return this._user;
    }

    get frequency(): number | undefined {
        const value = this.tagValue("frequency");
        if(!value) { 
            return undefined;
        }
        return parseInt(value);
    }

    set frequency( value: number | undefined ) {
        this.removeTag("frequency");
        if (value) {
            this.tags.push(["frequency", String(value)]);
        }
    }

    get kinds(): number[] {
        return this.tags.filter(tag => tag[0] === "k").map(tag => parseInt(tag[1]));
    }

    set kinds( values: number[] ) {
        this.removeTag("k");
        values.forEach(value => {
            this.tags.push(["k", String(value)]);
        });
    }

    get checks(): string[] {
        return this.tags.filter(tag => tag[0] === "c").map(tag => tag[1]);
    }

    set checks( values: number[] ) {
        this.removeTag("c");
        values.forEach(value => {
            this.tags.push(["c", String(value)]);
        });
    }

    get timeout(): Record<string, number> {
        const timeoutTags = this.tags.filter(tag => tag[0] === "timeout");
        const timeouts: Record<string, number> = {};
        timeoutTags.forEach(tag => {
            const key: string = tag[1] as string;
            timeouts[key] = parseInt(tag[2]);
        });
        return timeouts;
    }

    set timeout( values: Record<string, number>) {
        this.removeTag("timeout");

        Object.entries(values).forEach(([category, time]) => {
            this.tags.push(["timeout", category, time.toString()]);
        });
    }

    get active(): boolean | undefined {
        return this._active;
    }

    set active( active: boolean ) {
        this._active = active;
    }

    get tolerance(): number {
        return this._tolerance;
    }

    set tolerance( tolerance: number ) {
        this._tolerance = tolerance;
    }

    get onlineTolerance(): number {
        if(!this?.frequency) {
            return 0;
        }
        return Math.round(Date.now()/1000)-this.frequency*this.tolerance;
    }

    set offlineAfter( value: number ) {
        this._offlineAfter = value;
    }

    get offlineTolerance(): number {
        if(!this?.frequency) {
            return 1;
        }
        return Math.round( (Date.now()-this._offlineAfter)/1000 );
    }

    set deadAfter( value: number ) {
        this._deadAfter = value;
    }

    get deadTolerance(): number {
        if(!this?.frequency) {
            return 1;
        }
        return Math.round( (Date.now()-this._deadAfter)/1000 );
    }

    get relays(): NDKRelayList | undefined {
        return this._relays;
    }

    set relays( relays: NDKRelayList ) {
        this._relays = relays;
    }

    get profile(): NDKUserProfile | undefined {
        return this?._user?.profile;
    }

    /**
     * Checks if this `NDKRelayMonitor` event is valid. Monitors:
     * - _**SHOULD**_ have `frequency` tag that parses as int 
     * - _**SHOULD**_ have at least one `check` 
     * - _**SHOULD**_ publish at least one `kind` 
     * 
     * @returns {boolean} Promise resolves to a boolean indicating whether the `NDKRelayMonitor` is active.
     * 
     * @public
    */
    public isMonitorValid(): boolean {
        const frequency: boolean = this?.frequency? true: false ;
        const checks: boolean = this?.checks?.length > 0 ? true : false;
        const kinds: boolean = this?.kinds?.length > 0 ? true : false;
        const valid: boolean = frequency && checks && kinds;
        return valid;
    }

    /**
     * Checks if the current `NDKRelayMonitor` instance is active based on whether it has published a single
     * event within the criteria defined as "interval" in the Relay Monitor's registration event (kind: 10166) 
     * 
     * @returns {Promise<boolean>} Promise resolves to a boolean indicating whether the `NDKRelayMonitor` is active.
     * 
     * @public
     * @async
    */
    async isMonitorActive(): Promise<boolean> {
        // if(typeof this.active !== 'undefined') return this.active;
        const kinds: NDKKind[] = [];
        if(this.kinds.includes(NDKKind.RelayDiscovery)) { 
            kinds.push(NDKKind.RelayDiscovery);
        }
        if(this.kinds.includes(NDKKind.RelayMeta)) { 
            kinds.push(NDKKind.RelayMeta);
        }

        const filter: NDKFilter = this.nip66Filter(kinds, { limit: 1 } as NDKFilter);

        return new Promise((resolve, reject) => {
            this.ndk?.fetchEvents(filter)
                .then(events => {
                    this.active = events.size > 0;
                    resolve(this.active);
                })
                .catch(reject);
        });
    }

    /**
     * Determines if the current monitor instance meets specified criteria.
     * 
     * @param criterias - The criteria to be matched against the monitor's capabilities.
     * @returns {boolean} - True if the monitor meets all the specified criteria; otherwise, false.
     * @public
     */
    public meetsCriterias( criterias: RelayMonitorCriterias ): boolean {
        return NDKRelayMonitor.meetsCriterias(this, criterias);
    }

    /**
     * @description Reduces a set of `NDKEvent` objects to a list of relay strings.
     * 
     * @param {Set<NDKRelayDiscovery | NDKRelayMeta | NDKEvent>} events A set of `NDKEvent` objects.
     * @returns Promise resolves to a list of relay strings or undefined.
     * 
     * @protected
     */
    protected reduceRelayEventsToRelayStrings( events: Set<NDKRelayDiscovery | NDKRelayMeta | NDKEvent> ): RelayListSet {
        if(typeof events === 'undefined') {
                return new Set() as RelayListSet;
        }
        return new Set(Array.from(events)
            .map( event => {
                return event.tags
                    .filter( tag => tag[0] === 'd')
                    .map( tag => tag[1] )[0];
            })
        );
    }

    /**
     * Produces warnings (console.warn) if the monitor is invalid or has not been checked for validity.
     * 
     * @returns void
     * 
     * @protected
     */
    protected maybeWarnInvalid(): void {
        if( !this.isMonitorValid() && this?.debug ) {
            this.debug(`[${this.pubkey}] NDKRelayMonitor has not published a valid or complete "NDKRelayMonitor" event.`);
        }
    }

    /**
     * Returns a filter based on provided liveness (default: "online")
     * 
     * @param liveness The options to filter the relays by.
     * @returns Returns an NDKFilter containing `since`, `since` and `until` or empty object depending on provided `liveness`
     * 
     * @public
     */
    public livenessFilter(liveness: RelayLiveness = RelayLiveness.Online){
        const timeframe: LivenessFilter = {};

        if(liveness === RelayLiveness.Online) {
            timeframe.since = this.onlineTolerance;
            return timeframe;
        }

        if(liveness === RelayLiveness.Offline) {
            timeframe.until = this.onlineTolerance;
            timeframe.since = this.deadTolerance;
            return timeframe;
        }
        
        if(liveness === RelayLiveness.Dead) {
            timeframe.until = this.deadTolerance;
            return timeframe;
        }

        return timeframe; //all
    }

    /**
     * Generates filter using filtering values suggested by NIP-66
     * 
     * @param {number[]} kinds The kinds to filter by.
     * @param {NDKFilter} prependFilter An optional `NDKFilter` object to prepend to the filter.
     * @param {NDKFilter} appendFilter An optional `NDKFilter` object to append to the filter.
     * @returns Always undefined, indicating an invalid operation.
     * 
     * @protected
     */
    public nip66Filter( kinds?: number[], prependFilter?: NDKFilter, appendFilter?: NDKFilter, liveness: RelayLiveness = RelayLiveness.Online ): NDKFilter {
        if(!kinds){
            kinds = this.kinds;
        }

        const timeframe: LivenessFilter = this.livenessFilter(liveness);

        const _filter: NDKFilter = { 
            ...prependFilter,
            kinds,
            authors: [this?.pubkey], 
            ...timeframe,
            ...appendFilter
        };
        return _filter;
    }

    /**
     * Checks if a given monitor meets specified criteria.
     * 
     * This method evaluates whether a monitor matches all conditions defined in `criterias`. 
     * This includes checking if the monitor supports specified kinds, is operated by a given operator,
     * and passes all specified checks.
     * 
     * @param {NDKRelayMonitor} monitor - The monitor to evaluate against the criteria.
     * @param {RelayMonitorCriterias} criterias - The criteria including kinds, operator, and checks to match against the monitor's capabilities.
     * @returns {boolean} - True if the monitor meets all the specified criteria; otherwise, false.
     * @static
     */
    static meetsCriterias( monitor: NDKRelayMonitor, criterias: RelayMonitorCriterias ): boolean {
        const meetsCriteria = [];
        if(criterias?.kinds) {
            meetsCriteria.push(criterias.kinds.every( kind => monitor.kinds.includes(kind)));
        }
        if(criterias?.checks) {
            meetsCriteria.push(criterias.checks.every( check => monitor.checks.includes(check)));
        }
        return meetsCriteria.every( criteria => criteria === true);
    }
}