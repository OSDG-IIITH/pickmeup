<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import IdeaCard from '$lib/components/ideacard.svelte';
	import { Pin, Sparkles } from '@lucide/svelte';

	let { data } = $props();

	let votemap = $state<Record<string, { voted: boolean; count: number }>>({});

	function getvote(idea: (typeof data.ideas)[0]) {
		return votemap[idea.id] ?? { voted: idea.voted ?? false, count: idea.votes };
	}

	async function vote(id: string) {
		const res = await fetch(`/api/ideas/${id}/vote`, { method: 'POST' });
		if (res.ok) {
			const v = await res.json();
			votemap[id] = v;
		}
	}

	const sorts = [
		{ id: 'votes', label: 'All' },
		{ id: 'recent', label: 'New' }
	];

	function setsort(s: string) {
		const u = new URL($page.url);
		u.searchParams.set('sort', s);
		u.searchParams.delete('tag');
		goto(u.toString());
	}

	function settag(t: string) {
		const u = new URL($page.url);
		if (data.activetag === t) {
			u.searchParams.delete('tag');
		} else {
			u.searchParams.set('tag', t);
		}
		goto(u.toString());
	}

	const isfiltering = $derived(!!data.activetag || data.sort !== 'votes');
	const pinned = $derived(data.ideas.filter((i) => i.pinned));
	const rest = $derived(isfiltering ? data.ideas : data.ideas.filter((i) => !i.pinned));
</script>

<div class="w-full max-w-[1180px] mx-auto px-4 sm:px-8 flex-1">
	<!-- Page heading -->
	<div class="pt-10 pb-6">
		<h1 class="text-[34px] font-semibold tracking-[-0.025em] m-0 mb-1.5 text-[var(--p-text)]">
			Ideas worth building
		</h1>
		<p class="text-[var(--p-text-secondary)] text-[15px] m-0">
			Have an idea but can't build it? Post it here.
		</p>
	</div>

	<!-- Filter chips -->
	<div class="flex items-center gap-2 py-2 pb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
		{#each sorts as s}
			<button
				onclick={() => setsort(s.id)}
				class="inline-flex items-center h-8 px-3.5 rounded-[var(--p-radius-pill)] border text-[13px] font-medium whitespace-nowrap transition-all duration-[120ms]"
				class:chip-active={data.sort === s.id && !data.activetag}
				class:chip-inactive={!(data.sort === s.id && !data.activetag)}
			>
				{s.label}
			</button>
		{/each}

		<div class="w-px h-5 bg-[var(--p-border)] mx-1.5 shrink-0"></div>

		{#each data.availabletags as tag}
			<button
				onclick={() => settag(tag)}
				class="inline-flex items-center h-8 px-3.5 rounded-[var(--p-radius-pill)] border text-[13px] font-medium whitespace-nowrap transition-all duration-[120ms]"
				class:chip-active={data.activetag === tag}
				class:chip-inactive={data.activetag !== tag}
			>
				#{tag}
			</button>
		{/each}
	</div>

	<!-- Pinned section -->
	{#if !isfiltering && pinned.length > 0}
		<div class="flex items-baseline justify-between pt-7 pb-4">
			<span class="text-[13px] font-semibold tracking-[0.08em] uppercase text-[var(--p-text-secondary)] inline-flex items-center gap-2">
				<Pin size={12} class="text-[var(--p-accent)]" />
				Pinned by OSDG
			</span>
			<span class="text-[13px] text-[var(--p-text-secondary)]">{pinned.length} ideas</span>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{#each pinned as idea}
				<IdeaCard
					{idea}
					voted={getvote(idea).voted}
					count={getvote(idea).count}
					onvote={() => vote(idea.id)}
				/>
			{/each}
		</div>
	{/if}

	<!-- All ideas section -->
	<div class="flex items-baseline justify-between pt-7 pb-4">
		<span class="text-[13px] font-semibold tracking-[0.08em] uppercase text-[var(--p-text-secondary)] inline-flex items-center gap-2">
			<Sparkles size={11} />
			{data.activetag ? `Tagged #${data.activetag}` : 'Fresh from the bank'}
		</span>
		<span class="text-[13px] text-[var(--p-text-secondary)]">
			Sort: {data.sort === 'recent' ? 'New' : 'Top'}
		</span>
	</div>

	{#if rest.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{#each rest as idea}
				<IdeaCard
					{idea}
					voted={getvote(idea).voted}
					count={getvote(idea).count}
					onvote={() => vote(idea.id)}
				/>
			{/each}
		</div>
	{:else}
		<div class="py-16 text-center text-[var(--p-text-muted)]">
			{data.activetag ? `Nothing here yet for #${data.activetag}.` : 'No ideas yet. Be the first!'}
		</div>
	{/if}
</div>

<style>
	.chip-active {
		background: var(--p-accent-bg-strong);
		color: var(--p-accent-soft);
		border-color: transparent;
		box-shadow: inset 0 0 0 1px var(--p-border-hover);
	}
	.chip-inactive {
		background: transparent;
		color: var(--p-text-secondary);
		border-color: var(--p-border);
	}
	.chip-inactive:hover {
		color: var(--p-text);
		border-color: var(--p-border-strong);
	}
</style>
