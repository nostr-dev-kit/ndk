<script lang="ts">
	import CodeBlock from '$lib/site/components/CodeBlock.svelte';
	import PageTitle from '$lib/site/components/PageTitle.svelte';
	import "$lib/styles/docs-page.css";

	// Import code examples
	import createProject from './examples/create-project.example?raw';
	import installTailwind from './examples/install-tailwind.example?raw';
	import viteConfig from './examples/vite-config.example?raw';
	import appCss from './examples/app-css.example?raw';
	import layout from './examples/layout.svelte.example?raw';
	import installNdk from './examples/install-ndk.example?raw';
	import installNdkOptional from './examples/install-ndk-optional.example?raw';
	import ndkConfig from './examples/ndk-config.example?raw';
	import installJsrepo from './examples/install-jsrepo.example?raw';
	import jsrepoInit from './examples/jsrepo-init.example?raw';
	import jsrepoConfig from './examples/jsrepo-config.example?raw';
	import installBiome from './examples/install-biome.example?raw';
	import jsrepoInfo from './examples/jsrepo-info.example?raw';
	import jsrepoAdd from './examples/jsrepo-add.example?raw';
	import usingComponents from './examples/using-components.svelte.example?raw';
	import jsrepoUpdate from './examples/jsrepo-update.example?raw';
	import jsrepoConfigReference from './examples/jsrepo-config-reference.example?raw';
	import ndkAdvancedConfig from './examples/ndk-advanced-config.example?raw';
</script>

<PageTitle
	title="Installation"
	subtitle="Complete guide to installing and configuring the @nostr/svelte component registry in your SvelteKit project."
/>

