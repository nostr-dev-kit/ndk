import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'sidebar-open';
const MOBILE_BREAKPOINT = 768;

function isMobile(): boolean {
	return browser && window.innerWidth < MOBILE_BREAKPOINT;
}

function getInitialState(): boolean {
	if (!browser) return true;

	// Check localStorage first
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored !== null) {
		return stored === 'true';
	}

	// Default: open on desktop, closed on mobile
	return !isMobile();
}

function createSidebarStore() {
	const { subscribe, set, update } = writable<boolean>(getInitialState());

	return {
		subscribe,
		toggle: () => update(value => {
			const newValue = !value;
			if (browser) {
				localStorage.setItem(STORAGE_KEY, String(newValue));
			}
			return newValue;
		}),
		set: (value: boolean) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY, String(value));
			}
			set(value);
		}
	};
}

export const sidebarOpen = createSidebarStore();
