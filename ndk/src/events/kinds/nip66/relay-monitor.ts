
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

    async init(){
        await this._fetchMonitorProfile();
        await this._fetchMonitorRelayList();
        this._initialized = true;
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

    /**
     * Fetches a list of online relays
     * 
     * @public
     * @param {NDKFilter} filter A filter to apply additional filtering to subscription.
     * @returns {Promise<RelayListSet>} Promise resolves to a relay list
     * 
     * @public
     * @async
     */
    async fetchOnlineRelays( filter?: NDKFilter ): Promise<RelayListSet> {
        this._maybeWarnInvalid();
        if( ![NDKKind.RelayMeta, NDKKind.RelayDiscovery].some(value => this.kinds.includes(value)) ) { 
            return this._invalidRelayFetch(`RelayMonitor.fetchOnlineRelays()`, `${this.pubkey} does not publish kind ${NDKKind.RelayMeta} or ${NDKKind.RelayDiscovery}`);
        }

        const kinds: NDKKind[] = [this.kinds.includes(NDKKind.RelayDiscovery )? NDKKind.RelayDiscovery: NDKKind.RelayMeta];
        const _filter: NDKFilter = this._nip66Filter(kinds, filter);

        return new Promise((resolve, reject) => { 
            this.ndk?.fetchEvents(_filter)
            .then((events: Set<NDKEvent>) => {
                resolve(this?._reduceRelayEventsToRelayStrings(events));
            })
            .catch(reject);
        });
    }

    /**
     * Fetches a list of online relays by providing one or more NDKFilters using RelayDiscoveryFilters keys.
     * 
     * @param {RelayDiscoveryFilters} indexedTags A `RelayDiscoveryFilters` value representing the tag to filter by.
     * @param {NDKFilter} filter A string or array of strings representing the key(s) to filter by.
     * @returns {Promise<RelayListSet>} A promise that resolves to a list of online relays as strings or undefined if the operation fails.
     * 
     * @public
     * @async
     */
    async fetchOnlineRelaysBy( indexedTags: RelayDiscoveryFilters, filter?: NDKFilter ): Promise<RelayListSet> {
        this._maybeWarnInvalid();
        if( ![NDKKind.RelayMeta, NDKKind.RelayDiscovery].some(value => this.kinds.includes(value)) ) { 
            return this._invalidRelayFetch(`RelayMonitor.fetchOnlineRelaysBy()`, `${this.pubkey} does not publish kind ${NDKKind.RelayMeta} or ${NDKKind.RelayDiscovery}`);
        }

        const kinds = [this.kinds.includes(NDKKind.RelayDiscovery )? NDKKind.RelayDiscovery: NDKKind.RelayMeta];
        const _filter: NDKFilter = this._nip66Filter(kinds, filter, indexedTags as NDKFilter);

        return new Promise((resolve, reject ) => { 
            this.fetchOnlineRelays(_filter)
                .then( (events: RelayListSet) => {
                    resolve(events);
                })
                .catch(reject);
        });
    }

    /**
     * Fetches metadata for a specific relay or relays.
     * 
     * @param {string[] | string} relays A string or array of strings representing the relay(s) to fetch metadata for.
     * @returns A promise that resolves to the `RelayMetasResult` object(s)
     * 
     * @public
     * @async
     */
    async fetchRelayMeta( relays: string[] | string ): Promise<RelayMetaSet>  {
        this._maybeWarnInvalid();
        if( !this.kinds.includes(NDKKind.RelayMeta) ) { 
            return this._invalidRelayFetch(`RelayMonitor.fetchRelayMetaData()`, `${this.pubkey} does not publish kind ${NDKKind.RelayMeta}`);
        }

        if(!Array.isArray(relays)) { 
            relays = [relays];
        }
        const kinds: NDKKind[] = [NDKKind.RelayMeta];
        const filter: NDKFilter = this._nip66Filter(kinds, undefined, { "#d": relays } as NDKFilter);

        return new Promise((resolve, reject) => {
            this.ndk?.fetchEvents(filter)
                .then((events: Set<NDKEvent>) => {
                    resolve(new Set(Array.from(events)) as RelayMetaSet);
                })
                .catch(reject);
        });
    }

    /**
     * Fetches metadata for online relays, optionally applying an additional filter.
     * 
     * @param {NDKFilter} filter An optional `NDKFilter` object to apply additional filtering criteria.
     * @returns A promise that resolves to a `RelayMetaSet` or undefined if the operation fails.
     * 
     * @public
     * @async
     */
    async fetchOnlineRelaysMeta( filter?: NDKFilter ): Promise<RelayMetaSet> {
        this._maybeWarnInvalid();
        if( !this.kinds.includes(NDKKind.RelayMeta) ) { 
            return this._invalidRelayFetch(`RelayMonitor.fetchOnlineRelaysMeta()`, `${this.pubkey} does not publish kind ${NDKKind.RelayMeta}`);
        }

        const kinds: NDKKind[] = [NDKKind.RelayMeta];
        const _filter: NDKFilter = this._nip66Filter(kinds, filter);

        return new Promise((resolve, reject) => {
          this.ndk?.fetchEvents(_filter)
              .then((events: Set<NDKEvent>) => {
                  resolve(new Set(Array.from(events) as RelayMeta[]));
              })
              .catch(reject);
        });
    }

    /**
     * Fetches metadata for online relays by filtering a specific tag and key, optionally applying an additional filter.
     * 
     * @param {RelayDiscoveryFilters} indexedTags A `RelayDiscoveryTags` value representing the tag to filter by.
     * @param {NDKFilter} filter A string or array of strings representing the key(s) to filter by.
     * @returns Promise resolves to an array of `RelayMeta` objects.
     * 
     * @public
     * @async
     */
    async fetchOnlineRelaysMetaBy( indexedTags: RelayDiscoveryFilters, filter?: NDKFilter ): Promise<RelayMetaSet> {
        this._maybeWarnInvalid();
        
        const _filter = this._nip66Filter([NDKKind.RelayMeta], filter, indexedTags as NDKFilter);

        return new Promise((resolve, reject) => {
            this.fetchOnlineRelaysMeta(_filter)
                .then( ( events ) => {
                    resolve( events );
                })
                .catch(reject);
        });    
    }

    /**
     * Fetches relay discovery events for online relays, optionally applying an additional filter.
     * 
     * @param {NDKFilter} filter An optional `NDKFilter` object to apply additional filtering criteria.
     * @returns Promise resolves to a `RelayMetaSet` or undefined if the operation fails.
     * 
     * @public 
     * @async
     */
    async fetchOnlineRelaysDiscovery( filter?: NDKFilter ): Promise<RelayDiscoveryResult> {
        this._maybeWarnInvalid();
        if( !this.kinds.includes(NDKKind.RelayDiscovery) ) { 
            return this._invalidRelayFetch(`RelayMonitor.fetchOnlineRelaysMeta()`, `${this.pubkey} does not publish kind ${NDKKind.RelayMeta}`);
        }

        const kinds: NDKKind[] = [NDKKind.RelayDiscovery];
        const _filter: NDKFilter = this._nip66Filter(kinds, filter);

        return new Promise((resolve, reject) => {
            this.ndk?.fetchEvents(_filter)
                .then((events: Set<NDKEvent>) => {
                    resolve(new Set(Array.from(events).map(event => event as RelayDiscovery)));
                })
                .catch(reject);
        });
    }

    /**
     * Fetches relays and sorts by distance with a given geohash
     * 
     * @param {string} geohash The geohash that represents the location to search for relays.
     * @param {number} maxPrecision The maximum precision of the geohash to search for.
     * @param {number} minPrecision The minimum precision of the geohash to search for.
     * @param {number} minResults The minimum number of results to return.
     * @param {boolean} recurse Recusively search for relays until results >= minResults
     * @param {NDKFilter} filter An optional, additional filter to ammend to the default filter. 
     * @returns Promise resolves to an array of `RelayListSet` objects.
     * 
     * @public
     * @async
     */
    async fetchNearbyRelaysList( geohash: string, maxPrecision: number = 5, minPrecision: number = 5, minResults: number = 5, recurse: boolean = false, filter?: NDKFilter ): Promise<RelayListSet> {
        this._maybeWarnInvalid();
        if(geohash.length < minPrecision) { 
            return this._invalidRelayFetch(`RelayMonitor.fetchNearbyRelaysList()`, `Geohash ${geohash} is too short`);
        }
        if(!this?.ndk){
            return undefined;
        }
        const _filter: NDKFilter = this._nip66Filter([NDKKind.RelayDiscovery], filter);

        const geocodedEvents = await NDKEventGeoCoded.fetchNearby(this.ndk, geohash, _filter, { maxPrecision, minPrecision, minResults, recurse } as FetchNearbyRelayOptions);
        const events: Set<RelayDiscovery> = new Set(Array.from(geocodedEvents || new Set()).map( (event: NDKEventGeoCoded) => (event as RelayDiscovery) ));
        const relayList: RelayListSet = this._reduceRelayEventsToRelayStrings(events);
        return new Promise((resolve) => {
            resolve(relayList);
        });    
    }
    
    /**
     * Reduces a set of `NDKEvent` objects to a list of relay strings.
     * 
     * @param {Set<RelayDiscovery | RelayMeta | NDKEvent>} events A set of `NDKEvent` objects.
     * @returns Promise resolves to a list of relay strings or undefined.
     * 
     * @private
     */
    private _reduceRelayEventsToRelayStrings( events: Set<RelayDiscovery | RelayMeta | NDKEvent> ): RelayListSet {
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
    private _maybeWarnInvalid(): void {
        if( !this.isMonitorValid() ) {
            console.warn(`[${this.pubkey}] RelayMonitor has not published a valid or complete "RelayMonitor" event.`);
        }
    }

    /**
     * Handles invalid relay fetch operations by logging a warning and returning undefined.
     * 
     * @param {string} caller The name of the calling method.
     * @param {string} err The error message to log.
     * @returns Always undefined, indicating an invalid operation.
     * 
     * @private
     */
    private _invalidRelayFetch( caller: string, err: string ): undefined {
        console.error(`${caller}: ${err}`);
        return undefined;
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
    private _nip66Filter( kinds: number[], prependFilter?: NDKFilter, appendFilter?: NDKFilter ): NDKFilter {
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
     * Asynchronously fetches the Relay Monitor's profile information.
     * 
     * @remarks
     * This method is a private helper function intended for internal use within the class to refresh or
     * retrieve the Relay Monitor's profile information.
     * 
     * @private
     * @async
     */
    private async _fetchMonitorProfile() {
        await this?._user?.fetchProfile();
    }

    /**
     * Asynchronously fetches the relay list associated with the Relay Monitor and populates the relay pool.
     * 
     * @remarks
     * - Returns `undefined` if `ndk` is not defined, indicating that the operation cannot be completed.
     * 
     * @returns {Promise<NDKRelayList | undefined>} A promise that resolves to an `NDKRelayList` object containing
     * the list of relays associated with the user, or `undefined` if the operation cannot be completed.
     * 
     * @private
     * @async
     */
    private async _fetchMonitorRelayList(): Promise<NDKRelayList | undefined> { 
        if(!this.ndk) return undefined;
        const relayList = await NDKRelayList.forUser(this._user, this.ndk);
        if(relayList) {
            this.relays = NDKRelayList.from(relayList);
            this.relays?.relays.forEach( (relay) => {
                this.ndk?.pool.addRelay(new NDKRelay(relay));
            });
        }
        return this.relays;
    }
}