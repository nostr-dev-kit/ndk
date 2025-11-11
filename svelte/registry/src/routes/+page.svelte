<script lang="ts">
    import { UserCardNeon } from '$lib/registry/components/user-card-neon';
  import { ndk } from '$lib/site/ndk.svelte';
    import { EditProps } from '$site/components/edit-props';
    import type { NDKUser } from '@nostr-dev-kit/ndk';

    let users = $state<NDKUser[]>([]);
    let user1 = $state<NDKUser | undefined>();
    let user2 = $state<NDKUser | undefined>();
    let user3 = $state<NDKUser | undefined>();
    let user4 = $state<NDKUser | undefined>();
    let user5 = $state<NDKUser | undefined>();
    let user6 = $state<NDKUser | undefined>();
    let user7 = $state<NDKUser | undefined>();
    let user8 = $state<NDKUser | undefined>();
    let user9 = $state<NDKUser | undefined>();

    const displayUsers = $derived([user1, user2, user3, user4, user5, user6, user7, user8, user9].filter(Boolean) as NDKUser[]);
</script>

<EditProps.Root>
  <EditProps.Prop name="User 1" type="user" bind:value={user1} options={users} default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
    <EditProps.Prop name="User 2" type="user" bind:value={user2} options={users} default="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" />
    <EditProps.Prop name="User 3" type="user" bind:value={user3} options={users} default="npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m" />
    <EditProps.Prop name="User 4" type="user" bind:value={user4} options={users} default="npub1gcxzte5zlkncx26j68ez60fzkvtkm9e0vrwdcvsjakxf9mu9qewqlfnj5z" />
    <EditProps.Prop name="User 5" type="user" bind:value={user5} options={users} default="npub1a2cww4kn9wqte4ry70vyfwqyqvpswksna27rtxd8vty6c74era8sdcw83a" />
    <EditProps.Prop name="User 6" type="user" bind:value={user6} options={users} default="npub1hu3hdctm5nkzd8gslnyedfr5ddz3z547jqcl5j88g4fame2jd08qep89nw" />
    <EditProps.Prop name="User 7" type="user" bind:value={user7} options={users} default="npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s" />
    <EditProps.Prop name="User 8" type="user" bind:value={user8} options={users} default="npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx" />
    <EditProps.Prop name="User 9" type="user" bind:value={user9} options={users} default="npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac" />
</EditProps.Root>

<section class="border-b border-border min-h-screen w-full flex items-center justify-center bg-linear-to-b from-background to-muted-foreground/5 -mt-16">
    <div class="flex flex-col items-center gap-6 py-16 text-center md:py-24 lg:py-32 lg:gap-8">
      <h1 class="max-w-3xl text-7xl font-black leading-tight tracking-tight text-foreground m-0 xl:tracking-tighter" style="text-wrap: balance;">
        Nostr apps, with <span class="aurora-text">taste</span>.
      </h1>

      <p class="max-w-[48rem] text-base leading-relaxed text-muted-foreground m-0 sm:text-lg" style="text-wrap: balance;">
        A collection of production-ready Nostr components. Gorgeous by default.
      </p>

      <div class="flex w-full items-center justify-center gap-3 pt-2 flex-wrap">
        <a href="/docs" class="bg-secondary hover:bg-foreground hover:text-background inline-flex flex-shrink-0 items-center justify-center whitespace-nowrap no-underline text-sm font-medium outline-none transition-all duration-150 ease-in-out rounded-md h-10 gap-1.5 px-6 cursor-pointer bg-primary text-primary-foreground shadow-sm">
          Get Started
        </a>
        <a href="/blocks" class="inline-flex flex-shrink-0 items-center justify-center whitespace-nowrap no-underline text-sm font-medium outline-none transition-all duration-150 ease-in-out rounded-md h-10 gap-1.5 px-6 cursor-pointer bg-transparent border border-border text-foreground hover:bg-accent">
          Browse Blocks
        </a>
      </div>
    </div>
</section>

<section class="h-screen w-full flex items-center justify-center">

</section>

<style>
  .text-success {
    color: var(--success);
  }
  
  .aurora-text {
		background: linear-gradient(
			90deg,
			#8b5cf6,
			#ec4899,
			#06b6d4,
			#8b5cf6
		);
		background-size: 200% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: aurora-shift 3s ease-in-out infinite;
		position: relative;
		display: inline-block;
	}

	.aurora-text::before {
		content: attr(data-text);
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			#8b5cf6,
			#ec4899,
			#06b6d4,
			#8b5cf6
		);
		background-size: 200% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		filter: blur(10px);
		opacity: 0.5;
		animation: aurora-shift 20s ease-in-out infinite;
		z-index: -1;
	}

	/* Animations */
	@keyframes float-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes aurora-shift {
		0%, 100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}
</style>
