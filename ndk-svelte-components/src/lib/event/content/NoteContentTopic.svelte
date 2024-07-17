<script lang="ts">
    import type { UrlFactory } from "$lib";

    export let value: string = '';
    export let urlFactory: UrlFactory;
</script>

<a href={urlFactory("hashtag", value)} class="hashtag" on:click>#{value}</a>
