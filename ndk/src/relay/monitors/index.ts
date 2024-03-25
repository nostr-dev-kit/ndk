
import { NDKKind } from '../../events/kinds/index';
import type { NDK } from '../../ndk/index';
import type { NDKFilter } from "../../subscription/index.js";

// import { NDKRelayList } from '../../events/kinds/NDKRelayList';
// import { NDKRelay } from '..';
// import { NDKTag } from '../..';

import { NDKEventGeoCoded } from '../../events/geocoded';

import { RelayMonitorDiscoveryTags } from '../../events/kinds/nip66/relay-monitor';

import type { RelayMonitor } from '../../events/kinds/nip66/relay-monitor';
import type { Coords } from '../../events/geocoded';

// import type { RelayDiscovery } from '../../events/kinds/nip66/relay-discovery';
import type { RelayListSet, RelayMonitorSet, RelayMonitorDiscoveryFilters, RelayMonitorCriterias } from '../../events/kinds/nip66/relay-monitor';
import type { RelayMeta } from '../../events/kinds/nip66/relay-meta';


type NDKRelayMonitorsOptions = {
    customFilter?: NDKFilter;
    builtinFilter?: RelayMonitorDiscoveryFilters;
    criterias?: RelayMonitorCriterias;
    nearby?: EventGeoCodedGeospatialOptions;
    activeOnly?: boolean;
}

type EventGeoCodedGeospatialOptions = {
    geohash: string;
    maxPrecision?: number;
    minPrecision?: number;
    minResults?: number;
    recurse?: boolean;
}

type RelayAggregateMixed = RelayListSet | Set<RelayMeta> | undefined;

/**
 * 
 * const monitors = new NKRelayMonitor(ndk)
 * await monitors.populate()
 * monitors.
 */
export class NDKRelayMonitors {

    private _events: Set<RelayMonitor>;
    private _ndk: NDK;
    private _options: NDKRelayMonitorsOptions;

    constructor( ndk: NDK, options?: NDKRelayMonitorsOptions ){
        this._ndk = ndk;
        this._events = new Set();
        this._options = options || {} as NDKRelayMonitorsOptions;
    }

    get ndk(): NDK {
        return this._ndk;
    }

    get monitors(): RelayMonitorSet{
        return this._events;
    }

    set monitors( monitors: RelayMonitorSet) {
        if(!monitors?.size) return;
        monitors.forEach( monitor => this._events.add(monitor as RelayMonitor) );
    }
    /**
     * Aggregates relay data based on the specified fetch method and options.
     * This method collects data from each monitor that meets the specified criteria
     * and aggregates it based on the `fetchAggregate` parameter.
     *
     * @param fetchAggregate - The aggregation method to be used for fetching data.
     * @param opts - Optional parameters including custom filters, criteria for monitor selection, and geospatial options for nearby search.
     * @returns A promise that resolves to a mixed set of relay data based on the specified aggregation method.
     * 
     * @public
     * @async
     */
    async aggregate( fetchAggregate: string, opts?: NDKRelayMonitorsOptions ): Promise<RelayAggregateMixed> {
        const promises: Promise<RelayAggregateMixed>[] = [];
        const criterias = opts?.criterias || this._options?.criterias as RelayMonitorCriterias || undefined;
        const monitors: RelayMonitorSet = criterias? this.meetsCriterias( criterias ): this.monitors;
        if(!monitors?.size) return undefined;
        monitors.forEach( (monitor: RelayMonitor) => {
            let result: Promise<RelayAggregateMixed> = Promise.resolve(undefined);
            switch(fetchAggregate){
                case 'onlineList':
                    result = monitor.fetchOnlineRelays(opts?.customFilter);
                    break;
                case 'onlineMeta':
                    result = monitor.fetchOnlineRelaysMeta(opts?.customFilter);
                    break;
                case 'onlineListNearby':
                    if(!opts?.nearby) break;
                    result = monitor.fetchNearbyRelaysList(opts?.nearby.geohash, opts?.nearby?.maxPrecision, opts?.nearby?.minPrecision, opts?.nearby?.minResults, opts?.nearby?.recurse, opts?.customFilter);
                    break;
            }
            promises.push(result as Promise<RelayAggregateMixed>);
        });
        await Promise.allSettled(promises);
        const results = new Set();
        Array.from(promises).forEach( (result: Promise<RelayAggregateMixed>) => {
            if(!result) return;
            results.add(result);
        });
        return results as RelayAggregateMixed;
    }

