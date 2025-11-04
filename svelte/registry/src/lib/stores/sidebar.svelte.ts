import { browser } from '$app/environment';

const STORAGE_KEY_OPEN = 'sidebar-open';
const STORAGE_KEY_COLLAPSED = 'sidebar-collapsed';
const MOBILE_BREAKPOINT = 768;

function isMobile(): boolean {
	return browser && window.innerWidth < MOBILE_BREAKPOINT;
}

class SidebarState {
	open = $state(true);
	collapsed = $state(false);

	constructor() {
		if (browser) {
			this.initialize();
		}
	}

	private initialize() {
		const storedOpen = localStorage.getItem(STORAGE_KEY_OPEN);
		if (storedOpen !== null) {
			this.open = storedOpen === 'true';
		} else {
			this.open = !isMobile();
		}

		const storedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED);
		if (storedCollapsed !== null) {
			this.collapsed = storedCollapsed === 'true';
		}
	}

	toggleOpen() {
		this.open = !this.open;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_OPEN, String(this.open));
		}
	}

	toggleCollapsed() {
		this.collapsed = !this.collapsed;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_COLLAPSED, String(this.collapsed));
		}
	}

	setOpen(value: boolean) {
		this.open = value;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_OPEN, String(value));
		}
	}

	setCollapsed(value: boolean) {
		this.collapsed = value;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_COLLAPSED, String(value));
		}
	}
}

export const sidebar = new SidebarState();
