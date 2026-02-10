<script lang="ts">
	import CodeBlock from '$lib/site/components/CodeBlock.svelte';
	import { PMCommand } from '$lib/site/components/ui/pm-command';
	import PageTitle from '$lib/site/components/PageTitle.svelte';
	import * as Tabs from '$lib/site/components/ui/tabs';
	import "$lib/site/styles/docs-page.css";

	// Import code examples
	import viteConfig from './examples/vite-config.example?raw';
	import appCss from './examples/app-css.example?raw';
	import layout from './examples/layout.svelte.example?raw';
	import ndkConfig from './examples/ndk-config.example?raw';
	import layoutInit from './examples/layout-init.svelte.example?raw';
	import jsrepoInit from './examples/jsrepo-init.example?raw';
	import jsrepoConfig from './examples/jsrepo-config.example?raw';
	import jsrepoInfo from './examples/jsrepo-info.example?raw';
	import jsrepoAdd from './examples/jsrepo-add.example?raw';
	import usingComponents from './examples/using-components.svelte.example?raw';
	import jsrepoUpdate from './examples/jsrepo-update.example?raw';
	import jsrepoConfigReference from './examples/jsrepo-config-reference.example?raw';
	import ndkAdvancedConfig from './examples/ndk-advanced-config.example?raw';
</script>

<PageTitle
	title="Installation"
  subtitle="Complete guide to installing and configuring the @nostr-dev-kit/svelte component registry in your SvelteKit project."
/>

<div class="docs-page">
	<Tabs.Root value="existing" class="w-full">
		<Tabs.List class="mb-8">
			<Tabs.Trigger value="existing">Add to Existing Project</Tabs.Trigger>
			<Tabs.Trigger value="new">New Project</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="existing">
			<section>
				<h2>Prerequisites</h2>

				<p>Before you begin, ensure you have:</p>

				<ul>
					<li><strong>SvelteKit project</strong> with Svelte 5</li>
					<li><strong>Tailwind CSS v4</strong> configured (recommended)</li>
					<li>Basic familiarity with Nostr and NDK concepts</li>
				</ul>
			</section>

			<section>
				<h2>Step 1: Install NDK Dependencies</h2>

<p>Install the core NDK packages that power @nostr-dev-kit/svelte components:</p>

	<PMCommand command="add" args={["@nostr-dev-kit/ndk", "@nostr-dev-kit/svelte"]} />

	<h3>Optional: Additional NDK Packages</h3>

	<p>Depending on your needs, you may want additional NDK packages:</p>

	<PMCommand command="add" args={["@nostr-dev-kit/cache-sqlite-wasm", "@nostr-dev-kit/sessions", "@nostr-dev-kit/wallet", "@nostr-dev-kit/wot", "@nostr-dev-kit/sync"]} />

			</section>

			<section>
				<h2>Step 2: Configure NDK with SQLite WASM Cache</h2>

	<p>Create an NDK instance that will be used throughout your application.</p>

	<h3>1. Copy SQLite WASM Files</h3>

	<p>If you're using the <code>@nostr-dev-kit/cache-sqlite-wasm</code> adapter, you need to copy the WASM files to your static directory:</p>

	<CodeBlock
		lang="bash"
		code="cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/*.wasm static/
cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js static/"
	/>

	<p>These files are required for the SQLite WASM cache adapter to work properly.</p>

	<h3>2. Create NDK Configuration</h3>

	<p>Create <code>src/lib/ndk.ts</code>:</p>

	<CodeBlock
		lang="typescript"
		code={ndkConfig}
	/>

	<h3>3. Initialize NDK in Your App</h3>

	<p>Call the initialization function when your app starts, typically in <code>+layout.svelte</code>:</p>

	<CodeBlock
		lang="svelte"
		code={layoutInit}
	/>

	<div class="bg-blue-900/20 border border-blue-700 rounded-lg p-4 my-6">
		<p class="text-sm text-blue-200 m-0">
			<strong>💡 Tip:</strong> Sessions are automatically persisted to localStorage by default. Users
			will stay logged in across page reloads. The SQLite WASM cache provides superior performance
			compared to IndexedDB-based solutions.
		</p>
			</div>

			</section>

			<section>
				<h2>Step 3: Install jsrepo CLI</h2>

	<p>
    jsrepo is the package manager for @nostr-dev-kit/svelte components. Install it globally to use across
		projects:
	</p>

	<PMCommand command="add" args={["-g", "jsrepo"]} />

	<p>Verify the installation:</p>

	<CodeBlock lang="bash" code="jsrepo --version" />

			</section>

			<section>
				<h2>Step 4: Initialize jsrepo</h2>

	<p>Initialize jsrepo in your project to configure component installation paths:</p>

	<CodeBlock lang="bash" code={jsrepoInit} />

	<p>This will prompt you to configure:</p>
	<ul>
		<li><strong>Formatter:</strong> Choose between Prettier or Biome</li>
		<li><strong>Watermark:</strong> Whether to add attribution comments</li>
		<li><strong>Category paths:</strong> Where different component types should be installed</li>
	</ul>

	<h3>Recommended Path Configuration</h3>

	<CodeBlock
		lang="json"
		code={jsrepoConfig}
	/>

			</section>

			<section>
				<h2>Step 5: Add Your First Components</h2>

	<p>Now you're ready to add components from the registry!</p>

	<h3>Browse Available Components</h3>

	<CodeBlock lang="bash" code={jsrepoInfo} />

	<h3>Add Components</h3>

	<p>Install components individually or in groups:</p>

	<CodeBlock
		lang="bash"
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
				<h2>Step 6: Using Components</h2>

	<p>Once installed, import and use components in your Svelte files:</p>

	<CodeBlock
		lang="svelte"
		code={usingComponents}
	/>

	<div class="bg-purple-900/20 border border-purple-700 rounded-lg p-4 my-6">
		<p class="text-sm text-purple-200 mb-2">
			<strong>📝 Note:</strong> By setting NDK in Svelte context (Step 4, section 3), components
			automatically access your NDK instance without needing to pass it as a prop. You can also
			pass <code>ndk</code> explicitly if needed: <code>&lt;EventCard {'{ndk}'} {'{event}'} /&gt;</code>
		</p>
			</div>

			</section>

			<section>
				<h2>Step 7: Configure Event Rendering</h2>

	<p>
		To properly render Nostr events with rich content (markdown, embeds, etc.), you'll need to configure
		content renderers. Visit the interactive configuration builder to customize how your events are displayed:
	</p>

	<div class="my-4">
		<a
			href="/events/basics"
			class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
		>
			Configure Event Renderers →
		</a>
	</div>

	<p>The configuration builder will help you set up:</p>
	<ul>
		<li>Markdown rendering for formatted text</li>
		<li>Media embeds (images, videos, audio)</li>
		<li>Link previews</li>
		<li>Code highlighting</li>
		<li>Custom content transformers</li>
	</ul>

			</section>
		</Tabs.Content>

		<Tabs.Content value="new">
			<section>
				<h2>Prerequisites</h2>

				<p>Before you begin, ensure you have:</p>

				<ul>
					<li><strong>Node.js 18+</strong> or <strong>Bun</strong> installed</li>
					<li>Basic familiarity with Nostr and NDK concepts</li>
				</ul>
			</section>

			<section>
				<h2>Step 1: Create a SvelteKit Project</h2>

				<p>Create a new SvelteKit project:</p>

				<CodeBlock lang="bash" code="npm create svelte@latest my-nostr-app
cd my-nostr-app" />

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
					Tailwind CSS v4 provides the styling foundation for @nostr-dev-kit/svelte components. Install the
					Vite plugin:
				</p>

				<PMCommand command="add" args={["-D", "@tailwindcss/postcss@next", "tailwindcss@next"]} />

				<h3>Configure Vite</h3>

				<p>Add the Tailwind plugin to your <code>vite.config.ts</code>:</p>

				<CodeBlock
					lang="typescript"
					code={viteConfig}
				/>

				<h3>Create CSS File</h3>

				<p>Create <code>src/app.css</code> and import Tailwind:</p>

				<CodeBlock lang="css" code={appCss} />

				<h3>Import in Layout</h3>

				<p>Import the CSS in <code>src/routes/+layout.svelte</code>:</p>

				<CodeBlock
					lang="svelte"
					code={layout}
				/>
			</section>

			<section>
				<h2>Step 3: Install NDK Dependencies</h2>

				<p>Install the core NDK packages that power @nostr-dev-kit/svelte components:</p>

				<PMCommand command="add" args={["@nostr-dev-kit/ndk", "@nostr-dev-kit/svelte"]} />

				<h3>Optional: Additional NDK Packages</h3>

				<p>Depending on your needs, you may want additional NDK packages:</p>

				<PMCommand command="add" args={["@nostr-dev-kit/cache-sqlite-wasm", "@nostr-dev-kit/sessions", "@nostr-dev-kit/wallet", "@nostr-dev-kit/wot", "@nostr-dev-kit/sync"]} />
			</section>

			<section>
				<h2>Step 4: Configure NDK with SQLite WASM Cache</h2>

				<p>Create an NDK instance that will be used throughout your application.</p>

				<h3>1. Copy SQLite WASM Files</h3>

				<p>If you're using the <code>@nostr-dev-kit/cache-sqlite-wasm</code> adapter, you need to copy the WASM files to your static directory:</p>

				<CodeBlock
					lang="bash"
					code="cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/*.wasm static/
cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js static/"
				/>

				<p>These files are required for the SQLite WASM cache adapter to work properly.</p>

				<h3>2. Create NDK Configuration</h3>

				<p>Create <code>src/lib/ndk.ts</code>:</p>

				<CodeBlock
					lang="typescript"
					code={ndkConfig}
				/>

				<h3>3. Initialize NDK in Your App</h3>

				<p>Call the initialization function when your app starts, typically in <code>+layout.svelte</code>:</p>

				<CodeBlock
					lang="svelte"
					code={layoutInit}
				/>

				<div class="bg-blue-900/20 border border-blue-700 rounded-lg p-4 my-6">
					<p class="text-sm text-blue-200 m-0">
						<strong>💡 Tip:</strong> Sessions are automatically persisted to localStorage by default. Users
						will stay logged in across page reloads. The SQLite WASM cache provides superior performance
						compared to IndexedDB-based solutions.
					</p>
				</div>
			</section>

			<section>
				<h2>Step 5: Install jsrepo CLI</h2>

				<p>
					jsrepo is the package manager for @nostr-dev-kit/svelte components. Install it globally to use across
					projects:
				</p>

				<PMCommand command="add" args={["-g", "jsrepo"]} />

				<p>Verify the installation:</p>

				<CodeBlock lang="bash" code="jsrepo --version" />
			</section>

			<section>
				<h2>Step 6: Initialize jsrepo</h2>

				<p>Initialize jsrepo in your project to configure component installation paths:</p>

				<CodeBlock lang="bash" code={jsrepoInit} />

				<p>This will prompt you to configure:</p>
				<ul>
					<li><strong>Formatter:</strong> Choose between Prettier or Biome</li>
					<li><strong>Watermark:</strong> Whether to add attribution comments</li>
					<li><strong>Category paths:</strong> Where different component types should be installed</li>
				</ul>

				<h3>Recommended Path Configuration</h3>

				<CodeBlock
					lang="json"
					code={jsrepoConfig}
				/>
			</section>

			<section>
				<h2>Step 7: Add Your First Components</h2>

				<p>Now you're ready to add components from the registry!</p>

				<h3>Browse Available Components</h3>

				<CodeBlock lang="bash" code={jsrepoInfo} />

				<h3>Add Components</h3>

				<p>Install components individually or in groups:</p>

				<CodeBlock
					lang="bash"
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
					lang="svelte"
					code={usingComponents}
				/>

				<div class="bg-purple-900/20 border border-purple-700 rounded-lg p-4 my-6">
					<p class="text-sm text-purple-200 mb-2">
						<strong>📝 Note:</strong> By setting NDK in Svelte context (Step 4, section 3), components
						automatically access your NDK instance without needing to pass it as a prop. You can also
						pass <code>ndk</code> explicitly if needed: <code>&lt;EventCard {'{ndk}'} {'{event}'} /&gt;</code>
					</p>
				</div>
			</section>

			<section>
				<h2>Step 9: Configure Event Rendering</h2>

				<p>
					To properly render Nostr events with rich content (markdown, embeds, etc.), you'll need to configure
					content renderers. Visit the interactive configuration builder to customize how your events are displayed:
				</p>

				<div class="my-4">
					<a
						href="/events/basics"
						class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
					>
						Configure Event Renderers →
					</a>
				</div>

				<p>The configuration builder will help you set up:</p>
				<ul>
					<li>Markdown rendering for formatted text</li>
					<li>Media embeds (images, videos, audio)</li>
					<li>Link previews</li>
					<li>Code highlighting</li>
					<li>Custom content transformers</li>
				</ul>
			</section>
		</Tabs.Content>
	</Tabs.Root>

	<section>
		<h2>Updating Components</h2>

	<p>Keep your components up to date with the latest versions:</p>

	<CodeBlock
		lang="bash"
		code={jsrepoUpdate}
	/>

	</section>

	<section>
		<h2>Configuration Options</h2>

	<h3>jsrepo.config.ts Reference</h3>

	<p>Your <code>jsrepo.config.ts</code> file controls how components are installed:</p>

	<CodeBlock
		lang="typescript"
		code={jsrepoConfigReference}
	/>

	</section>

	<section>
		<h2>Advanced NDK Configuration (Optional)</h2>

	<p>
		If you need more control over NDK's behavior, you can extend the basic configuration from Step 4
		with additional features:
	</p>

	<h3>Production-Ready Setup</h3>

	<p>This enhanced configuration includes:</p>
	<ul>
		<li><strong>Session management:</strong> Automatic follow/mute list fetching</li>
		<li><strong>Event monitoring:</strong> Track specific event kinds like interest lists</li>
		<li><strong>Outbox model (NIP-65):</strong> User-defined relay routing</li>
		<li><strong>Debug logging:</strong> Enabled in development mode</li>
		<li><strong>Connection events:</strong> Monitor relay connectivity</li>
	</ul>

	<CodeBlock
		lang="typescript"
		code={ndkAdvancedConfig}
	/>

	</section>

	<section>
		<h2>Troubleshooting</h2>

	<h3>Components Not Found</h3>

	<p>If imports fail after adding components, check:</p>
	<ol>
		<li>Verify the component was added: <code>ls src/lib/components/</code></li>
		<li>Check your path configuration in <code>jsrepo.config.ts</code></li>
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

<p>Now that you have @nostr-dev-kit/svelte installed, explore:</p>

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