    /**
     * Populates the internal set of monitors based on a custom filter and optionally filters for only active monitors.
     * This method fetches relay monitors matching the provided filter and updates the internal set of monitors.
     *
     * @param customFilter - A custom filter to apply when fetching monitors.
     * @param activeOnly - If true, only active monitors are considered.
     * @returns A promise that resolves once the internal set of monitors is populated.
     * 
     * @public
     * @async
     */
    public async populate( customFilter: NDKFilter = {}, activeOnly: boolean = true ) {
        this.monitors = undefined; 
        const events: RelayMonitorSet = await this.fetchMonitors(customFilter, activeOnly);
        if(!events?.size) return undefined;
        this.monitors = events;
        this._initMonitors();
    }

    /**
     * Populates the internal set of monitors based on specified criteria and optionally filters for only active monitors.
     * This method constructs a filter from the given criteria and fetches relay monitors that meet these criteria.
     *
     * @param criterias - Criteria used to filter the monitors.
     * @param activeOnly - If true, only active monitors are considered.
     * @returns A promise that resolves once the internal set of monitors is populated based on the criteria.
     * 
     * @public
     * @async
     */
    public async populateByCriterias( criterias: RelayMonitorCriterias, activeOnly: boolean = true ) {
        const filter: NDKFilter = this._generateCriteriasFilter(criterias);
        this.populate( filter, activeOnly );
    }

    /**
     * Populates the internal set of monitors based on proximity to a given geohash and optionally appends a custom filter.
     * This method fetches relay monitors that are nearby the specified geohash and meets any additional specified criteria.
     *
     * @param geohash - The geohash representing the location to search near.
     * @param maxPrecision - The maximum precision of the geohash to consider.
     * @param minPrecision - The minimum precision of the geohash to consider.
     * @param minResults - The minimum number of results to return.
     * @param recurse - If true, recursively search for relays until the minimum number of results is met.
     * @param appendFilter - An optional filter to append to the default filter.
     * @param activeOnly - If true, only considers active monitors.
     * @returns A promise that resolves once the internal set of monitors is populated based on proximity.
     * @public
     * @async
     */
    public async populateNearby( geohash: string, maxPrecision: number = 5, minPrecision: number = 5, minResults: number = 5, recurse: boolean = false, appendFilter?: NDKFilter, activeOnly: boolean = false ) {
        this.monitors = undefined; 
        const _builtinFilter: NDKFilter = this._generateCriteriasFilter();
        const events: RelayMonitorSet = await this.fetchNearbyMonitors(geohash, maxPrecision, minPrecision, minResults, recurse, activeOnly, { ..._builtinFilter, ...appendFilter  });
        if(!events?.size) return undefined;
        this.monitors = events;
        this._initMonitors();
    }

    /**
     * Filters the internal set of monitors based on the specified criteria.
     *
     * @param criterias - The criteria used to filter the monitors.
     * @returns A set of relay monitors that meet the specified criteria or undefined if no monitors meet the criteria.
     * @public
     */
    public meetsCriterias( criterias: RelayMonitorCriterias ): RelayMonitorSet| undefined {
        if(!this._events?.size) return undefined;
        const monitors = Array.from(this._events);
        return new Set(monitors.filter( monitor => monitor.meetsCriterias(criterias) ));
    }

