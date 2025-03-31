<script lang="ts">
import { prettifyNip05 } from "$lib/utils/user";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { createEventDispatcher } from "svelte";

export let ndk: NDK;
export let content: string;

let _renderedContent = content;
let _update = new Date();

const dispatch = createEventDispatcher();

const MENTION_REGEXP = /nostr:n(pub|profile)1[\d\w]+/gi;

const profiles = new Map<string, NDKUserProfile | false>();

for (const match of content.matchAll(MENTION_REGEXP)) {
    const [mention] = match;
    const data = mention.split(":")[1];

    if (data && !profiles.has(data)) {
        profiles.set(data, false);
        ndk.getUser({ npub: data })
            .fetchProfile()
            .then((profile) => {
                if (profile) profiles.set(data, profile);

                updateContent();
            });
    }
}

function updateContent() {
    _renderedContent = content.replace(MENTION_REGEXP, (mention) => {
        const key = mention.split(":")[1];

        if (key && profiles.has(key)) {
            const profile = profiles.get(key);
            if (profile) {
                let val = `<button class="name mention" `;

                if (profile.nip05) val += `data-nip05="${prettifyNip05(profile.nip05)}" `;
                val += `data-id="${key}">${profile.display_name ?? profile.name}</button>`;

                return val;
            }
        }

        return mention;
    });

    _update = new Date();
}

updateContent();

function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains("name")) {
        dispatch("click", {
            type: "profile",
            npub: target.dataset.id,
            nip05: target.dataset.nip05,
        });
    }
}
</script>

<div on:click={handleClick}>
    {@html renderedContent}
</div>