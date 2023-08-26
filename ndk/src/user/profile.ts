import NDKEvent from "../events/index.js";

/**
 * NDKUserProfile represents a user's kind 0 profile metadata
 */
export type NDKUserProfile = {
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
};

export function mergeEvent(
    event: NDKEvent,
    profile: NDKUserProfile
): NDKUserProfile {
    const payload = JSON.parse(event.content);

    Object.keys(payload).forEach((key) => {
        switch (key) {
            case "name":
                profile.name = payload.name;
                break;
            case "display_name":
            case "displayName":
                profile.displayName =
                    payload.displayName || payload.display_name;
                break;
            case "image":
            case "picture":
                profile.image = payload.image || payload.picture;
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
