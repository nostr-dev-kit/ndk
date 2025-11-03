<script lang="ts">
  import { afterNavigate } from '$app/navigation';

  interface TocItem {
    id: string;
    text: string;
    level: number;
  }

  let items = $state<TocItem[]>([]);
  let activeId = $state<string | null>(null);
  let observer: IntersectionObserver | null = null;

  function extractHeadings() {
    // Clean up previous observer
    if (observer) {
      observer.disconnect();
    }

    // Extract headings from the page
    const headings = Array.from(document.querySelectorAll('.component-content h2, .component-content h3'));

    const usedIds = new Set<string>();
    items = headings.map((heading) => {
      // Create an ID if one doesn't exist
      if (!heading.id) {
        let baseId = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || '';

        // Ensure uniqueness by appending a counter if needed
        let uniqueId = baseId;
        let counter = 1;
        while (usedIds.has(uniqueId)) {
          uniqueId = `${baseId}-${counter}`;
          counter++;
        }

        heading.id = uniqueId;
      }

      usedIds.add(heading.id);

      return {
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      };
    });

    // Set up intersection observer to track active section
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0.5
      }
    );

    headings.forEach((heading) => observer?.observe(heading));
  }

  // Extract headings after each navigation
  afterNavigate(() => {
    // Use setTimeout to ensure DOM is fully updated
    setTimeout(() => {
      extractHeadings();
    }, 0);
  });

  function scrollToHeading(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
</script>

{#if items.length > 0}
  <nav class="toc" aria-label="Table of contents">
    <h2 class="toc-title">On This Page</h2>
    <ul class="toc-list">
      {#each items as item (item.id)}
        <li class="toc-item" data-level={item.level}>
          <button
            class="toc-link"
            class:active={activeId === item.id}
            onclick={() => scrollToHeading(item.id)}
            type="button"
          >
            {item.text}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc {
    width: 100%;
  }

  .toc-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--foreground);
    margin: 0 0 1rem 0;
  }

  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .toc-item {
    margin: 0;
  }

  .toc-item[data-level="3"] {
    padding-left: 1rem;
  }

  .toc-link {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.375rem 0;
    font-size: 0.875rem;
    color: var(--muted-foreground);
    border: none;
    background: transparent;
    cursor: pointer;
    transition: color 0.2s ease;
    border-left: 2px solid transparent;
    padding-left: 0.75rem;
  }

  .toc-link:hover {
    color: var(--foreground);
  }

  .toc-link.active {
    color: var(--primary);
    border-left-color: var(--primary);
  }

  /* Scrollbar styling */
  .toc::-webkit-scrollbar {
    width: 4px;
  }

  .toc::-webkit-scrollbar-track {
    background: transparent;
  }

  .toc::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
  }

  .toc::-webkit-scrollbar-thumb:hover {
    background: var(--muted-foreground);
  }
</style>
