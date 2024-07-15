import { NDKEvent } from "./index.js";

import type { NDK } from "../ndk/index.js";
import type { NDKFilter } from "../subscription/index.js";
import type { NDKTag, NostrEvent } from "./index.js";

export type Coords = DD | Geohash
export type DD = { lat: number; lon: number }
export type Geohash = string;

export type EventGeoCodedObject = Record<string, string | string[] | number | boolean>
export type EventGeoCodedCallback = (events: Set<NDKEventGeoCoded>) => Promise<Set<NDKEventGeoCoded>>;

export type FetchNearbyRelayOptions = {
    maxPrecision?: number;
    minPrecision?: number;
    minResults?: number;
    recurse?: boolean;
    callbackFilter?: EventGeoCodedCallback;
}

const eventGeoCodedCallbackDefault: EventGeoCodedCallback = async (evs: Set<NDKEventGeoCoded>)=>evs; 
const fetchNearbyOptionDefaults: FetchNearbyRelayOptions = {
    maxPrecision: 9, 
    minPrecision: 4, 
    recurse: false,
    minResults: 5, 
    callbackFilter: eventGeoCodedCallbackDefault
};

/**
 * 
 * This class represents a geocoded Nostr event.
 * 
 * @author sandwich.farm
 * @extends NDKEvent
 * 
 */
export class NDKEventGeoCoded extends NDKEvent {

    private static readonly EARTH_RADIUS: number = 6371; // km
    private static readonly GEOHASH_PRECISION: number = 12;
    private static readonly BASE32: string = '0123456789bcdefghjkmnpqrstuvwxyz';  
    private static readonly geohashFilterFn = (tag: NDKTag) => tag[0] === 'g' && (tag[2] === "gh" || tag[2] === "geohash" || tag.length === 2); //`g` tags with a length of 2 are NIP-52 geohashes

    private _dd: DD | undefined;

    constructor( ndk: NDK | undefined, rawEvent?: NostrEvent ) {
        super(ndk, rawEvent);
        if(NDKEventGeoCoded.isGeohash(this.geohash)){
            this.dd = this.geohash;
        }
    }

    static from(event: NDKEvent): NDKEventGeoCoded {
        return new NDKEventGeoCoded(event.ndk, event.rawEvent());
    }

    /**
     * Compares two geohashes and sorts them based on their length in descending order.
     * 
     * @param a - The first geohash to compare.
     * @param b - The second geohash to compare.
     * @returns A negative number if `b` is longer than `a`, a positive number if `a` is longer than `b`,
     *          or zero if they have the same length.
     * 
     * @static
     */
    static sortGeohashesFn(a: string, b: string): number {
        return b.length - a.length;
    }

    /**
     * Generates a list of filterable geohashes from a given full geohash.
     * This method creates a set of progressively shorter prefixes of the provided geohash,
     * each representing a broader geographic area. This set can be used for filtering or
     * querying geospatial data structures and is sorted from the most specific (longest)
     * to the least specific (shortest).
     * 
     * @param fullGeohash - The full geohash string from which to generate filterable prefixes.
     * @returns An array of geohash strings, each a prefix of the full geohash, sorted by descending length.
     * 
     * @static
     */
    static generateFilterableGeohash(fullGeohash: Geohash): Geohash[] {
        const geohashes: Set<Geohash> = new Set();
        const deref: Geohash = String(fullGeohash); 
        for (let i = String(fullGeohash).length; i > 0; i--) {
            const n = deref.substring(0, i);
            geohashes.add(n);
        }
        return Array.from(geohashes);
    }

