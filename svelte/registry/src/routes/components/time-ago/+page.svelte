<script lang="ts">
	import Demo from '$site-components/Demo.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import BasicExampleRaw from './examples/basic.svelte?raw';
  import UpdateExample from './examples/updating.svelte';
  import UpdateExampleRaw from './examples/updating.svelte?raw';
</script>

<div class="component-page">
  <header>
    <h1>TimeAgo</h1>
    <p>Display relative timestamps that automatically update every minute.</p>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <Demo
      title="Basic"
      description="Simple relative time display showing elapsed time in a human-readable format (e.g., '5m', '2h', '3d'). For times older than 7 days, displays the date."
      component="time-ago"
      code={BasicExampleRaw}
    >
      <BasicExample />
    </Demo>

    <Demo
      title="Auto-updating"
      description="The component automatically updates every minute to keep the display current. Open your browser console to see update logs."
      component="time-ago"
      code={UpdateExampleRaw}
    >
      <UpdateExample />
    </Demo>
  </section>

  <section class="usage">
    <h2>Usage</h2>

    <h3>Basic Usage</h3>
    <pre><code>{`<script>
  import TimeAgo from '$lib/registry/components/time-ago/time-ago.svelte';
</script>

<TimeAgo timestamp={event.created_at} />`}</code></pre>

    <h3>Props</h3>
    <table>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>timestamp</code></td>
          <td><code>number | undefined</code></td>
          <td>-</td>
          <td>Unix timestamp in seconds (required)</td>
        </tr>
        <tr>
          <td><code>element</code></td>
          <td><code>'span' | 'time'</code></td>
          <td><code>'span'</code></td>
          <td>HTML element to render as</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td><code>''</code></td>
          <td>Additional CSS classes</td>
        </tr>
      </tbody>
    </table>

    <h3>Time Format</h3>
    <p>The component displays time in the following format:</p>
    <ul>
      <li><strong>&lt; 1 minute:</strong> "now"</li>
      <li><strong>&lt; 1 hour:</strong> "5m", "30m"</li>
      <li><strong>&lt; 24 hours:</strong> "2h", "12h"</li>
      <li><strong>&lt; 7 days:</strong> "1d", "6d"</li>
      <li><strong>&gt; 7 days:</strong> Localized date (e.g., "1/15/2024")</li>
    </ul>

    <h3>Auto-update Behavior</h3>
    <p>The component automatically updates every 60 seconds to keep the relative time current. The update interval is fixed and cannot be configured.</p>

    <h3>Semantic HTML</h3>
    <p>Use <code>element="time"</code> to render as a semantic <code>&lt;time&gt;</code> element with proper <code>datetime</code> attribute:</p>
    <pre><code>{`<TimeAgo timestamp={event.created_at} element="time" />`}</code></pre>
  </section>
</div>