<div class="docs-page">
	<section>

	<h2>Prerequisites</h2>

	<p>Before you begin, ensure you have:</p>

	<ul>
		<li><strong>Node.js 18+</strong> or <strong>Bun</strong> installed</li>
		<li>A <strong>SvelteKit project</strong> with Svelte 5</li>
		<li><strong>Tailwind CSS v4</strong> (strongly recommended)</li>
		<li>Basic familiarity with Nostr and NDK concepts</li>
	</ul>

	</section>

	<section>
		<h2>Step 1: Create a SvelteKit Project</h2>

	<p>If you don't have a SvelteKit project yet, create one:</p>

	<CodeBlock
		language="bash"
		code={createProject}
	/>

	<p>When prompted, select:</p>
	<ul>
		<li><strong>Template:</strong> Minimal or your preferred option</li>
		<li><strong>TypeScript:</strong> Yes (recommended)</li>
		<li><strong>Add-ons:</strong> None required (we'll add Tailwind separately)</li>
	</ul>

	</section>

	<section>
		<h2>Step 2: Install Tailwind CSS v4</h2>

	<p>
		Tailwind CSS v4 provides the styling foundation for @nostr/svelte components. Install the
		Vite plugin:
	</p>

	<CodeBlock
		language="bash"
		code={installTailwind}
	/>

	<h3>Configure Vite</h3>

	<p>Add the Tailwind plugin to your <code>vite.config.ts</code>:</p>

	<CodeBlock
		language="typescript"
		code={viteConfig}
	/>

	<h3>Create CSS File</h3>

	<p>Create <code>src/app.css</code> and import Tailwind:</p>

	<CodeBlock language="css" code={appCss} />

	<h3>Import in Layout</h3>

	<p>Import the CSS in <code>src/routes/+layout.svelte</code>:</p>

	<CodeBlock
		language="svelte"
		code={layout}
	/>

	</section>

	<section>
		<h2>Step 3: Install NDK Dependencies</h2>

	<p>Install the core NDK packages that power @nostr/svelte components:</p>

	<CodeBlock
		language="bash"
		code={installNdk}
	/>

	<h3>Optional: Additional NDK Packages</h3>

	<p>Depending on your needs, you may want additional NDK packages:</p>

	<CodeBlock
		language="bash"
		code={installNdkOptional}
	/>

	</section>

	<section>
		<h2>Step 4: Configure NDK</h2>

	<p>Create an NDK instance that will be used throughout your application.</p>

	<p>Create <code>src/lib/ndk.ts</code>:</p>

	<CodeBlock
		language="typescript"
		code={ndkConfig}
	/>

	<div class="bg-blue-900/20 border border-blue-700 rounded-lg p-4 my-6">
		<p class="text-sm text-blue-200 m-0">
			<strong>💡 Tip:</strong> Sessions are automatically persisted to localStorage by default. Users
			will stay logged in across page reloads.
		</p>
	</div>

	</section>

	<section>
		<h2>Step 5: Install jsrepo CLI</h2>

	<p>
		jsrepo is the package manager for @nostr/svelte components. Install it globally to use across
		projects:
	</p>

	<CodeBlock
		language="bash"
		code={installJsrepo}
	/>

	</section>

	<section>
		<h2>Step 6: Initialize jsrepo</h2>

	<p>Initialize jsrepo in your project to configure component installation paths:</p>

	<CodeBlock language="bash" code={jsrepoInit} />

	<p>This will prompt you to configure:</p>
	<ul>
		<li><strong>Formatter:</strong> Choose between Prettier or Biome</li>
		<li><strong>Watermark:</strong> Whether to add attribution comments</li>
		<li><strong>Category paths:</strong> Where different component types should be installed</li>
	</ul>

	<h3>Recommended Path Configuration</h3>

	<CodeBlock
		language="json"
		code={jsrepoConfig}
	/>

	<h3>Install Formatter</h3>

	<p>If you chose Biome, install it:</p>

	<CodeBlock
		language="bash"
		code={installBiome}
	/>

	</section>

	<section>
		<h2>Step 7: Add Your First Components</h2>

	<p>Now you're ready to add components from the registry!</p>

	<h3>Browse Available Components</h3>

	<CodeBlock language="bash" code={jsrepoInfo} />

	<h3>Add Components</h3>

	<p>Install components individually or in groups:</p>

	<CodeBlock
		language="bash"
		code={jsrepoAdd}
	/>

	<p>When you add a component, jsrepo will:</p>
	<ol>
		<li>Download the component files</li>
		<li>Install any required dependencies</li>
		<li>Place files in the configured paths</li>
		<li>Apply formatting based on your configuration</li>
	</ol>

	</section>

	<section>
		<h2>Step 8: Using Components</h2>

	<p>Once installed, import and use components in your Svelte files:</p>

	<CodeBlock
		language="svelte"
		code={usingComponents}
	/>

	</section>

	<section>
		<h2>Updating Components</h2>

	<p>Keep your components up to date with the latest versions:</p>

	<CodeBlock
		language="bash"
		code={jsrepoUpdate}
	/>

	</section>

	<section>
		<h2>Configuration Options</h2>

	<h3>jsrepo.json Reference</h3>

	<p>Your <code>jsrepo.json</code> file controls how components are installed:</p>

	<CodeBlock
		language="json"
		code={jsrepoConfigReference}
	/>

	</section>

	<section>
		<h2>NDK Configuration</h2>

	<h3>Advanced NDK Setup</h3>

	<p>For production applications, consider this enhanced NDK configuration:</p>

	<CodeBlock
		language="typescript"
		code={ndkAdvancedConfig}
	/>

	</section>

	<section>
		<h2>Troubleshooting</h2>

	<h3>Components Not Found</h3>

	<p>If imports fail after adding components, check:</p>
	<ol>
		<li>Verify the component was added: <code>ls src/lib/components/</code></li>
		<li>Check your path configuration in <code>jsrepo.json</code></li>
		<li>Ensure TypeScript paths are configured in <code>tsconfig.json</code></li>
	</ol>

	<h3>Dependency Conflicts</h3>

	<p>If you see peer dependency warnings:</p>
	<ul>
		<li>These are usually safe to ignore if versions are close</li>
		<li>Update NDK packages to the latest versions</li>
		<li>Check the <code>package.json</code> in the registry for correct versions</li>
	</ul>

	<h3>Styling Issues</h3>

	<p>If components don't look right:</p>
	<ol>
		<li>Verify Tailwind CSS is properly configured</li>
		<li>Check that <code>app.css</code> is imported in your layout</li>
		<li>Ensure Tailwind v4 is installed (not v3)</li>
		<li>Try clearing Vite cache: <code>rm -rf .svelte-kit</code></li>
	</ol>

	<h3>NDK Connection Issues</h3>

	<p>If relays aren't connecting:</p>
	<ul>
		<li>Check browser console for WebSocket errors</li>
		<li>Verify relay URLs are correct and accessible</li>
		<li>Try different relays from <a href="https://nostr.watch">nostr.watch</a></li>
		<li>Check network/firewall settings</li>
	</ul>

	</section>

	<section>
		<h2>Next Steps</h2>

	<p>Now that you have @nostr/svelte installed, explore:</p>

	<ul>
		<li>
			<a href="/docs/components">Component Documentation</a> - Learn about all available components
		</li>
		<li>
			<a href="/docs/primitives-guide">UI Primitives Guide</a> - Build with composable primitives
		</li>
		<li><a href="/docs/subscriptions">Subscriptions</a> - Work with reactive Nostr data</li>
		<li><a href="/docs/guides">Guides</a> - Step-by-step tutorials</li>
		<li><a href="/components">Component Gallery</a> - See live examples</li>
	</ul>

	</section>

	<section class="next-section">
		<h2>Getting Help</h2>

	<p>Need assistance? Here are some resources:</p>

	<ul>
		<li><strong>GitHub Issues:</strong> Report bugs or request features</li>
		<li>
			<strong>NDK Documentation:</strong>
			<a href="https://github.com/nostr-dev-kit/ndk">NDK on GitHub</a>
		</li>
		<li>
			<strong>jsrepo Documentation:</strong>
			<a href="https://jsrepo.com">jsrepo.com</a>
		</li>
		<li><strong>Nostr Community:</strong> Ask questions on Nostr using the #asknostr hashtag</li>
	</ul>

	<div class="bg-purple-900/20 border border-purple-700 rounded-lg p-6 my-8">
		<h3 class="text-lg font-semibold text-purple-200 mt-0">Ready to Build!</h3>
		<p class="text-purple-100 mb-0">
			You now have everything you need to build amazing Nostr applications with Svelte 5. Start by
			browsing the component gallery and adding the components you need for your project.
		</p>
	</div>

	</section>
</div>
