<script lang="ts">
	import { initials, avatargrad } from '$lib/utils';
	import IdeaCard from '$lib/components/ideacard.svelte';

	let { data } = $props();

	let profile = $derived(data.profile);
	let posted = $derived(data.posted);
	let liked = $derived(data.liked);
	let totallikes = $derived(data.totallikes);
	let totalcomments = $derived(data.totalcomments);
	let isme = $derived(data.isme);

	let tab = $state<'posted' | 'liked'>('posted');
	let votemap = $state<Record<string, { voted: boolean; count: number }>>({});

	function getvote(idea: (typeof posted)[0]) {
		return votemap[idea.id] ?? { voted: idea.voted ?? false, count: idea.votes };
	}

	async function vote(id: string) {
		const res = await fetch(`/api/ideas/${id}/vote`, { method: 'POST' });
		if (res.ok) {
			const v = await res.json();
			votemap[id] = v;
		}
	}

	const shown = $derived(tab === 'liked' ? liked : posted);

	const tabs = $derived([
		{ id: 'posted' as const, label: `Ideas · ${posted.length}` },
		...(isme ? [{ id: 'liked' as const, label: `Liked · ${liked.length}` }] : [])
	]);

	const emptymsg = $derived(
		tab === 'liked'
			? 'Nothing liked yet — go find something worth backing.'
			: 'No ideas posted yet.'
	);
</script>

<div class="w-full max-w-[1180px] mx-auto px-4 sm:px-8 flex-1">

	<!-- Profile header -->
	<div class="flex items-center gap-6 pt-10 pb-7 border-b border-[var(--p-border)]">
		<span
			class="w-[72px] h-[72px] rounded-full inline-flex items-center justify-center text-[#14090d] font-semibold text-[26px] shrink-0 border border-white/[0.08]"
			style="background: {avatargrad(profile.handle)}"
		>
			{initials(profile.handle)}
		</span>

		<div class="flex-1 min-w-0">
			<h1 class="text-[28px] font-semibold tracking-[-0.025em] m-0 text-[var(--p-text)]">
				{profile.name}
			</h1>
			<div class="text-[15px] text-[var(--p-text-secondary)] mt-0.5">@{profile.handle}</div>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			{#if isme}
				<button class="inline-flex items-center h-9 px-3.5 rounded-[var(--p-radius-pill)] border border-[var(--p-border)] text-[var(--p-text-secondary)] text-[13.5px] font-medium transition-all duration-[120ms] hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)] hover:bg-[var(--p-bg-hover)]">
					Edit profile
				</button>
			{:else}
				<button class="inline-flex items-center h-9 px-3.5 rounded-[var(--p-radius-pill)] bg-[var(--p-accent)] text-[#14090d] font-semibold text-[13.5px] tracking-[-0.005em] transition-all duration-[120ms] hover:bg-[var(--p-accent-soft)] hover:shadow-[0_0_24px_-2px_var(--p-accent-glow)]">
					Follow
				</button>
			{/if}
		</div>
	</div>

	<!-- Stats -->
	<div class="flex gap-7 py-6 border-b border-[var(--p-border)]">
		<div>
			<div class="text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--p-text)]">{posted.length}</div>
			<div class="text-[12.5px] text-[var(--p-text-secondary)] mt-0.5">Ideas posted</div>
		</div>
		<div>
			<div class="text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--p-text)]">{totallikes.toLocaleString()}</div>
			<div class="text-[12.5px] text-[var(--p-text-secondary)] mt-0.5">Likes received</div>
		</div>
		<div>
			<div class="text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--p-text)]">{totalcomments}</div>
			<div class="text-[12.5px] text-[var(--p-text-secondary)] mt-0.5">Discussions started</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="flex gap-1 py-4 pb-6">
		{#each tabs as t (t.id)}
			<button
				onclick={() => (tab = t.id)}
				class="text-[13.5px] font-medium px-3.5 py-2 rounded-[var(--p-radius-pill)] whitespace-nowrap transition-all duration-[120ms]"
				class:tab-active={tab === t.id}
				class:tab-inactive={tab !== t.id}
			>
				{t.label}
			</button>
		{/each}
	</div>

	<!-- Ideas grid -->
	{#if shown.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-16">
			{#each shown as idea (idea.id)}
				<IdeaCard
					{idea}
					voted={getvote(idea).voted}
					count={getvote(idea).count}
					onvote={() => vote(idea.id)}
				/>
			{/each}
		</div>
	{:else}
		<div class="py-16 text-center text-[14px] text-[var(--p-text-muted)]">
			{emptymsg}
		</div>
	{/if}
</div>

<style>
	.tab-active {
		color: var(--p-accent-soft);
		background: var(--p-accent-bg-strong);
	}
	.tab-inactive {
		color: var(--p-text-secondary);
	}
	.tab-inactive:hover {
		color: var(--p-text);
		background: var(--p-bg-hover);
	}
</style>
