import { NDKEvent } from "./index.js";

import type { NDK } from "../ndk/index.js";
import type { NDKTag, NostrEvent } from "./index.js";
import { decodeGeohash, distance, encodeGeohash, isGeohash, parseCoords } from "../utils/geohash.js";

import type { Coords, DD, Geohash } from "../utils/geohash.js";

export type EventGeoCodedObject = Record<string, string | string[] | number | boolean>

/**
 * 
 * This class represents a geocoded Nostr event.
 * 
 * @author sandwich.farm
 * @extends NDKEvent
 * 
 */
export class NDKEventGeoCoded extends NDKEvent {

    private static readonly geohashFilterFn = (tag: NDKTag) => tag[0] === 'g'; //`g` tags with a length of 2 are NIP-52 geohashes

    private _dd: DD | undefined;

    constructor( ndk: NDK | undefined, rawEvent?: NostrEvent ) {
        super(ndk, rawEvent);
        if(isGeohash(this.geohash)){
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
            const { lat, lon } = decodeGeohash(coords);
            this.lat = lat;
            this.lon = lon;
        } else if ('lat' in coords && 'lon' in coords) {
            this.lat = coords.lat;
            this.lon = coords.lon;
            this.geohash = encodeGeohash(coords) as Geohash; // This updates geohash and geohashes based on lat & lon
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
        if(!isGeohash(value)) return;
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
        values = values.filter(isGeohash);
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
     * Sorts an array of `NDKEventGeoCoded` instances based on their distance from a given latitude and longitude.
     * 
     * @param coords An object containing the reference latitude (`lat`) and longitude (`lon`) or a geohash.
     * @param geoCodedEvents An array of `NDKEventGeoCoded` instances to be sorted.
     * @param asc Determines the sort order. `true` for ascending (default), `false` for descending.
     * @returns A sorted array of `NDKEventGeoCoded` instances.
     * @throws {Error} If the latitude or longitude is not a finite number.
     */
    public static sortGeospatial = (
        coords: Coords, 
        geoCodedEvents: Set<NDKEventGeoCoded>, 
        asc: boolean = true
    ): Set<NDKEventGeoCoded> => {
        const events = Array.from(geoCodedEvents).filter( (event: NDKEventGeoCoded) => event?.lat && event?.lon);
        const {lat, lon} = parseCoords(coords);
        if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) 
            throw new Error('(lat) and (lon), respectively, must be numbers and finite.');
        events.sort((a, b) => {
            if(!a?.lat || !a?.lon || !b?.lat || !b?.lon) return 0;
            const distanceA = distance({lat, lon} as DD, {lat: a.lat, lon: a.lon} as DD);
            const distanceB = distance({lat, lon} as DD, {lat: b.lat, lon: b.lon} as DD);
            return asc ? distanceA - distanceB : distanceB - distanceA;
        });
        return new Set(events) as Set<NDKEventGeoCoded>;
    };

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