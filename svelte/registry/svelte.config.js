import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'$site': './src/lib/site',
			'$site-components': './src/lib/site/components'
		}
	},
	onwarn: (warning, handler) => {
		// Suppress false-positive a11y warnings and other non-critical warnings
		const suppressedWarnings = [
			'a11y_no_static_element_interactions',
			'a11y_click_events_have_key_events',
			'a11y_no_noninteractive_tabindex',
			'a11y_no_noninteractive_element_interactions',
			'a11y_consider_explicit_label',
			'a11y_missing_attribute',
			'a11y_invalid_attribute',
			'a11y_label_has_associated_control',
			'state_referenced_locally',
			'element_invalid_self_closing_tag',
			'unused_export_let'
		];

		// Suppress unused import warnings
		if (warning.code === 'module_script_reactive_declaration' ||
		    warning.message?.includes('imported from external module') ||
		    warning.message?.includes('but never used')) {
			return;
		}

		if (suppressedWarnings.includes(warning.code)) {
			return;
		}

		handler(warning);
	}
};

export default config;
