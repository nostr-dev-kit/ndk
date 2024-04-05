import type { NDKEvent } from "../events/index.js";

/**
 * NDKUserProfile represents a user's kind 0 profile metadata
 */
export interface NDKUserProfile {
    [key: string]: string | undefined; // allows custom fields
    name?: string;
    displayName?: string;
    image?: string;
    banner?: string;
    bio?: string;
    nip05?: string;
    lud06?: string;
    lud16?: string;
    about?: string;
    zapService?: string;
    website?: string;
}

export function profileFromEvent(event: NDKEvent): NDKUserProfile {
    const profile: NDKUserProfile = {};
    let payload: NDKUserProfile;

    try {
        payload = JSON.parse(event.content);
    } catch (error) {
        throw new Error(`Failed to parse profile event: ${error}`);
    }

    Object.keys(payload).forEach((key) => {
        switch (key) {
            case "name":
                profile.name = payload.name;
                break;
            case "display_name":
                profile.displayName = payload.display_name;
                break;
            case "image":
            case "picture":
                profile.image = payload.picture || payload.image;
                break;
            case "banner":
                profile.banner = payload.banner;
                break;
            case "bio":
                profile.bio = payload.bio;
                break;
            case "nip05":
                profile.nip05 = payload.nip05;
                break;
            case "lud06":
                profile.lud06 = payload.lud06;
                break;
            case "lud16":
                profile.lud16 = payload.lud16;
                break;
            case "about":
                profile.about = payload.about;
                break;
            case "zapService":
                profile.zapService = payload.zapService;
                break;
            case "website":
                profile.website = payload.website;
                break;
            default:
                profile[key] = payload[key];
                break;
        }
    });

    return profile;
}

export function serializeProfile(profile: NDKUserProfile): string {
    const payload: any = {};

    // Remap some keys from bad clients into good ones per NIP-24
    for (const [key, val] of Object.entries(profile)) {
        switch (key) {
            case "username":
            case "name":
                payload.name = val;
                break;
            case "displayName":
                payload.display_name = val;
                break;
            case "image":
            case "picture":
                payload.picture = val;
                break;
            case "bio":
            case "about":
                payload.about = val;
                break;
            default:
                payload[key] = val;
                break;
        }
    }

    return JSON.stringify(payload);
}
