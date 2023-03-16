import {Event} from '../events/';

export default class UserProfile {
    name?: string;
    displayName?: string;
    image?: string;
    banner?: string;
    bio?: string;
    nip05?: string;
    lud16?: string;
    about?: string;
    zapService?: string;

    mergeEvent(event: Event): void {
        const payload = JSON.parse(event.content);

        if (payload.name) this.name = payload.name;
        if (payload.display_name) this.displayName = payload.display_name;
        if (payload.displayName) this.displayName = payload.displayName;
        if (payload.image) this.image = payload.image;
        if (payload.banner) this.banner = payload.banner;
        if (payload.bio) this.bio = payload.bio;
        if (payload.nip05) this.nip05 = payload.nip05;
        if (payload.lud16) this.lud16 = payload.lud16;
        if (payload.about) this.about = payload.about;
        if (payload.zapService) this.zapService = payload.zapService;
    }
}