    /**
     * Retrieves the closest monitor to the specified coordinates that meets any provided criteria.
     * If no monitors meet the criteria or are close enough, returns undefined.
     *
     * @param coords - The coordinates used to find the closest monitor.
     * @param criterias - Optional criteria to filter monitors.
     * @param populate - If true, populates the internal set of monitors based on the criteria before searching.
     * @returns A promise that resolves to the closest monitor meeting the criteria, or undefined if no suitable monitor is found.
     * @public
     * @async
     */
    public async getClosestMonitor( coords: Coords, criterias?: RelayMonitorCriterias, populate: boolean = false ): Promise<RelayMonitor | undefined> {
        const _criterias = criterias || this._options?.criterias || {} as RelayMonitorCriterias;
        if(!this?.monitors?.size || populate) {
            await this.populateByCriterias( criterias || this?._options?.criterias as RelayMonitorCriterias);
        }
        const monitors = this.meetsCriterias(_criterias);
        if(!monitors?.size) return undefined;
        const sorted: RelayMonitorSet = NDKRelayMonitors.sortMonitorsByProximity(coords, monitors);
        return sorted?.values().next().value;
    };

    /**
     * Fetches monitors with optional filter
     * 
     * @param {NDKFilter} filter The NDK instance to use for fetching events.
     * @param {boolean} activeOnly Return only active monitors.
     * @returns Promise resolves to an array of `RelayListSet` objects.
     * 
     * @public
     * @async
     */
    public async fetchMonitors( filter?: NDKFilter, activeOnly: boolean = true ): Promise<RelayMonitorSet> {
        if(!this.ndk){
            return undefined;
        }
        
        const kinds: NDKKind[] = [ NDKKind.RelayMonitor ];
        const _filter: NDKFilter = { ...filter, kinds };
        const events: RelayMonitorSet = await this.ndk.fetchEvents(_filter) as RelayMonitorSet;

        if(!events?.size) {
            return undefined;
        }
        if(activeOnly){
            return NDKRelayMonitors.filterActiveMonitors(events);
        }
        return events;
    }

    /**
     * Fetches monitors by a MonitorTag
     * 
     * @param {Set<RelayMonitor>} monitors A set of `RelayMonitor` objects to filter.
     * @returns Promise resolves to an array of `RelayListSet` objects.
     * 
     * @public
     * @async
     */
    public async fetchMonitorsBy( monitorTags: RelayMonitorDiscoveryFilters, filter?: NDKFilter ): Promise<RelayMonitorSet> {
        const _filter: NDKFilter = { ...filter, ...monitorTags };
        const events: RelayMonitorSet = await this.fetchMonitors(_filter);
        return new Set(events) as RelayMonitorSet;
    }

    /**
     * Fetches monitors and sorts by distance with a given geohash
     * 
     * @param {NDK} ndk The NDK instance to use for fetching events.
     * @param {NDKFilter} filter An optional, additional filter to ammend to the default filter.
     * @returns Promise resolves to an array of `RelayListSet` objects.
     * 
     * @public
     * @async
     */
    public async fetchActiveMonitors( filter?: NDKFilter ): Promise<RelayMonitorSet> {
        if(!this.ndk){
            return undefined;
        }
        const events: RelayMonitorSet = await this.fetchMonitors(filter);
        if(!events?.size) return undefined;
        const active = await NDKRelayMonitors.filterActiveMonitors( events );
        return active?.size? active: undefined;
    }

    /**
     * Fetches monitors and sorts by distance with a given geohash
     * 
     * @param {string} geohash The geohash that represents the location to search for relays.
     * @param {number} maxPrecision The maximum precision of the geohash to search for.
     * @param {number} minPrecision The minimum precision of the geohash to search for.
     * @param {number} minResults The minimum number of results to return.
     * @param {boolean} recurse Recusively search for relays until results  >= minResults
     * @param {boolean} activeOnly Filter out inactive monitors.
     * @param {NDKFilter} filter An optional, additional filter to ammend to the default filter. 
     * @returns Promise resolves to an array of `RelayListSet` objects.
     * 
     * @public
     * @async
     */
    public async fetchNearbyMonitors( geohash: string, maxPrecision: number = 5, minPrecision: number = 5, minResults: number = 5, recurse: boolean = false, activeOnly: boolean = false, filter?: NDKFilter ): Promise<RelayMonitorSet> {
        if(!this.ndk){
            return undefined;
        }
        let cb = async (evs: Set<NDKEventGeoCoded>) => evs;
        if(activeOnly){
            cb = async (events: Set<NDKEventGeoCoded>) => await NDKRelayMonitors.filterActiveMonitors(events as Set<RelayMonitor>) || new Set();
        }
        const kinds: NDKKind[] = [ NDKKind.RelayMonitor ];
        const _filter: NDKFilter = { ...filter, kinds };
        const geocodedEvents = await NDKEventGeoCoded.fetchNearby(this.ndk, geohash, _filter, { maxPrecision, minPrecision, minResults, recurse, callbackFilter: cb });
        const events: RelayMonitorSet= new Set(Array.from(geocodedEvents || new Set()).map( (event: NDKEventGeoCoded) => (event as RelayMonitor) ));
        return events;
    }

