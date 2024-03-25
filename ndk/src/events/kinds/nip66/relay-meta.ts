import { NDKEvent } from "../../index.js";
import { NDKKind } from "../index.js";
import type { NDK } from "../../../ndk/index.js";
import type { NostrEvent } from "../../index.js";

export type RelayMetaParsed = Record<string, RelayMetaData> | undefined 
export type RelayMetaParsedAll = Record<string, RelayMetaParsed>

export type RelayMetaData =  RelayMetaDataArray | RelayMetaDataValue
export type RelayMetaDataArray = RelayMetaDataValue[]
export type RelayMetaDataValue = number | string | boolean | undefined

const REGEX_IPV4: RegExp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
const REGEX_GEOHASH: RegExp = /^[0-9b-hjkmnp-z]{1,12}$/;

/**
 * RelayMeta [NIP-66]
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
 * @summary NIP-66 RelayMeta
 * @extends NDKEvent
 */
export class RelayMeta extends NDKEvent {
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.RelayMeta;
    }

    static from(event: NDKEvent): RelayMeta {
        return new RelayMeta(event.ndk, event.rawEvent());
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

    get all(): RelayMetaParsedAll {
        const result: RelayMetaParsedAll = {};
        ['rtt', 'nip11', 'dns', 'geo', 'ssl'].forEach(group => {
            const data = this.getGroupedTag(group);
            if(data){
                result[group] = data;
            }
        });
        return result;
    }

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

    private castValue( value: string, key?: string ): RelayMetaDataValue {
        if (value.toLowerCase() === "true") {
            return true;
        }
        if (value.toLowerCase() === "false") {
            return false;
        }
        //don't accidentally cast IP as float
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