    /**
     * Sets the geographical coordinates or geohash for the current instance, updating latitude, longitude, and geohash values accordingly.
     * If a geohash string is provided, it decodes it into latitude and longitude. If coordinates are provided, it sets those directly and
     * generates a corresponding geohash.
     * 
     * @param coords The coordinates or geohash string to set. Can be undefined to perform no operation.
     */
    set dd(coords: Coords | undefined) {
        if (!coords) return;
        if (typeof coords === 'string') {
            this.geohash = coords;
            const { lat, lon } = NDKEventGeoCoded.decodeGeohash(coords);
            this.lat = lat;
            this.lon = lon;
        } else if ('lat' in coords && 'lon' in coords) {
            this.lat = coords.lat;
            this.lon = coords.lon;
            this.geohash = NDKEventGeoCoded.encodeGeohash(coords) as Geohash; // This updates geohash and geohashes based on lat & lon
        }
    }

    /**
     * Gets the current geographical coordinates (latitude and longitude) prioritizing direct coordinates if available.
     * If coordinates are not directly set but a geohash is available, it returns the decoded coordinates from the geohash.
     * 
     * @returns The current geographical coordinates as a DD object or undefined if neither coordinates nor geohash are set.
     */
    get dd(): Coords | undefined {
        if (typeof this.lat !== 'undefined' && typeof this.lon !== 'undefined') {
            return { lat: this.lat, lon: this.lon } as DD;
        }
        if(typeof this.geohash === 'string') {
            this.dd = this.geohash;
            return this.dd;
        }
        return undefined;
    }    

    /**
     * Sets the primary geohash for the current instance and updates the list of geohashes with varying precision based on this value.
     * This setter generates filterable geohashes from the provided value, sorts them by descending precision, and updates related class properties.
     * 
     * @param value The geohash to set as the primary geohash.
     */
    set geohash(value: Geohash) {
        if(!NDKEventGeoCoded.isGeohash(value)) return;
        const geohashes = 
            NDKEventGeoCoded
                .generateFilterableGeohash(String(value))
                .sort( NDKEventGeoCoded.sortGeohashesFn );
        this._updateGeohashTags(geohashes);
    }

    /**
     * Sets the list of geohashes for the current instance, ensuring no duplicates and updating related class properties accordingly.
     * This setter accepts an array of geohashes, deduplicates them, and updates the instance's state.
     * 
     * @param values An array of geohashes to set, potentially containing duplicates.
     */
    set geohashes(values: Geohash[]) {
        values = values.filter(NDKEventGeoCoded.isGeohash);
        this._removeGeoHashes();
        this._updateGeohashTags(Array.from(new Set<string>(values)));
    }

    /**
     * Gets the current list of geohashes associated with the instance, sorted by descending precision.
     * 
     * @returns An array of geohashes sorted by descending precision.
     */
    get geohashes(): Geohash[] | undefined {
        const tags = 
            this.tags
                .filter( NDKEventGeoCoded.geohashFilterFn )
                .map( (tag: NDKTag) => tag[1] )
                .sort( NDKEventGeoCoded.sortGeohashesFn );
        if(!tags.length) return undefined;
        return tags;
    } 

    /**
     * Gets the the most precise geohash for the current instance, which is the first geohash in the list of geohashes sorted by descending precision.
     * 
     * @returns The primary (most precise) geohash if available, or undefined if no geohashes are set.
     */
    get geohash(): Geohash | undefined {
        return this.geohashes?.[0];
    }

    get countryCode(): string[] | undefined {
        return this.tagValuesByMarker("g", "countryCode");
    }

    get countryCodeAlpha2(): string | undefined {
        return this.tagValueByKeyAndLength("countryCode", 2)
    }

    get countryCodeAlpha3(): string | undefined {
        return this.tagValueByKeyAndLength("countryCode", 3)
    }

    get countryCodeAlpha4(): string | undefined {
        return this.tagValueByKeyAndLength("countryCode", 4)
    }

    get countryCodeNumeric(): string | undefined {
        return this.tagValueByKeyAndIsNumber("countryCode")   
    }

    get regionCodeAlpha2(): string | undefined {
        return this.tagValueByKeyAndLength("regionCode", 2)   
    }

