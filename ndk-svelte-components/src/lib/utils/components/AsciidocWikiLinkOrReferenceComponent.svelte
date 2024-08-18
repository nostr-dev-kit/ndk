<script lang="ts">
  import { onMount } from 'svelte';
  import { getExtra } from 'svelte-asciidoc';
  import { decode, npubEncode } from "nostr-tools/nip19";
  import type NDK from "@nostr-dev-kit/ndk";
  import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

  export let attrs: { [_: string]: string };

  const { href } = attrs;
  const { dispatch, ndk }: { dispatch: ((ev: string, opts: any) => void), ndk: NDK } = getExtra()

  let slotted: HTMLAnchorElement
  let useSlotted = true

  let wikitarget: string | undefined;
  let npub: string | undefined;
  let profile: NDKUserProfile | undefined;
  let name: string | undefined;
  $: shortNpub = npub && (npub.substring(0, 7) + '…' + npub.substring(58))

  if (href.startsWith('wikilink:')) {
    wikitarget = href.substring(9);
  } else if (href.startsWith('nostr:npub1')) {
    npub = href.substring(6)
  } else if (href.startsWith('nostr:nprofile1')) {
    let {data} = decode(href.substring(6))
    npub = npubEncode(data)
  }

  // fetch metadata from referenced nostruser so we can display nicer links
  onMount(() => {
    if (npub) {
      let slottedContent = slotted.textContent!
      useSlotted = false

      if (slottedContent === href) {
        let user = ndk.getUser({npub})
        profile = user.profile
        user.fetchProfile().then(p => {
          profile = p || undefined
          name = p?.name || p?.displayName || shortNpub
        })
      } else {
        name = slottedContent
      }
    }
  })

  function handleProfileClick(e: MouseEvent) {
    e.preventDefault()
    dispatch('click', {
      type: 'profile',
      npub,
      ...profile,
    })
  }

  function handleWikilinkClick(e: MouseEvent) {
    e.preventDefault()
    dispatch('click', {
      type: 'wikilink',
      target: wikitarget,
    })
  }
</script>

{#if wikitarget}
  <a
    title={`wikilink to: "${wikitarget}"`}
    href={`/${wikitarget}`} on:click={handleWikilinkClick}><slot /></a
  >
{:else if npub}
  {#if useSlotted}
    <a href={`/${npub}`} on:click={handleProfileClick} bind:this={slotted}><slot /></a>
  {:else}
    <a href={`/${npub}`} on:click={handleProfileClick}>{name}</a>
  {/if}
{:else}
  <!-- svelte-ignore a11y-missing-attribute -->
  <a target="_blank" {...attrs}>
    <slot />
    <svg
      class="align-text-top h-3.5 inline pl-1"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      >
          <path
            d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"
            stroke="#888888"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
      </svg
    >
  </a>
{/if}
