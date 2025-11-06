<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { getContext } from 'svelte';
  import { cn } from '$lib/registry/utils/cn.js';
  import AuthSection from './auth-section.svelte';
  import InterestsSection from './interests-section.svelte';
  import CommunitiesSection from './communities-section.svelte';
  import CompleteSection from './complete-section.svelte';

  interface Props {
    ndk?: NDKSvelte;
    onComplete?: () => void;
    class?: string;
  }

  let { ndk: ndkProp, onComplete, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  let currentSection = $state(1);
  let selectedInterests = $state<string[]>([]);
  let selectedCommunities = $state<string[]>([]);
  let createdSigner = $state<NDKPrivateKeySigner | null>(null);

  function handleAuthComplete(signer?: NDKPrivateKeySigner) {
    if (signer) {
      createdSigner = signer;
    }
    completeSection(1, 2);
  }

  function handleInterestsComplete(interests: string[]) {
    selectedInterests = interests;
    completeSection(2, 3);
  }

  function handleCommunitiesComplete(communities: string[]) {
    selectedCommunities = communities;
    completeSection(3, 4);
  }

  function handleFinish() {
    onComplete?.();
  }

  function completeSection(current: number, next: number) {
    const currentEl = document.querySelector(`.accordion-section[data-section="${current}"]`);
    currentEl?.classList.remove('active');
    currentEl?.classList.add('completed');

    setTimeout(() => {
      const nextEl = document.querySelector(`.accordion-section[data-section="${next}"]`);
      nextEl?.classList.add('active');
      currentSection = next;
    }, 300);
  }

  function toggleSection(section: number) {
    const sectionEl = document.querySelector(`.accordion-section[data-section="${section}"]`);
    const allSections = document.querySelectorAll('.accordion-section');

    allSections.forEach(s => {
      if (s !== sectionEl) {
        s.classList.remove('active');
      }
    });

    sectionEl?.classList.toggle('active');
    currentSection = section;
  }
</script>

<div class={cn('progressive-reveal-auth', className)}>
  <div class="accordion-container">
    <!-- Section 1: Auth -->
    <div class="accordion-section active" data-section="1">
      <button
        class="accordion-header"
        onclick={() => toggleSection(1)}
        type="button"
      >
        <div class="header-content">
          <div class="step-number">1</div>
          <div class="header-text">
            <h3>Get Started</h3>
            <p>Sign in or create your account</p>
          </div>
        </div>
        <div class="accordion-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>
      <div class="accordion-body">
        <AuthSection {ndk} onComplete={handleAuthComplete} />
      </div>
    </div>

    <!-- Section 2: Interests -->
    <div class="accordion-section" data-section="2">
      <button
        class="accordion-header"
        onclick={() => toggleSection(2)}
        type="button"
      >
        <div class="header-content">
          <div class="step-number">2</div>
          <div class="header-text">
            <h3>Pick Your Interests</h3>
            <p>What topics are you passionate about?</p>
          </div>
        </div>
        <div class="accordion-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>
      <div class="accordion-body">
        <InterestsSection {ndk} onComplete={handleInterestsComplete} />
      </div>
    </div>

    <!-- Section 3: Communities -->
    <div class="accordion-section" data-section="3">
      <button
        class="accordion-header"
        onclick={() => toggleSection(3)}
        type="button"
      >
        <div class="header-content">
          <div class="step-number">3</div>
          <div class="header-text">
            <h3>Join Communities</h3>
            <p>Follow curated groups of people</p>
          </div>
        </div>
        <div class="accordion-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>
      <div class="accordion-body">
        <CommunitiesSection {ndk} onComplete={handleCommunitiesComplete} />
      </div>
    </div>

    <!-- Section 4: Complete -->
    <div class="accordion-section" data-section="4">
      <button
        class="accordion-header"
        onclick={() => toggleSection(4)}
        type="button"
      >
        <div class="header-content">
          <div class="step-number">✓</div>
          <div class="header-text">
            <h3>All Done!</h3>
            <p>Start exploring your personalized feed</p>
          </div>
        </div>
        <div class="accordion-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>
      <div class="accordion-body">
        <CompleteSection onFinish={handleFinish} />
      </div>
    </div>
  </div>
</div>

<style>
  .progressive-reveal-auth {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .accordion-container {
    background: var(--card);
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
  }

  .accordion-section {
    border-bottom: 1px solid var(--border);
    transition: all 0.3s ease;
  }

  .accordion-section:last-child {
    border-bottom: none;
  }

  .accordion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--card);
    width: 100%;
    border: none;
    text-align: left;
  }

  .accordion-header:hover {
    background: var(--muted);
  }

  .accordion-section.active .accordion-header {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .accordion-section.completed .accordion-header {
    background: var(--muted);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--muted);
    color: var(--foreground);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }

  .accordion-section.active .step-number {
    background: white;
    color: var(--primary);
    transform: scale(1.1);
  }

  .accordion-section.completed .step-number {
    background: var(--primary);
    color: white;
  }

  .header-text h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .header-text p {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .accordion-section.completed .header-text p {
    color: var(--muted-foreground);
  }

  .accordion-icon {
    transition: transform 0.3s ease;
    width: 20px;
    height: 20px;
    color: currentColor;
  }

  .accordion-section.active .accordion-icon {
    transform: rotate(180deg);
  }

  .accordion-section.completed .accordion-icon svg {
    stroke: var(--primary);
  }

  .accordion-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease, padding 0.4s ease;
  }

  .accordion-section.active .accordion-body {
    max-height: 1000px;
    padding: 0 2rem 2rem 2rem;
  }
</style>