    get regionCodeNumeric(): string | undefined {
        return this.tagValueByKeyAndIsNumber("regionCode")   
    }

    set countryCode(values: string[]) {
        this.removeTagByMarker("g", "countryCode");
        values.forEach(value => {
            this._setGeoTag("countryCode", value);
        });
    }

    get countryName(): string | undefined {
        return this.tagValueByMarker("g", "countryName");
    }

    set countryName(value: string) {
        this._setGeoTag("countryName", value);
    }

    get regionCode(): string | undefined {
        return this.tagValueByMarker("g", "regionCode");
    }

    set regionCode(value: string) {
        this._setGeoTag("regionCode", value);
    }
    
    set regionName(value: string) {
        this._setGeoTag("regionName", value);
    }

    get regionName(): string | undefined {
        return this.tagValueByMarker("g", "regionName");
    }

    set continentName(value: string) {
        this._setGeoTag("continentName", value);
    }

    get continentName(): string | undefined {
        return this.tagValueByMarker("g", "continentName");
    }

    get geo(): NDKTag[] {
        return [...this.getMatchingTags("g")];
    }

    set geo(tags: NDKTag[]) {
        this.removeTag("g");
        tags.forEach(tag => this.tags.push(tag));
    }

    private set lat(value: number) {
        if(!this._dd) this._dd = { lat: 0, lon: 0 } as DD;
        this._dd.lat = value;
    }

    private get lat(): number | undefined {
        return this._dd?.lat;
    }

    private set lon(value: number) {
        if(!this._dd) this._dd = { lat: 0, lon: 0 } as DD;
        this._dd.lon = value;
    }

    private get lon(): number | undefined {
        return this._dd?.lon;
    }

    /**
     * Retrieves all geo tags from the event's tags.
     * 
     * @returns the first geotag if available, otherwise undefined.
     */
    public geoObject(): EventGeoCodedObject  {
        const result: EventGeoCodedObject = {};
        if(this.lat) result.lat = this.lat;
        if(this.lon) result.lon = this.lon;
        if(this.geohash) result.geohash = this.geohash;
        if(this.geohashes) result._geohashes = this.geohashes;
        if(this.countryCode) result.countryCode = this.countryCode;
        if(this.countryName) result.countryName = this.countryName;
        if(this.regionCode) result.regionCode = this.regionCode;
        return result;
    }

    /**
     * Fetches events and sorts by distance with a given geohash
     * 
     * @param {NDK} ndk An NDK instance
     * @param {string} geohash The geohash that represents the location to search for relays.
     * @param {NDKFilter} filter An optional, additional filter to ammend to the default filter. 
     * @param {FetchNearbyRelayOptions} options An optional object containing options specific to fetchNearby
     * 
     * @returns Promise resolves to an array of `RelayListSet` objects.
     * 
     * @public
     */
    public static async fetchNearby(
        ndk: NDK,
        geohash: string,
        filter?: NDKFilter,
        options?: FetchNearbyRelayOptions
    ): Promise<Set<NDKEventGeoCoded>> {

        const effectiveOptions: FetchNearbyRelayOptions = {
            ...fetchNearbyOptionDefaults,
            ...options
        };
    
        let { maxPrecision, minPrecision, minResults, recurse, callbackFilter } = effectiveOptions;
           
        let events: Set<NDKEventGeoCoded> = new Set();
    
        try {
            maxPrecision = Math.min(maxPrecision as number, geohash.length);
            minPrecision = Math.min(minPrecision as number, geohash.length);
    
            const fetchEventsRecursive = async (minPrecision: number, maxPrecision: number): Promise<void> => {
                if (minPrecision < 1 || events.size >= (minResults as number)) return;
    
                const geohashes = Array.from({ length: maxPrecision - minPrecision + 1 }, (_, i) => geohash.slice(0, maxPrecision - i));
                const _filter: NDKFilter = { ...filter, "#g": geohashes };
                const fetchedEvents = await ndk.fetchEvents(_filter);
    
                fetchedEvents.forEach(event => events.add(event as NDKEventGeoCoded));
    
                if (callbackFilter) events = await callbackFilter(events);
    
                if (recurse && events.size < (minResults as number)) {
                    await fetchEventsRecursive(minPrecision - 1, minPrecision - 1);
                }
            };
    
            await fetchEventsRecursive(minPrecision, maxPrecision);
    
            if (events.size) {
                events = new Set([...NDKEventGeoCoded.sortGeospatial(geohash, events)]);
            }

            return events;
        } catch (error) {
            console.error(`fetchNearby: Error: ${error}`);
            return events;
        }
    }
    

