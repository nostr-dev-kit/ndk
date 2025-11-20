import Root from './user-root.svelte';
import Avatar from './user-avatar.svelte';
import Name from './user-name.svelte';
import Field from './user-field.svelte';
import Handle from './user-handle.svelte';
import Bio from './user-bio.svelte';
import Banner from './user-banner.svelte';
import Nip05 from './user-nip05.svelte';

export const User = {
	Root,
	Avatar,
	Name,
	Field,
	Handle,
	Bio,
	Banner,
	Nip05
};

export type { UserContext } from './user.context.js';
