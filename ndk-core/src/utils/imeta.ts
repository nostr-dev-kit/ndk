import type { NDKTag } from "../events";

export interface NDKImetaTag {
    url?: string;
    blurhash?: string;
    dim?: string;
    alt?: string;
    m?: string;
    x?: string;
    size?: string;
    fallback?: string[];
    [key: string]: string | string[] | undefined;
}

/**
 * Maps an imeta NDKTag to an NDKImetaTag
 */
export function mapImetaTag(tag: NDKTag): NDKImetaTag {
    const data: NDKImetaTag = {};

    // If we have a single value, split the string into key/value pairs
    if (tag.length === 2) {
        const parts = tag[1].split(" ");

        for (let i = 0; i < parts.length; i += 2) {
            const key = parts[i] as keyof NDKImetaTag;
            const value = parts[i + 1];
            if (key === "fallback") {
                if (!data.fallback) data.fallback = []; // Ensure fallback is initialized
                data.fallback.push(value); // Push value to fallback array
            } else {
                data[key] = value; // Assign value to other fields
            }
        }

        return data;
    }

    // Process all values in the tag
    const tags = tag.slice(1);
    for (const val of tags) {
        const parts = val.split(" ");
        const key = parts[0] as keyof NDKImetaTag;
        const value = parts.slice(1).join(" ");

        if (key === "fallback") {
            if (!data.fallback) data.fallback = []; // Ensure fallback is initialized
            data.fallback.push(value);
        } else {
            data[key] = value;
        }
    }

    return data;
}

/**
 * Converts an NDKImetaTag to an NDKTag
 */
export function imetaTagToTag(imeta: NDKImetaTag): NDKTag {
    const tag: NDKTag = ["imeta"];

    for (const [key, value] of Object.entries(imeta)) {
        if (Array.isArray(value)) {
            for (const v of value) {
                tag.push(`${key} ${v}`);
            }
        } else if (value) {
            tag.push(`${key} ${value}`);
        }
    }

    return tag;
}
