<script lang="ts">
</script>

<div class="docs-page">
  <header class="docs-header">
    <h1>Practical Guides</h1>
    <p class="subtitle">
      Step-by-step tutorials for building common Nostr features
    </p>
  </header>

  <section>
    <div class="coming-soon">
      <h2>📚 Coming Soon</h2>
      <p>
        Comprehensive guides for building feeds, threaded conversations, user profiles, and more
        will be added here.
      </p>
      <p>
        For now, check out the component examples in the sidebar to see working implementations.
      </p>
    </div>
  </section>

  <section class="explore-section">
    <h2>Explore Components</h2>
    <div class="component-links">
      <a href="/components/event-card" class="component-link">
        <h3>Event Card</h3>
        <p>See how to display events with engagement metrics</p>
      </a>
      <a href="/components/article-card" class="component-link">
        <h3>Article Card</h3>
        <p>Display long-form articles with rich previews</p>
      </a>
      <a href="/components/user-profile" class="component-link">
        <h3>User Profile</h3>
        <p>Show user profiles with avatars and bios</p>
      </a>
      <a href="/components/follow-button" class="component-link">
        <h3>Follow Button</h3>
        <p>Interactive follow/unfollow functionality</p>
      </a>
    </div>
  </section>
</div>

<style>
  .docs-page {
    max-width: 900px;
  }

  .docs-header {
    margin-bottom: 3rem;
  }

  .docs-header h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
    letter-spacing: -0.025em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--color-muted-foreground);
    margin: 0;
    line-height: 1.6;
  }

  section {
    margin-bottom: 4rem;
  }

  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: var(--color-foreground);
    letter-spacing: -0.025em;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: var(--color-foreground);
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
    margin: 0 0 1rem 0;
  }

  .coming-soon {
    padding: 3rem;
    text-align: center;
    background: var(--color-card);
    border: 2px dashed var(--color-border);
    border-radius: 0.5rem;
  }

  .coming-soon h2 {
    margin-top: 0;
  }

  .component-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .component-link {
    padding: 1.5rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
    display: block;
  }

  .component-link:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .component-link h3 {
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }

  .component-link p {
    margin: 0;
    font-size: 0.9375rem;
  }
</style>
