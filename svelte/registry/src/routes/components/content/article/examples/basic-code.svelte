<script lang="ts">
  import { ArticleContent } from '$lib/registry/components/article-content';

  let { ndk, article } = $props();
</script>

<ArticleContent {ndk} {article} />
