<script lang="ts">
	const layers = [
		{
			title: "Chrome",
			description: "The card container with metadata, including header with user info, content area, and action buttons.",
			color: "blue"
		},
		{
			title: "Content",
			description: "Event body parsing and text rendering, including plain text, markdown, mentions, and hashtags.",
			color: "purple"
		},
		{
			title: "Embeds",
			description: "Rich preview rendering for references like mention cards, hashtag previews, and embedded event previews.",
			color: "orange"
		}
	];
</script>

<div class="">
	<div class="grid lg:grid-cols-2 grid-cols-1 gap-8 items-start">
		<!-- Unified Wireframe showing all three layers nested -->
		<div class="w-full">
			<!-- Blue dashed outer border (Chrome layer) -->
			<div class="relative w-full p-5 border-2 border-dashed border-blue-500 rounded-xl bg-background flex flex-col gap-4">
				<!-- Header Section (Blue highlighted) -->
				<div class="flex gap-3 items-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
					<div class="w-10 h-10 rounded-full bg-muted shrink-0"></div>
					<div class="flex flex-col gap-1.5 flex-1">
						<div class="h-2 bg-muted rounded w-2/5"></div>
						<div class="h-2 bg-muted rounded w-1/4"></div>
					</div>
				</div>

				<!-- Content Area (Purple border + purple text) -->
				<div class="p-3 rounded-lg bg-purple-500/5 border-2 border-purple-500 flex flex-col gap-3">
					<!-- Purple skeleton text with inline mentions -->
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-1.5">
							<div class="h-2 bg-purple-500/30 rounded flex-1"></div>
							<span class="text-orange-500 font-semibold px-2 py-1 rounded bg-orange-500/10 border border-dashed border-orange-500 text-xs whitespace-nowrap">@alice</span>
							<div class="h-2 bg-purple-500/30 rounded w-1/4"></div>
						</div>
						<div class="flex items-center gap-1.5">
							<div class="h-2 bg-purple-500/30 rounded w-1/3"></div>
							<span class="text-orange-500 font-semibold px-2 py-1 rounded bg-orange-500/10 border border-dashed border-orange-500 text-xs whitespace-nowrap">#nostr</span>
							<div class="h-2 bg-purple-500/30 rounded flex-1"></div>
						</div>
						<div class="h-2 bg-purple-500/30 rounded w-3/5"></div>
					</div>

					<!-- Orange embedded card -->
					<div class="p-3 bg-orange-500/10 rounded-lg border-2 border-dashed border-orange-500 flex flex-col gap-2">
						<div class="flex gap-2 items-center">
							<div class="w-6 h-6 rounded-full bg-muted shrink-0"></div>
							<div class="flex-1">
								<div class="h-2 bg-muted rounded w-1/3"></div>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="h-2 bg-muted rounded w-2/5"></div>
							<div class="h-2 bg-muted rounded w-3/5"></div>
						</div>
					</div>
				</div>

				<!-- Footer Actions (Blue highlighted) -->
				<div class="flex gap-3 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
				</div>
			</div>
		</div>

		<!-- Info cards for all three layers -->
		<div class="flex flex-col gap-6 w-full">
			<div class="p-6 border-2 border-blue-500 rounded-xl bg-blue-500/[0.02]">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-semibold">1</div>
					<h3 class="font-semibold text-lg my-0!">{layers[0].title}</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					{layers[0].description}
				</p>
			</div>

			<div class="p-6 border-2 border-purple-500 rounded-xl bg-purple-500/[0.02]">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-6 h-6 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs font-semibold">2</div>
					<h3 class="font-semibold text-lg !my-0">{layers[1].title}</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					{layers[1].description}
				</p>
			</div>

			<div class="p-6 border-2 border-orange-500 rounded-xl bg-orange-500/[0.02]">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-semibold">3</div>
					<h3 class="font-semibold text-lg !my-0">{layers[2].title}</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					{layers[2].description}
				</p>
			</div>
		</div>
	</div>
</div>