    /**
     * Sorts an array of `NDKEventGeoCoded` instances based on their distance from a given latitude and longitude.
     * 
     * @param {Coords} coords An object containing the reference latitude (`lat`) and longitude (`lon`) or a geohash.
     * @param {NDKEventGeoCoded[]} geoCodedEvents An array of `NDKEventGeoCoded` instances to be sorted.
     * @param {boolean} asc Determines the sort order. `true` for ascending (default), `false` for descending.
     * @returns A sorted array of `NDKEventGeoCoded` instances.
     * @throws {Error} If the latitude or longitude is not a finite number.
     */
    public static sortGeospatial = (
        coords: Coords, 
        geoCodedEvents: Set<NDKEventGeoCoded>, 
        asc: boolean = true
    ): Set<NDKEventGeoCoded> => {
        const events = Array.from(geoCodedEvents).filter( (event: NDKEventGeoCoded) => event?.lat && event?.lon);
        const {lat, lon} = NDKEventGeoCoded.parseCoords(coords);
        if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) 
            throw new Error('(lat) and (lon), respectively, must be numbers and finite.');
        events.sort((a, b) => {
            if(!a?.lat || !a?.lon || !b?.lat || !b?.lon) return 0;
            const distanceA = NDKEventGeoCoded.distance({lat, lon} as DD, {lat: a.lat, lon: a.lon} as DD);
            const distanceB = NDKEventGeoCoded.distance({lat, lon} as DD, {lat: b.lat, lon: b.lon} as DD);
            return asc ? distanceA - distanceB : distanceB - distanceA;
        });
        return new Set(events) as Set<NDKEventGeoCoded>;
    };

    /**
     * Encodes latitude and longitude into a geohash string.
     * 
     * @param {Coords} coords The latitude to encode.
     * @param {number} precision The desired precision of the geohash (length of the geohash string).
     * @returns {string} The encoded geohash string.
     */
    public static encodeGeohash(coords: Coords, precision: number = this.GEOHASH_PRECISION): string {
        const {lat: latitude, lon: longitude} = NDKEventGeoCoded.parseCoords(coords);
        let isEven = true;
        const latR: number[] = [-90.0, 90.0];
        const lonR: number[] = [-180.0, 180.0];
        let bit = 0;
        let ch = 0;
        let geohash = '';

        while (geohash.length < precision) {
            let mid;
            if (isEven) {
                mid = (lonR[0] + lonR[1]) / 2;
                if (longitude > mid) {
                    ch |= (1 << (4 - bit));
                    lonR[0] = mid;
                } else {
                    lonR[1] = mid;
                }
            } else {
                mid = (latR[0] + latR[1]) / 2;
                if (latitude > mid) {
                    ch |= (1 << (4 - bit));
                    latR[0] = mid;
                } else {
                    latR[1] = mid;
                }
            }
            isEven = !isEven;

            if (bit < 4) {
                bit++;
            } else {
                geohash += NDKEventGeoCoded.BASE32.charAt(ch);
                bit = 0;
                ch = 0;
            }
        }

        return geohash;
    }


    /**
     * Decodes a geohash string into its latitude and longitude representation.
     * 
     * @param {string} hashString The geohash string to decode.
     * @returns An object containing the decoded latitude (`lat`) and longitude (`lon`).
     */
    public static decodeGeohash(hashString: string): DD {
        let isEven = true;
        const latR: number[] = [-90.0, 90.0];
        const lonR: number[] = [-180.0, 180.0];
        for (let i = 0; i < hashString.length; i++) {
            const char = hashString.charAt(i).toLowerCase();
            const charIndex = NDKEventGeoCoded.BASE32.indexOf(char);
            for (let j = 0; j < 5; j++) {
                const mask = 1 << (4 - j);
                if (isEven) {
                    NDKEventGeoCoded.decodeIntRefine(lonR, charIndex, mask);
                } else {
                    NDKEventGeoCoded.decodeIntRefine(latR, charIndex, mask);
                }
                isEven = !isEven;
            }
        }
        const lat = (latR[0] + latR[1]) / 2;
        const lon = (lonR[0] + lonR[1]) / 2;
        return { lat, lon } as DD;
    };

    /**
     * Checks if a string is a valid geohash.
     * 
     * @param {string} str The string to check.
     * @returns {boolean} True if the string is a valid geohash, false otherwise.
     */
    public static isGeohash(str: string | undefined): boolean {
        if (!str || str === '') return false;
        str = str.toLowerCase();
        for (let i = 0; i < str.length; i++) {
            if (NDKEventGeoCoded.BASE32.indexOf(str.charAt(i)) === -1) {
                return false;
            }
        }
        return true;
    }

    /**
     * Calculates the great-circle distance between two points on the Earth's surface given their latitudes and longitudes.
     * This method is a helper for calculating distances using the Haversine formula.
     * 
     * @param {Coords} coords1 The DD or geohash of the first point
     * @param {Coords} coords2 The DD or geohash of the second point.
     * @returns {number} The distance between the two points in kilometers.
     * @public
     * @static
     */
    public static distance(coords1: Coords, coords2: Coords): number {
        const {lat: lat1, lon: lon1} = NDKEventGeoCoded.parseCoords(coords1);
        const {lat: lat2, lon: lon2} = NDKEventGeoCoded.parseCoords(coords2);
        const radius: number = this.EARTH_RADIUS; //km
        const latDeg: number = NDKEventGeoCoded.toRadians(lat2 - lat1);
        const lonDeg: number = NDKEventGeoCoded.toRadians(lon2 - lon1);
        const angle: number  =
            Math.sin(latDeg / 2) * Math.sin(latDeg / 2) +
            Math.cos(NDKEventGeoCoded.toRadians(lat1)) * 
            Math.cos(NDKEventGeoCoded.toRadians(lat2)) * 
            Math.sin(lonDeg / 2) * 
            Math.sin(lonDeg / 2);
        return radius * 2 * Math.atan2(Math.sqrt(angle), Math.sqrt(1 - angle));
    }

    /**
     * Parses a Coords object, potentially a geohash, into a DD object
     * 
     * @param {Coords} coords 
     * @returns A DD object
     */
    public static parseCoords = (coords: Coords): DD => {
        return typeof coords === 'string'
            ? NDKEventGeoCoded.decodeGeohash(coords as Geohash)
            : coords as DD;
    };

    /**
     * Converts an angle from degrees to radians.
     * 
     * @param {number} degrees The angle in degrees.
     * @returns {number} The angle in radians.
     * @public
     * @static
     */
    public static toRadians(degrees: number): number {
        return degrees*(Math.PI/180);
    }

    /**
     * Refines the search interval for a geohash decoding process based on a character from the geohash.
     * This method is part of the geohash decoding process, refining the latitude or longitude range.
     * 
     * @param {number[]} range The current range (latitude or longitude) being refined.
     * @param {number} charIndex The index of the character in the base32 string.
     * @param {number} bitMask The bitmask to apply for refining the range.
     */
    public static decodeIntRefine(range: number[], charIndex: number, bitMask: number): void {
        const mid = (range[0] + range[1]) / 2;
        if ((charIndex & bitMask) > 0) {
            range[0] = mid;
        } else {
            range[1] = mid;
        }
    }

    /**
     * Removes tags by marker (the value at last position in the tag array).
     * 
     * @param key The key to identify which tags to remove.
     */
    protected removeTagByMarker(key: string, marker: string) {
        this.tags = this.tags.filter(tag => !(tag[0] === key && tag[tag.length-1] === marker));
    }

    /**
     * Helper method to find a tag by its marker and length of its value.
     * 
     * @param key The key to identify which tag value to find.
     * @return The first value associated with the key, or undefined if not found.
     */
    protected tagValueByKeyAndLength(key: string, length: number): string | undefined {
        return this.tags.find(tag => tag[2] === key && tag[1].length === length)?.[1];
    }

    /**
     * Helper method to find a tag by its marker and potential type of its value
     * 
     * @param key The key to identify which tag value to find.
     * @return The first value associated with the key, or undefined if not found.
     */
    protected tagValueByKeyAndIsNumber(key: string): string | undefined {
        const candidates = this.tags.filter(tag => tag[2] === key)
        
        return candidates.find(tag => !isNaN(Number(tag[1])))?.[1]
    }

    /**
     * Helper method to find the first tag value by its marker.
     * 
     * @param key The key to identify which tag value to find.
     * @return The first value associated with the key, or undefined if not found.
     */
    protected tagValueByMarker(key: string, marker: string): string | undefined {
        const tag = this.tags.find(tag => tag[0] === key && tag[tag.length-1] === marker);
        return tag ? tag[1] : undefined;
    }

    /**
     * Helper method to find all tags by marker
     * 
     * @param key The key to identify which tag value to find.
     * @return The first value associated with the key, or undefined if not found.
     */
    protected tagValuesByMarker(key: string, marker: string): string[] | undefined {
        const tags = this.tags.filter(tag => tag[0] === key && tag[tag.length-1] === marker).map(tag => tag[1]).flat();
        return tags?.length ? tags : undefined;
    }

    /**
     * Retrieves tags that are indexed, identified by having their first element's length equal to 1.
     * 
     * @returns An array of NDKTag, filtered to include only indexed tags.
     * 
     * @protected
     */
    protected get indexedTags(): NDKTag[] {
        return this.tags.filter(tag => tag[0].length === 1);
    }

    /**
     * Adds a geo tags to the event's tags, updating or removing existing tags as necessary.
     * This method manages the insertion of geospatial information tags ('g') into the event's tag array.
     * 
     * @param {string} key The geospatial information key (e.g., "lat", "lon", "countryCode").
     * @param {string} value The value associated with the key.
     * @private
     */
    private _setGeoTag(key: string, value: string){
        this.removeTagByMarker("g", key);
        this.tags.push(["g", value, key]);
    }

    /**
     * Removes geohash tags ('gh') from the event's tags, cleaning up the tag array from geohash (gh) tags.
     * Additionally, It filters out legacy 'g' tags that represent NIP-52 geohashes, maintaining other geospatial tags intact.
     * 
     * @private
     */
    private _removeGeoHashes(): void {
        this.tags = this.tags.filter( tag => !(NDKEventGeoCoded.geohashFilterFn(tag)) ); 
    }

    /**
     * Updates the geohashes and corresponding tags for this instance.
     * 
     * This method is responsible for updating the internal tags to reflect a new set of geohashes. It first
     * removes any existing geohash-related tags, then adds a generic tag indicating the presence of geohash data
     * followed by individual tags for each geohash in the provided array.
     * 
     * @param geohashes - An array of geohash strings to be updated in the tags.
     * 
     * @private
     */
    private _updateGeohashTags(geohashes: Geohash[]) {
        this._removeGeoHashes();
        geohashes.forEach(gh => {
            this.tags.push(["g", gh]);
        });
    }
};