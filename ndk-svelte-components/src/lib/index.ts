import EventCard from "./event/EventCard.svelte";
import EventCardDropdownMenu from "./event/EventCardDropdownMenu.svelte";
import EventContent from "./event/content/EventContent.svelte";
import RelayList from "./relay/RelayList.svelte";
import Avatar from "./user/Avatar.svelte";
import Name from "./user/Name.svelte";
import Nip05 from "./user/Nip05.svelte";
import UserCard from "./user/UserCard.svelte";
import EventThread from "./event/EventThread.svelte";

export * from "./utils";

export type UrlType = "hashtag" | "mention";

export type UrlFactory = (type: UrlType, value: string) => string;

export {
    // Event
    EventContent,
    EventCard,
    EventCardDropdownMenu,
    EventThread,

    // User
    Avatar,
    Name,
    Nip05,
    UserCard,

    // Relay
    RelayList,
};
