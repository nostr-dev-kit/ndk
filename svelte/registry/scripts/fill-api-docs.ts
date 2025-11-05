// Script to fill in empty apiDocs arrays
// Run with: tsx scripts/fill-api-docs.ts

const followPackComponentDocs = [
  {
    name: 'FollowPackHero',
    description: 'Full-width hero component for showcasing follow packs with dramatic imagery and overlay text. Displays title, description, member avatars, and pack author.',
    importPath: "import FollowPackHero from '$lib/registry/components/follow-pack-hero/follow-pack-hero.svelte'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance. Optional if NDK is available in Svelte context.'
      },
      {
        name: 'followPack',
        type: 'NDKFollowPack',
        required: true,
        description: 'The follow pack event (kind 39089) to display'
      },
      {
        name: 'onclick',
        type: '(e: MouseEvent) => void',
        description: 'Click handler for the hero card'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'FollowPackPortrait',
    description: 'Vertical card component for displaying follow packs in grid layouts. Shows image, title, description, member avatars, and author attribution.',
    importPath: "import FollowPackPortrait from '$lib/registry/components/follow-pack-portrait/follow-pack-portrait.svelte'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance. Optional if NDK is available in Svelte context.'
      },
      {
        name: 'followPack',
        type: 'NDKFollowPack',
        required: true,
        description: 'The follow pack event (kind 39089) to display'
      },
      {
        name: 'onclick',
        type: '(e: MouseEvent) => void',
        description: 'Click handler for the card'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'FollowPackCompact',
    description: 'Horizontal compact card for follow packs in feed layouts. Displays thumbnail image, title, description, member avatars, and member count in a space-efficient format.',
    importPath: "import FollowPackCompact from '$lib/registry/components/follow-pack-compact/follow-pack-compact.svelte'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance. Optional if NDK is available in Svelte context.'
      },
      {
        name: 'followPack',
        type: 'NDKFollowPack',
        required: true,
        description: 'The follow pack event (kind 39089) to display'
      },
      {
        name: 'onclick',
        type: '(e: MouseEvent) => void',
        description: 'Click handler for the card'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'FollowPackListItem',
    description: 'Minimal list item component for sidebars and compact navigation. Shows circular thumbnail, title, member count, and navigation chevron.',
    importPath: "import FollowPackListItem from '$lib/registry/components/follow-pack/follow-pack-list-item.svelte'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance. Optional if NDK is available in Svelte context.'
      },
      {
        name: 'followPack',
        type: 'NDKFollowPack',
        required: true,
        description: 'The follow pack event (kind 39089) to display'
      },
      {
        name: 'onclick',
        type: '(e: MouseEvent) => void',
        description: 'Click handler for the list item'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  }
];

console.log('Follow pack component docs:');
console.log(JSON.stringify(followPackComponentDocs, null, 2));
