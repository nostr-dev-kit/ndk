<script lang="ts">
  import { ArticleContent } from '$lib/ndk/article-content';

  let { ndk, article } = $props();
</script>

<ArticleContent {ndk} {article} />
