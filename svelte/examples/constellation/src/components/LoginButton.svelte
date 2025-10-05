<script lang="ts">
  import LoginModal from './LoginModal.svelte';

  let showModal = $state(false);
</script>

<button class="login-btn" onclick={() => (showModal = true)} type="button">
  <span class="key-icon">🔑</span>
  <span>Login</span>
</button>

{#if showModal}
  <LoginModal onClose={() => (showModal = false)} />
{/if}

<style>
  .login-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    border: none;
    border-radius: 9999px;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(168, 85, 247, 0.4);
  }

  .key-icon {
    font-size: 1.125rem;
    line-height: 1;
  }
</style>
