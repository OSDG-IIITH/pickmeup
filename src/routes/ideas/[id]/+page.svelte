<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { initials, avatargrad, timeago } from '$lib/utils';
	import { ArrowLeft, Heart, MessageSquare, Share2, Pin } from '@lucide/svelte';
	import Comment from '$lib/components/comment.svelte';

	let { data } = $props();

	let idea = $derived(data.idea);
	let user = $derived(data.user);

	let voted = $state(untrack(() => data.idea.voted ?? false));
	let votecount = $state(untrack(() => data.idea.votes));

	let comments = $state(untrack(() => data.comments));
	let commentbody = $state('');
	let posting = $state(false);

	async function vote() {
		if (!user) { goto('/api/auth/login'); return; }
		const res = await fetch(`/api/ideas/${idea.id}/vote`, { method: 'POST' });
		if (res.ok) {
			const v = await res.json();
			voted = v.voted;
			votecount = v.count;
		}
	}

	async function postcomment() {
		if (!commentbody.trim() || posting) return;
		posting = true;
		const res = await fetch(`/api/ideas/${idea.id}/comments`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ body: commentbody.trim() })
		});
		if (res.ok) {
			const { id } = await res.json();
			comments = [
				...comments,
				{
					id,
					authorid: user!.id,
					authorhandle: user!.handle,
					parent: null,
					body: commentbody.trim(),
					createdat: new Date(),
					votes: 0,
					voted: false,
					replies: []
				}
			];
			commentbody = '';
		}
		posting = false;
	}

	function onreply(parentid: string, reply: { id: string; body: string }) {
		comments = comments.map((c) => {
			if (c.id !== parentid) return c;
			return {
				...c,
				replies: [
					...c.replies,
					{
						id: reply.id,
						authorid: user!.id,
						authorhandle: user!.handle,
						parent: parentid,
						body: reply.body,
						createdat: new Date(),
						votes: 0,
						voted: false
					}
				]
			};
		});
	}

	const totalcomments = $derived(comments.reduce((acc, c) => acc + 1 + c.replies.length, 0));
</script>

