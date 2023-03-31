import Event from '../events/';

export interface UserProfile {
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
}

export function mergeEvent(event: Event, profile: UserProfile): UserProfile {
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

    return profile;
}
