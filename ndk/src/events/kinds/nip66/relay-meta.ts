import type { NDKEvent } from "../../index.js";
import { NDKKind } from "../index.js";
import type { NDK } from "../../../ndk/index.js";
import type { NostrEvent } from "../../index.js";
import { NDKRelayDiscovery } from "./relay-discovery.js";

export type RelayMetaParsed = Record<string, RelayMetaData> | undefined 
export type RelayMetaParsedAll = Record<string, RelayMetaParsed>

export type RelayMetaData =  RelayMetaDataArray | RelayMetaDataValue
export type RelayMetaDataArray = RelayMetaDataValue[]
export type RelayMetaDataValue = number | string | boolean | undefined

const REGEX_IPV4: RegExp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
const REGEX_GEOHASH: RegExp = /^[0-9b-hjkmnp-z]{1,12}$/;

/**
 * NDKRelayMeta [NIP-66]
 * 
 * Supports the following tags:
 * - d: url
 * - other: { [key: string]: RelayMetaData }
 * - rtt: { [key: string]: number }
 * - nip11: { [key: string]: RelayMetaData }
 * - dns: { [key: string]: RelayMetaData }
 * - geo: { [key: string]: RelayMetaData }
 * - ssl: { [key: string]: RelayMetaData }
 * 
 * @author sandwichfarm 
 * @summary NIP-66 NDKRelayMeta
 * @extends NDKEvent
 */
export class NDKRelayMeta extends NDKRelayDiscovery {
    static readonly groups = ['other', 'rtt', 'nip11', 'dns', 'geo', 'ssl', 'counts'];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.NDKRelayMeta;
    }

    static from(event: NDKEvent): NDKRelayMeta {
        return new NDKRelayMeta(event.ndk, event.rawEvent());
    }

    get url(): string | undefined { 
        return this.tagValue("d");
    }

    set url(value: string | undefined) {
        this.removeTag("d");
        if (value) {
            this.tags.push(["d", value]);
        }
    }

    get other(): RelayMetaParsed {
        return this.getGroupedTag("other");
    }

    set other(values: { [key: string]: RelayMetaData } ) {
        this.setGroupedTag("other", values);
    }

    get rtt(): RelayMetaParsed {
        return this.getGroupedTag("rtt");
    }

    set rtt(values: { [key: string]: number } ) {
        this.setGroupedTag("rtt", values);
    }

    get nip11(): RelayMetaParsed {
        return this.getGroupedTag("nip11");
    }

    set nip11(values: { [key: string]: RelayMetaData } ) {
        this.setGroupedTag("nip11", values);
    }

    get dns(): RelayMetaParsed {
        return this.getGroupedTag("dns");
    }

    set dns(values: { [key: string]: RelayMetaData } ) {
        this.setGroupedTag("dns", values);
    }

    get geo(): RelayMetaParsed {
        return this.getGroupedTag("geo");
    }

    set geo(values: { [key: string]: RelayMetaData } ) {
        this.setGroupedTag("geo", values);
    }

    get ssl(): RelayMetaParsed {
        return this.getGroupedTag("ssl");
    }

    set ssl(values: { [key: string]: RelayMetaData } ) {
        this.setGroupedTag("ssl", values);
    }

    get counts(): RelayMetaParsed {
        return this.getGroupedTag("counts");
    }

    set counts(values: { [key: string]: RelayMetaData } ) {
        this.setGroupedTag("counts", values);
    }
    
    /**
     * Retrieves all metadata grouped by their respective key.
     * 
     * @returns An object where each key is a metadata category (e.g., 'rtt', 'nip11', 'dns', 'geo', 'ssl', 'counts'), and the value is the parsed metadata for that category.
     */
    get all(): RelayMetaParsedAll {
        const result: RelayMetaParsedAll = {};
        NDKRelayMeta.groups.forEach(group => {
            const data = this.getGroupedTag(group);
            if(data){
                result[group] = data;
            }
        });
        return result;
    }

    /**
     * Groups tags by a specific group and parses their values.
     * 
     * @param group The key sto group tags by.
     * @returns An object where each key is a tag within the specified group and its value is either a single metadata value or an array of metadata values, all cast to their appropriate types.
     * 
     * @private
     */
    private getGroupedTag( group: string ): RelayMetaParsed {
        const tags = this.tags.filter(tag => tag[0] === group);
        const data: RelayMetaParsed = {};

        tags.forEach(_tag => {
            const tag = [..._tag];
            tag.shift();
            const [key, ...values] = tag;
            if (!data?.[key]) {
                data[key] = values.length === 1
                    ? this.castValue(values[0])
                    : values.map((v) => this.castValue(v)) as RelayMetaDataArray;
            } 
            else {
                data[key] = [ ...values.map((v) => this.castValue(v, key)) ];
            }
        });
        Object.keys(data).forEach( key => {
            if(typeof data[key] === 'undefined'){
                delete data[key];
            }
        });
        return data;
    }

    /**
     * Sets or updates tags grouped by a specific group with provided values.
     * 
     * @param group The category of the tags to set or update.
     * @param values An object where keys represent the tag names within the group, and the values are the data to be set for those tags.
     * 
     * @private
     */
    private setGroupedTag(group: string, values: { [key: string]: RelayMetaData }) {
        this.removeTag(group); // Assuming this removes all tags starting with `group`
        Object.entries(values).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(val => this.tags.push([group, key, String(val)]));
            } else {
                this.tags.push([group, key, String(value)]);
            }
        });
    }

    /**
     * Casts a tag value to its appropriate type based on its content and optionally a key.
     * 
     * @param value The string value of the tag to cast.
     * @param key Optionally, the key associated with the value, which may influence the casting (e.g., 'geohash').
     * @returns The value cast to either a boolean, number, or string, or left as undefined if it cannot be reliably cast.
     * 
     * @private
     */
    private castValue( value: string, key?: string ): RelayMetaDataValue {
        if (value.toLowerCase() === "true") {
            return true;
        }
        if (value.toLowerCase() === "false") {
            return false;
        }
        //don't cast IP as float
        if (REGEX_IPV4.test(value)) {
            return value;
        }
        const maybeGeohash = REGEX_GEOHASH.test(value);
        if ( key === 'geohash' ){
            if( !maybeGeohash ){
                return undefined;
            }
            return value;
        }
        const asFloat = parseFloat(value);
        if (!isNaN(asFloat) && isFinite(asFloat) && String(asFloat) === value) {
            return asFloat;
        }
        return value;
    }
}
