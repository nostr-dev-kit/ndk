import NDKUser from './index.js';

export async function follows(this: NDKUser): Promise<Set<NDKUser>> {
    if (!this.ndk) throw new Error('NDK not set');

    const contactListEvents = await this.ndk.fetchEvents({
        kinds: [3],
        authors: [this.hexpubkey()],
    });

    if (contactListEvents) {
        const contactList = new Set<NDKUser>();

        contactListEvents.forEach(event => {
            event.tags.forEach((tag: string[]) => {
                if (tag[0] === 'p') {
                    try {
                        const user = new NDKUser({hexpubkey: tag[1]});
                        user.ndk = this.ndk;
                        contactList.add(user);
                    } catch (e) { /* empty */ }
                }
            });
        });

        return contactList;
    }

    return new Set<NDKUser>();
}
