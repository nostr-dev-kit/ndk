import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|ts)",
    "../registry/**/*.stories.@(js|ts)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-svelte-csf",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/svelte-vite",
    options: {}
  },
  staticDirs: ['../static'],
  async viteFinal(config) {
    // Dynamically import the Svelte plugin
    const { svelte } = await import('@sveltejs/vite-plugin-svelte');
    const path = await import('path');

    // Ensure the Svelte plugin is registered
    config.plugins = config.plugins || [];

    // Check if svelte plugin already exists
    const hasSveltePlugin = config.plugins.some(plugin =>
      plugin && plugin.name && plugin.name.includes('vite-plugin-svelte')
    );

    if (!hasSveltePlugin) {
      config.plugins.unshift(svelte());
    }

    // Add $lib alias
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      $lib: path.resolve(__dirname, '../src/lib')
    };

    // Ensure .svelte.js files from dist are processed
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.exclude = config.optimizeDeps.exclude || [];
    config.optimizeDeps.exclude.push('@nostr-dev-kit/svelte');
    config.optimizeDeps.exclude.push('@storybook/addon-svelte-csf');

    return config;
  }
};

export default config;