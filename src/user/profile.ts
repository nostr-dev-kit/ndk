import NDKEvent from "../events/index.js";

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

export function mergeEvent(event: NDKEvent, profile: NDKUserProfile): NDKUserProfile {
    const payload = JSON.parse(event.content);

    if (payload.name) profile.name = payload.name;
    if (payload.display_name) profile.displayName = payload.display_name;
    if (payload.displayName) profile.displayName = payload.displayName;
    if (payload.image) profile.image = payload.image;
    if (payload.picture) profile.image = payload.picture;
    if (payload.banner) profile.banner = payload.banner;
    if (payload.bio) profile.bio = payload.bio;
    if (payload.nip05) profile.nip05 = payload.nip05;
    if (payload.lud06) profile.lud06 = payload.lud06;
    if (payload.lud16) profile.lud16 = payload.lud16;
    if (payload.about) profile.about = payload.about;
    if (payload.zapService) profile.zapService = payload.zapService;
    if (payload.website) profile.website = payload.website;

    return profile;
}
