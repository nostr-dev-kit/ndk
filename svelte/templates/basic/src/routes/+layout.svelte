<script lang="ts">
    import '../app.css';
    import Header from '$lib/components/Header.svelte';
    import { onMount } from 'svelte';

    let { children } = $props();

    onMount(() => {
        // Dark mode support
        if (typeof window !== 'undefined') {
            const theme = localStorage.getItem('theme') || 'light';
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    });
</script>

<div class="min-h-screen bg-background">
    <Header />
    <main class="container mx-auto px-4 py-8">
        {@render children()}
    </main>
</div>