    /**
     * Filters monitors by their active state
     * 
     * @param {Set<RelayMonitor>} monitors A set of `RelayMonitor` objects to filter.
     * @returns Promise resolves to an array of `RelayListSet` objects.
     * 
     * @public
     * @async
     */
    static async filterActiveMonitors( monitors: RelayMonitorSet): Promise<RelayMonitorSet> {
        if(!monitors?.size) return undefined;
        const _monitors: RelayMonitorSet = new Set(Array.from(monitors)); //deref
        const promises = [];
        for ( const $monitor of _monitors) {
            promises.push($monitor.isMonitorActive());  
        }
        await Promise.allSettled(promises);
        _monitors.forEach( ($monitor: RelayMonitor)  => {
            if(!$monitor.active) {
                _monitors.delete($monitor);
            }
        });
        return new Set(_monitors) as RelayMonitorSet;
    }

    /**
     * Sorts monitors based on provided coordinates (DD or geohash) relative to the monitor's coordinates (if available)
     * 
     * @param {Coords} coords The coordinates to use for sorting.
     * @param {Set<RelayMonitor>} monitors A set of `RelayMonitor` objects to filter.
     * @returns Promise resolves to an array of `RelayListSet` objects.
     * 
     * @static
     * @async
     */
    static sortMonitorsByProximity( coords: Coords, monitors: RelayMonitorSet ): RelayMonitorSet | undefined {
        if(!monitors?.size) return undefined;
        const monitorsSorted = NDKEventGeoCoded.sortGeospatial( coords, monitors as Set<NDKEventGeoCoded> );
        return monitorsSorted as RelayMonitorSet;
    }

    /**
     * Initializes monitors by calling their `init` method if they have not been initialized yet.
     * This method iterates through all monitors and initializes each that hasn't been initialized.
     * The initialization process for each monitor is performed asynchronously, and this method
     * waits for all initialization promises to settle before completing.
     * 
     * @private
     * @async
     */
    private async _initMonitors(){
        const promises: Promise<void>[] = [];
        if(!this?.monitors?.size) return;
        this.monitors.forEach( async (monitor: RelayMonitor) => {
            if(!monitor.initialized){
                promises.push(monitor.init());
            }
        });
        await Promise.allSettled(promises);
    }

    /**
     * Generates a filter for relay monitor discovery based on specified criteria.
     * The method maps the provided criteria to their corresponding discovery tags
     * and constructs a filter object that can be used for relay monitor discovery.
     * If no criteria are provided, it defaults to using the criteria specified in
     * the instance's options, if available.
     * 
     * @param criterias - Optional. The criteria to generate the filter from.
     * @returns An object representing the filter for relay monitor discovery.
     * 
     * @private
     */
    private _generateCriteriasFilter( criterias?: RelayMonitorCriterias ): RelayMonitorDiscoveryFilters {
        const filter: RelayMonitorDiscoveryFilters = {};
        criterias = criterias || this._options?.criterias;
        if (!criterias) return filter;
        const keyMapping: Record<keyof RelayMonitorCriterias, RelayMonitorDiscoveryTags> = {
            kinds: RelayMonitorDiscoveryTags.kinds,
            operator: RelayMonitorDiscoveryTags.operator, 
            checks: RelayMonitorDiscoveryTags.checks,
        };
        Object.entries(keyMapping).forEach(([optionKey, tagValue]) => {
            const filterKey = `#${tagValue}` as keyof RelayMonitorDiscoveryFilters;
            const originalValue = criterias?.[optionKey as keyof RelayMonitorCriterias];
            if (originalValue) {
                filter[filterKey] = originalValue.map(String);
            }
        });
        return filter;
    }
}