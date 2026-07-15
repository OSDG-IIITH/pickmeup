<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { timeago, initials, avatargrad } from '$lib/utils';
	import { theme } from '$lib/theme.svelte';
	import IconPinFilled from '@tabler/icons-svelte/icons/pin-filled';
	import Heart from '@tabler/icons-svelte/icons/heart';
	import HeartFilled from '@tabler/icons-svelte/icons/heart-filled';
	import { MessageSquare } from '@lucide/svelte';
	import { stripmd } from '$lib/markdown';

	interface Idea {
		id: string;
		title: string;
		body: string;
		pinned: boolean;
		authorhandle: string;
		authorname: string;
		createdat: string | Date;
		comments: number;
		ideatags: string[];
	}

	interface Props {
		idea: Idea;
		voted: boolean;
		count: number;
		onvote: () => void;
	}

	let { idea, voted, count, onvote }: Props = $props();
</script>

<div
	role="link"
	tabindex="0"
	onclick={() => goto(`${base}/ideas/${idea.id}`)}
	onkeydown={(e) => e.key === 'Enter' && goto(`${base}/ideas/${idea.id}`)}
	class="relative bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[14px] flex flex-col gap-3.5 cursor-pointer overflow-hidden transition-[border-color] duration-[200ms] ease-out hover:border-[var(--p-border-strong)]"
	style="padding: 22px 22px 18px"
>
	{#if idea.pinned}
		<IconPinFilled size={14} class="absolute top-4 right-4 text-[var(--p-accent)]" />
	{/if}

	<h3
		class="text-[18px] font-semibold tracking-[-0.015em] leading-[1.3] m-0 text-[var(--p-text)]"
		class:pr-8={idea.pinned}
	>
		{idea.title}
	</h3>

	<p class="text-[var(--p-text-secondary)] text-[14px] leading-[1.55] m-0 line-clamp-3">
		{stripmd(idea.body)}
	</p>

	{#if idea.ideatags?.length > 0}
		<div class="flex flex-wrap gap-1.5">
			{#each idea.ideatags as tag}
				<span class="text-[11.5px] font-medium text-[var(--p-text-secondary)] bg-white/[0.025] border border-[var(--p-border)] px-[9px] py-[3px] rounded-[var(--p-radius-pill)] transition-all duration-[120ms] hover:text-[var(--p-accent-soft)] hover:border-[var(--p-border-hover)]">
					#{tag}
				</span>
			{/each}
		</div>
	{/if}

	<div class="flex items-center justify-between pt-3.5 border-t border-[var(--p-border)] mt-auto">
		<button
			onclick={(e) => { e.stopPropagation(); goto(`${base}/profile/${idea.authorhandle}`); }}
			class="inline-flex items-center gap-2 text-[12.5px] hover:opacity-80 transition-opacity"
		>
			<span
				class="w-6 h-6 rounded-full inline-flex items-center justify-center text-[var(--p-avatar-text)] font-semibold text-[10px] border border-white/[0.08] shrink-0"
				style="background: {avatargrad(idea.authorhandle, theme.current)}"
			>
				{initials(idea.authorname || idea.authorhandle)}
			</span>
			<span class="text-[var(--p-text)] font-medium">{idea.authorname || idea.authorhandle}</span>
			<span class="text-[var(--p-text-muted)]">·</span>
			<span class="text-[var(--p-text-muted)]">{timeago(idea.createdat)}</span>
		</button>

		<div class="inline-flex items-center gap-1">
			<span class="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[var(--p-radius-pill)] text-[var(--p-text-secondary)] text-[12.5px] font-medium tabular-nums hover:text-[var(--p-text)]">
				<MessageSquare size={13} />
				<span>{idea.comments}</span>
			</span>

			<button
				onclick={(e) => { e.stopPropagation(); onvote(); }}
				class="inline-flex items-center gap-1.5 h-[30px] px-[10px] pl-2 rounded-[var(--p-radius-pill)] border border-[var(--p-border)] text-[12.5px] font-semibold tabular-nums transition-all duration-[140ms] hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)]"
				class:voted
			>
				{#if voted}
					<HeartFilled size={12} class="transition-transform duration-200 -translate-y-px" />
				{:else}
					<Heart size={12} class="transition-transform duration-200" />
				{/if}
				<span>{count}</span>
			</button>
		</div>
	</div>
</div>
