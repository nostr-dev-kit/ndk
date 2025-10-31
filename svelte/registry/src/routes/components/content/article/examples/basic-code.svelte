<script lang="ts">
  import { ArticleContent } from '$lib/components/ndk/article-content';

  let { ndk, article } = $props();
</script>

<ArticleContent {ndk} {article} />
