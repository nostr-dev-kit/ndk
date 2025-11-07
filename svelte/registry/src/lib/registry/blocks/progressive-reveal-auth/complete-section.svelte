<script lang="ts">
  interface Props {
    onFinish?: () => void;
  }

  let { onFinish }: Props = $props();

  function handleFinish() {
    onFinish?.();
  }
</script>

<div class="complete-section">
  <div class="success-content">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="success-icon">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <p class="success-message">Your account is ready and your feed is personalized!</p>
  </div>

  <button class="btn btn-primary" onclick={handleFinish}>
    Start Exploring
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  </button>
</div>

<style>
  .complete-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .success-content {
    text-align: center;
    padding: 1rem 0;
  }

  .success-icon {
    color: var(--primary);
    margin: 0 auto 1rem;
  }

  .success-message {
    color: var(--muted-foreground);
    margin: 0;
  }

  .btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-primary {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
</style>