<div class="w-full max-w-[1180px] mx-auto px-4 sm:px-8 flex-1">
	<div class="max-w-[760px] mx-auto pt-8 pb-0">

		<!-- Back link -->
		<a href="/" class="inline-flex items-center gap-1.5 text-[13px] text-[var(--p-text-secondary)] mb-6 transition-colors duration-[120ms] hover:text-[var(--p-accent-soft)]">
			<ArrowLeft size={14} />
			<span>Back to ideas</span>
		</a>

		<!-- Tags -->
		{#if idea.tags.length > 0 || idea.pinned}
			<div class="flex flex-wrap gap-1.5 mb-3.5">
				{#each idea.tags as tag (tag)}
					<span class="text-[11.5px] font-medium text-[var(--p-text-secondary)] bg-white/[0.025] border border-[var(--p-border)] px-[9px] py-[3px] rounded-[var(--p-radius-pill)]">
						#{tag}
					</span>
				{/each}
				{#if idea.pinned}
					<span class="text-[11.5px] font-medium text-[var(--p-accent)] bg-[var(--p-accent-bg)] border border-[var(--p-border-hover)] px-[9px] py-[3px] rounded-[var(--p-radius-pill)] inline-flex items-center gap-1">
						<Pin size={10} />
						Pinned
					</span>
				{/if}
			</div>
		{/if}

		<!-- Title -->
		<h1 class="text-[36px] font-semibold tracking-[-0.03em] leading-[1.15] m-0 mb-[18px] text-[var(--p-text)] text-balance">
			{idea.title}
		</h1>

		<!-- Author meta -->
		<div class="flex items-center gap-3 pb-6 mb-6 border-b border-[var(--p-border)]">
			<span
				class="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#14090d] font-semibold text-[13px] tracking-[-0.01em] border border-white/[0.08] shrink-0"
				style="background: {avatargrad(idea.authorhandle)}"
			>
				{initials(idea.authorhandle)}
			</span>
			<div>
				<div class="text-[14px] font-medium text-[var(--p-text)]">
					{idea.authorname || idea.authorhandle}
				</div>
				<div class="text-[12.5px] text-[var(--p-text-muted)]">
					@{idea.authorhandle}
					<span class="mx-1">·</span>
					posted {timeago(idea.createdat)}
				</div>
			</div>
		</div>

		<!-- Body -->
		<p class="text-[16px] leading-[1.7] text-[var(--p-text)] m-0 mb-8 text-pretty whitespace-pre-wrap">
			{idea.body}
		</p>

		<!-- Actions -->
		<div class="flex items-center gap-2.5 py-[18px] border-t border-b border-[var(--p-border)] mb-8">
			<button
				onclick={vote}
				class="inline-flex items-center gap-1.5 h-[38px] px-3.5 pl-3 rounded-[var(--p-radius-pill)] border text-[13.5px] font-semibold tabular-nums transition-all duration-[140ms]"
				class:upvote-active={voted}
				class:upvote-inactive={!voted}
			>
				<Heart
					size={14}
					fill={voted ? 'currentColor' : 'none'}
					class="transition-transform duration-200 {voted ? '-translate-y-px' : ''}"
				/>
				<span>{votecount}</span>
			</button>

			<button class="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-[var(--p-radius-pill)] border border-[var(--p-border)] text-[var(--p-text-secondary)] text-[13.5px] font-medium transition-all duration-[120ms] hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)]">
				<MessageSquare size={14} />
				<span>{totalcomments} comments</span>
			</button>

			<button
				onclick={() => navigator.clipboard?.writeText(window.location.href)}
				class="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-[var(--p-radius-pill)] border border-[var(--p-border)] text-[var(--p-text-secondary)] text-[13.5px] font-medium transition-all duration-[120ms] hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)]"
			>
				<Share2 size={14} />
				<span>Share</span>
			</button>
		</div>

		<!-- Comments section -->
		<h2 class="text-[17px] font-semibold tracking-[-0.015em] mb-[18px] text-[var(--p-text)]">
			Discussion · {totalcomments}
		</h2>

		<!-- Composer -->
		{#if user}
			<div class="flex gap-3 p-4 bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[14px] mb-7 transition-[border-color] duration-[160ms] focus-within:border-[var(--p-border-hover)]">
				<span
					class="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#14090d] font-semibold text-[13px] shrink-0 border border-white/[0.08]"
					style="background: {avatargrad(user.handle)}"
				>
					{initials(user.handle)}
				</span>
				<div class="flex-1">
					<textarea
						bind:value={commentbody}
						placeholder="Share what you'd build, what blockers you'd hit, who you'd bring on…"
						rows={3}
						class="w-full bg-transparent border-none outline-none text-[14px] text-[var(--p-text)] placeholder:text-[var(--p-text-muted)] resize-none leading-[1.5] pt-1"
					></textarea>
					<div class="flex justify-between items-center mt-2">
						<span class="text-[12px] text-[var(--p-text-muted)]">Markdown supported</span>
						<button
							onclick={postcomment}
							disabled={!commentbody.trim() || posting}
							class="inline-flex items-center h-8 px-3.5 rounded-[var(--p-radius-pill)] bg-[var(--p-accent)] text-[#14090d] font-semibold text-[13px] transition-all duration-[120ms] hover:bg-[var(--p-accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
						>
							Comment
						</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="p-4 bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[14px] mb-7 text-center">
				<span class="text-[14px] text-[var(--p-text-secondary)]">
					<a href="/api/auth/login" class="text-[var(--p-accent-soft)] hover:underline">Sign in</a> to join the discussion
				</span>
			</div>
		{/if}

		<!-- Comment threads -->
		{#if comments.length > 0}
			<div class="divide-y divide-[var(--p-border)]">
				{#each comments as comment (comment.id)}
					<Comment
						{comment}
						ideaid={idea.id}
						{user}
						onreply={(reply) => onreply(comment.id, reply)}
					/>
				{/each}
			</div>
		{:else}
			<div class="py-10 text-center text-[14px] text-[var(--p-text-muted)]">
				Be the first to react.
			</div>
		{/if}

		<div class="h-16"></div>
	</div>
</div>

<style>
	.upvote-active {
		color: var(--p-accent);
		border-color: transparent;
		background: var(--p-accent-bg-strong);
		box-shadow: inset 0 0 0 1px var(--p-border-hover), 0 0 16px -4px var(--p-accent-glow);
	}
	.upvote-inactive {
		color: var(--p-text-secondary);
		border-color: var(--p-border);
		background: transparent;
	}
	.upvote-inactive:hover {
		color: var(--p-text);
		border-color: var(--p-border-strong);
	}
</style>
