import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY_OPEN = 'sidebar-open';
const STORAGE_KEY_COLLAPSED = 'sidebar-collapsed';
const MOBILE_BREAKPOINT = 768;

function isMobile(): boolean {
	return browser && window.innerWidth < MOBILE_BREAKPOINT;
}

function getInitialOpenState(): boolean {
	if (!browser) return true;

	const stored = localStorage.getItem(STORAGE_KEY_OPEN);
	if (stored !== null) {
		return stored === 'true';
	}

	return !isMobile();
}

function getInitialCollapsedState(): boolean {
	if (!browser) return false;

	const stored = localStorage.getItem(STORAGE_KEY_COLLAPSED);
	if (stored !== null) {
		return stored === 'true';
	}

	return false;
}

function createSidebarStore() {
	const { subscribe, set, update } = writable<boolean>(getInitialOpenState());

	return {
		subscribe,
		toggle: () => update(value => {
			const newValue = !value;
			if (browser) {
				localStorage.setItem(STORAGE_KEY_OPEN, String(newValue));
			}
			return newValue;
		}),
		set: (value: boolean) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY_OPEN, String(value));
			}
			set(value);
		}
	};
}

function createSidebarCollapsedStore() {
	const { subscribe, set, update } = writable<boolean>(getInitialCollapsedState());

	return {
		subscribe,
		toggle: () => update(value => {
			const newValue = !value;
			if (browser) {
				localStorage.setItem(STORAGE_KEY_COLLAPSED, String(newValue));
			}
			return newValue;
		}),
		set: (value: boolean) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY_COLLAPSED, String(value));
			}
			set(value);
		}
	};
}

export const sidebarOpen = createSidebarStore();
export const sidebarCollapsed = createSidebarCollapsedStore();
