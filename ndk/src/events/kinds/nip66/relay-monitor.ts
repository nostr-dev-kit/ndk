
import { NDKKind } from "../index.js";
import { NDKUser } from "../../../user/index.js";
import { NDKRelayList } from "../NDKRelayList.js";
import { NDKRelay } from "../../../relay/index.js";

import type { NDKEvent } from "../../index.js";
import type { NostrEvent } from "../../index.js";
import type { NDKFilter } from "../../../subscription/index.js";
import type { NDK } from "../../../ndk/index.js";
import type { NDKUserProfile } from "../../../user/profile.js";

import { NDKEventGeoCoded } from "../../geocoded.js";

import type { FetchNearbyRelayOptions } from "../../geocoded.js";
import type { RelayMeta } from "./relay-meta.js";
import type { RelayDiscovery, RelayDiscoveryFilters } from "./relay-discovery.js";
import { getRelayListForUser } from "../../../utils/get-users-relay-list.js";

export type RelayListSet = Set<string> | undefined
export type RelayMonitorSet = Set<RelayMonitor> | undefined
export type RelayDiscoveryResult = Set<RelayDiscovery> | undefined
export type RelayMetaSet = Set<RelayMeta> | undefined

export type RelayMonitorCriterias = {
    kinds: number[], 
    operator: string[],
    checks: string[]
}

export enum RelayMonitorDiscoveryTags {
    kinds = "k",
    operator = "o",
    checks = "c"
}

export type RelayMonitorDiscoveryFilters = {
    [K in RelayMonitorDiscoveryTags as `#${K}`]?: string[];
};

// type FetchNearbyRelayOptions = {
//     geohash: string;
//     maxPrecision?: number;
//     minPrecision?: number;
//     minResults?: number;
//     recurse?: boolean;
//     filter?: NDKFilter;
// }

export type FetchRelaysOptions = {
    filter?: NDKFilter;
    indexedTags?: RelayDiscoveryFilters;
    geohash?: string,
    nearby?: FetchNearbyRelayOptions;
    activeOnly?: boolean;
    tolerance?: number;
}

/**
 * A `RelayMonitor` event represents a NIP-66 Relay Monitor.
 * 
 * @author sandwich.farm
 * @extends NDKEventGeoCoded
 * @summary Relay Monitor (NIP-66)
 * @implements NDKKind.RelayMonitor
 * @example
 * ```javascript
 * import { NDK } from "@nosplatform/ndk";
 * import { RelayMonitor } from "@nosplatform/ndk/dist/events/kinds/nip66/relay-monitor";
 * 
 * const ndk = new NDK();
 * const monitorEvent = {...}
 * const monitor = new RelayMonitor(ndk, monitorEvent);
 * const online = await monitor.fetchOnlineRelays();
 * 
 * console.log(online)
 * ```
 */
export class RelayMonitor extends NDKEventGeoCoded {

    private _initialized: boolean = false;
    private _tolerance: number = 1.2;
    private _active: boolean | undefined;
    private _user: NDKUser;
    private _relays: NDKRelayList | undefined;

    constructor( ndk: NDK | undefined, event?: NostrEvent ) {
        super(ndk, event);
        this.kind ??= NDKKind.RelayMonitor; 
        this._user = new NDKUser({ pubkey: this.pubkey });
    }

    static from(event: NDKEvent): RelayMonitor {
        return new RelayMonitor(event.ndk, event.rawEvent());
    }

    get initialized(): boolean {    
        return this._initialized;
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

    get operator(): string | undefined {    
        return this.tagValue("o");
    }

    set operator( value: string | undefined ) {
        this.removeTag("o");
        if (value) {
            this.tags.push(["o", value]);
        }
    }

    get owner(): string | undefined {
        return this.operator;
    }

    set owner( value: string | undefined ) {
        this.operator = value;
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

    private set active( active: boolean ) {
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
     * Checks if this `RelayMonitor` event is valid. Monitors:
     * - _**SHOULD**_ have `frequency` tag that parses as int 
     * - _**SHOULD**_ have at least one `check` 
     * - _**SHOULD**_ publish at least one `kind` 
     * 
     * @returns {boolean} Promise resolves to a boolean indicating whether the `RelayMonitor` is active.
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
     * Checks if the current `RelayMonitor` instance is active based on whether it has published a single
     * event within the criteria defined as "interval" in the Relay Monitor's registration event (kind: 10166) 
     * 
     * @returns {Promise<boolean>} Promise resolves to a boolean indicating whether the `RelayMonitor` is active.
     * 
     * @public
     * @async
    */
    async isMonitorActive(): Promise<boolean> {
        if(typeof this.active !== 'undefined') return this.active;
        
        const kinds: NDKKind[] = [];
        if(this.kinds.includes(NDKKind.RelayDiscovery)) { 
            kinds.push(NDKKind.RelayDiscovery);
        }
        if(this.kinds.includes(NDKKind.RelayMeta)) { 
            kinds.push(NDKKind.RelayMeta);
        }

        const filter: NDKFilter = this._nip66Filter(kinds, { limit: 1 } as NDKFilter);

        return new Promise((resolve, reject) => {
            this.ndk?.fetchEvents(filter)
                .then(events => {
                    this.active = Array.from(events).length > 0;
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
        return RelayMonitor.meetsCriterias(this, criterias);
    }

    /**
     * @description Reduces a set of `NDKEvent` objects to a list of relay strings.
     * 
     * @param {Set<RelayDiscovery | RelayMeta | NDKEvent>} events A set of `NDKEvent` objects.
     * @returns Promise resolves to a list of relay strings or undefined.
     * 
     * @protected
     */
    protected _reduceRelayEventsToRelayStrings( events: Set<RelayDiscovery | RelayMeta | NDKEvent> ): RelayListSet {
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
     * @private
     */
    protected _maybeWarnInvalid(): void {
        if( !this.isMonitorValid() ) {
            console.warn(`[${this.pubkey}] RelayMonitor has not published a valid or complete "RelayMonitor" event.`);
        }
    }

    /**
     * Generates filter using filtering values suggested by NIP-66
     * 
     * @param {number[]} kinds The kinds to filter by.
     * @param {NDKFilter} prependFilter An optional `NDKFilter` object to prepend to the filter.
     * @param {NDKFilter} appendFilter An optional `NDKFilter` object to append to the filter.
     * @returns Always undefined, indicating an invalid operation.
     * 
     * @private
     */
    protected _nip66Filter( kinds: number[], prependFilter?: NDKFilter, appendFilter?: NDKFilter ): NDKFilter {
        const _filter: NDKFilter = { 
            ...prependFilter,
            kinds,
            authors: [this?.pubkey], 
            since: this.onlineTolerance,
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
     * @param {RelayMonitor} monitor - The monitor to evaluate against the criteria.
     * @param {RelayMonitorCriterias} criterias - The criteria including kinds, operator, and checks to match against the monitor's capabilities.
     * @returns {boolean} - True if the monitor meets all the specified criteria; otherwise, false.
     * @static
     */
    static meetsCriterias( monitor: RelayMonitor, criterias: RelayMonitorCriterias ): boolean {
        const meetsCriteria = [];
        if(criterias?.kinds) {
            meetsCriteria.push(criterias.kinds.every( kind => monitor.kinds.includes(kind)));
        }
        if(criterias?.operator) {
            meetsCriteria.push(criterias.operator.every( operator => monitor.operator === operator));
        }
        if(criterias?.checks) {
            meetsCriteria.push(criterias.checks.every( check => monitor.checks.includes(check)));
        }
        return meetsCriteria.every( criteria => criteria === true);
    }
}