<script lang="ts">
	import { untrack } from 'svelte';
	import { initials, avatargrad, timeago } from '$lib/utils';
	import { Heart, CornerDownRight } from '@lucide/svelte';
	import Comment from './comment.svelte';

	interface CommentData {
		id: string;
		authorid: string;
		authorhandle: string;
		parent: string | null;
		body: string;
		createdat: string | Date;
		votes: number;
		voted: boolean | null;
		replies?: CommentData[];
	}

	interface Props {
		comment: CommentData;
		ideaid: string;
		user: { id: string; handle: string } | null;
		onreply?: (reply: { id: string; body: string }) => void;
		depth?: number;
	}

	let { comment, ideaid, user, onreply, depth = 0 }: Props = $props();

	let voted = $state(untrack(() => comment.voted ?? false));
	let votecount = $state(untrack(() => comment.votes));
	let showreply = $state(false);
	let replybody = $state('');
	let posting = $state(false);

	async function vote() {
		if (!user) return;
		const res = await fetch(`/api/comments/${comment.id}/vote`, { method: 'POST' });
		if (res.ok) {
			const v = await res.json();
			voted = v.voted;
			votecount = v.count;
		}
	}

	async function submitreply() {
		if (!replybody.trim() || posting || !user) return;
		posting = true;
		const res = await fetch(`/api/ideas/${ideaid}/comments`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ body: replybody.trim(), parent: comment.id })
		});
		if (res.ok) {
			const { id } = await res.json();
			onreply?.({ id, body: replybody.trim() });
			replybody = '';
			showreply = false;
		}
		posting = false;
	}
</script>

<div class="flex gap-3 py-4">
	<span
		class="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#14090d] font-semibold text-[13px] tracking-[-0.01em] border border-white/[0.08] shrink-0 mt-0.5"
		style="background: {avatargrad(comment.authorhandle)}"
	>
		{initials(comment.authorhandle)}
	</span>

	<div class="flex-1 min-w-0">
		<!-- Author + time -->
		<div class="flex items-center gap-2 mb-1.5">
			<span class="text-[13px] font-medium text-[var(--p-text)]">@{comment.authorhandle}</span>
			<span class="text-[12.5px] text-[var(--p-text-muted)]">{timeago(comment.createdat)}</span>
		</div>

		<!-- Body -->
		<p class="text-[14.5px] leading-[1.55] text-[var(--p-text)] m-0 mb-2 text-pretty whitespace-pre-wrap">
			{comment.body}
		</p>

		<!-- Actions -->
		<div class="flex items-center gap-3.5 text-[12.5px] text-[var(--p-text-muted)]">
			<button
				onclick={vote}
				class="inline-flex items-center gap-1 transition-colors duration-[120ms] hover:text-[var(--p-text)]"
				class:action-voted={voted}
			>
				<Heart size={12} fill={voted ? 'currentColor' : 'none'} />
				<span>{votecount}</span>
			</button>

			{#if user && depth === 0}
				<button
					onclick={() => (showreply = !showreply)}
					class="inline-flex items-center gap-1 transition-colors duration-[120ms] hover:text-[var(--p-text)]"
				>
					<CornerDownRight size={12} />
					<span>Reply</span>
				</button>
			{/if}
		</div>

		<!-- Reply composer -->
		{#if showreply && user}
			<div class="mt-3 flex gap-3 p-3 bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[12px] transition-[border-color] duration-[160ms] focus-within:border-[var(--p-border-hover)]">
				<span
					class="w-6 h-6 rounded-full inline-flex items-center justify-center text-[#14090d] font-semibold text-[10px] border border-white/[0.08] shrink-0 mt-0.5"
					style="background: {avatargrad(user.handle)}"
				>
					{initials(user.handle)}
				</span>
				<div class="flex-1">
					<textarea
						bind:value={replybody}
						placeholder="Replying to @{comment.authorhandle}…"
						rows={2}
						class="w-full bg-transparent border-none outline-none text-[14px] text-[var(--p-text)] placeholder:text-[var(--p-text-muted)] resize-none leading-[1.5] pt-0.5"
					></textarea>
					<div class="flex justify-end items-center gap-2 mt-1.5">
						<button
							onclick={() => { showreply = false; replybody = ''; }}
							class="inline-flex items-center h-[30px] px-3 rounded-[var(--p-radius-pill)] text-[var(--p-text-secondary)] text-[12.5px] font-medium border border-[var(--p-border)] transition-all duration-[120ms] hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)] hover:bg-[var(--p-bg-hover)]"
						>
							Cancel
						</button>
						<button
							onclick={submitreply}
							disabled={!replybody.trim() || posting}
							class="inline-flex items-center h-[30px] px-3.5 rounded-[var(--p-radius-pill)] bg-[var(--p-accent)] text-[#14090d] font-semibold text-[12.5px] transition-all duration-[120ms] hover:bg-[var(--p-accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
						>
							Reply
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Nested replies -->
		{#if comment.replies && comment.replies.length > 0}
			<div class="ml-4 pl-4 border-l border-[var(--p-border)] mt-1">
				{#each comment.replies as reply (reply.id)}
					<Comment comment={reply} {ideaid} {user} depth={1} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.action-voted {
		color: var(--p-accent);
	}
</style>
