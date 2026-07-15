<script lang="ts">
	import { untrack } from 'svelte';
	import { base } from '$app/paths';
	import { initials, avatargrad, timeago } from '$lib/utils';
	import { theme } from '$lib/theme.svelte';
	import { ArrowLeft, Share2, Trash2, Pencil } from '@lucide/svelte';
	import Heart from '@tabler/icons-svelte/icons/heart';
	import HeartFilled from '@tabler/icons-svelte/icons/heart-filled';
	import IconPinFilled from '@tabler/icons-svelte/icons/pin-filled';
	import IconPinnedOff from '@tabler/icons-svelte/icons/pinned-off';
	import { MessageSquare } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import Comment from '$lib/components/comment.svelte';
	import { rendermd } from '$lib/markdown';

	let { data } = $props();

	let idea = $derived(data.idea);
	let user = $derived(data.user);

	let voted = $state(untrack(() => data.idea.voted ?? false));
	let votecount = $state(untrack(() => data.idea.votes));
	let pinned = $state(untrack(() => data.idea.pinned));

	let comments = $state(untrack(() => data.comments));
	let commentbody = $state('');
	let posting = $state(false);

	let ideatitle = $state(untrack(() => data.idea.title));
	let ideabody = $state(untrack(() => data.idea.body));
	let ideaupdatedat = $state(untrack(() => data.idea.updatedat));

	let editmode = $state(false);
	let edittitle = $state('');
	let editbody = $state('');
	let saving = $state(false);

	async function saveedit() {
		if (!edittitle.trim() || !editbody.trim() || saving) return;
		saving = true;
		const res = await fetch(`${base}/api/ideas/${idea.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ title: edittitle.trim(), body: editbody.trim() })
		});
		if (res.ok) {
			ideatitle = edittitle.trim();
			ideabody = editbody.trim();
			ideaupdatedat = new Date();
			editmode = false;
		}
		saving = false;
	}

	async function vote() {
		if (!user) { goto(`${base}/api/auth/login`); return; }
		const res = await fetch(`${base}/api/ideas/${idea.id}/vote`, { method: 'POST' });
		if (res.ok) {
			const v = await res.json();
			voted = v.voted;
			votecount = v.count;
		}
	}

	async function postcomment() {
		if (!commentbody.trim() || posting) return;
		posting = true;
		const res = await fetch(`${base}/api/ideas/${idea.id}/comments`, {
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
					authorname: user!.name,
					parent: null,
					body: commentbody.trim(),
					createdat: new Date(),
					updatedat: null,
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
						authorname: user!.name,
						parent: parentid,
						body: reply.body,
						createdat: new Date(),
						updatedat: null,
						votes: 0,
						voted: false
					}
				]
			};
		});
	}

	const totalcomments = $derived(comments.reduce((acc, c) => acc + 1 + c.replies.length, 0));

	async function togglepin() {
		const res = await fetch(`${base}/api/ideas/${idea.id}/pin`, { method: 'PATCH' });
		if (res.ok) {
			const v = await res.json();
			pinned = v.pinned;
		}
	}

	async function deleteidea() {
		const res = await fetch(`${base}/api/ideas/${idea.id}`, { method: 'DELETE' });
		if (res.ok) goto(`${base}/`);
	}

	function deletecomment(id: string) {
		comments = comments.filter((c) => c.id !== id);
	}
</script>

<div class="w-full max-w-[1180px] mx-auto px-4 sm:px-8 flex-1">
	<div class="max-w-[760px] mx-auto pt-8 pb-0">

		<!-- Back link -->
		<a href={`${base}/`} class="inline-flex items-center gap-1.5 text-[13px] text-[var(--p-text-secondary)] mb-6 transition-colors duration-[120ms] hover:text-[var(--p-accent-soft)]">
			<ArrowLeft size={14} />
			<span>Back to ideas</span>
		</a>

		<!-- Tags -->
		{#if idea.tags.length > 0 || pinned}
			<div class="flex flex-wrap gap-1.5 mb-3.5">
				{#each idea.tags as tag (tag)}
					<span class="text-[11.5px] font-medium text-[var(--p-text-secondary)] bg-white/[0.025] border border-[var(--p-border)] px-[9px] py-[3px] rounded-[var(--p-radius-pill)]">
						#{tag}
					</span>
				{/each}
				{#if pinned}
					<span class="text-[11.5px] font-medium text-[var(--p-accent)] bg-[var(--p-accent-bg)] border border-[var(--p-border-hover)] px-[9px] py-[3px] rounded-[var(--p-radius-pill)] inline-flex items-center gap-1">
						<IconPinFilled size={10} />
						Pinned
					</span>
				{/if}
			</div>
		{/if}

		<!-- Title -->
		{#if editmode}
			<input
				type="text"
				bind:value={edittitle}
				class="w-full bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[10px] px-4 py-2 text-[28px] font-semibold text-[var(--p-text)] mb-[18px] focus:border-[var(--p-border-hover)] outline-none"
				placeholder="Title"
			/>
		{:else}
			<h1 class="text-[36px] font-semibold tracking-[-0.03em] leading-[1.15] m-0 mb-[18px] text-[var(--p-text)] text-balance">
				{ideatitle}
			</h1>
		{/if}

		<!-- Author meta -->
		<div class="flex items-center gap-3 pb-6 mb-6 border-b border-[var(--p-border)]">
			<a href={`${base}/profile/${idea.authorhandle}`} class="w-8 h-8 rounded-full inline-flex items-center justify-center text-[var(--p-avatar-text)] font-semibold text-[13px] tracking-[-0.01em] border border-white/[0.08] shrink-0 hover:opacity-80 transition-opacity" style="background: {avatargrad(idea.authorhandle, theme.current)}">
				{initials(idea.authorname || idea.authorhandle)}
			</a>
			<div>
				<div class="text-[14px] font-medium text-[var(--p-text)]">
					<a href={`${base}/profile/${idea.authorhandle}`} class="hover:underline decoration-[var(--p-border-strong)] underline-offset-2">
						{idea.authorname || idea.authorhandle}
					</a>
				</div>
				<div class="text-[12.5px] text-[var(--p-text-muted)] flex items-center gap-1">
					<span>@{idea.authorhandle}</span>
					<span class="mx-0.5">·</span>
					<span>posted {timeago(idea.createdat)}</span>
					{#if ideaupdatedat}
						<span class="mx-0.5">·</span>
						<span class="text-[11.5px] italic text-[var(--p-text-muted)]">edited {timeago(ideaupdatedat)}</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Body -->
		{#if editmode}
			<textarea
				bind:value={editbody}
				rows={10}
				class="w-full bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[10px] px-4 py-3 text-[16px] text-[var(--p-text)] resize-none leading-[1.5] focus:border-[var(--p-border-hover)] outline-none mb-4"
				placeholder="Write your post..."
			></textarea>
			<div class="flex justify-end gap-2 mb-8">
				<button
					onclick={() => { editmode = false; }}
					class="inline-flex items-center h-9 px-4 rounded-[var(--p-radius-pill)] text-[var(--p-text-secondary)] text-[13px] font-semibold border border-[var(--p-border)] hover:bg-[var(--p-bg-hover)]"
				>
					Cancel
				</button>
				<button
					onclick={saveedit}
					disabled={!edittitle.trim() || !editbody.trim() || saving}
					class="inline-flex items-center h-9 px-4 rounded-[var(--p-radius-pill)] bg-[var(--p-accent)] text-[#14090d] font-semibold text-[13px] hover:bg-[var(--p-accent-soft)] disabled:opacity-40"
				>
					Save
				</button>
			</div>
		{:else}
			<div class="prose text-[16px] mb-8">
				{@html rendermd(ideabody)}
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex items-center gap-2.5 py-[18px] border-t border-b border-[var(--p-border)] mb-8">
			<button
				onclick={vote}
				class="inline-flex items-center gap-1.5 h-[38px] px-3.5 pl-3 rounded-[var(--p-radius-pill)] border text-[13.5px] font-semibold tabular-nums transition-all duration-[140ms] {voted ? 'text-[var(--p-accent)] border-transparent bg-[var(--p-accent-bg-strong)] shadow-[inset_0_0_0_1px_var(--p-border-hover)]' : 'text-[var(--p-text-secondary)] border-[var(--p-border)] bg-transparent hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)]'}"
			>
				{#if voted}
					<HeartFilled size={14} class="transition-transform duration-200 -translate-y-px" />
				{:else}
					<Heart size={14} class="transition-transform duration-200" />
				{/if}
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

			{#if user?.role === 'moderator' || user?.id === idea.authorid}
				<div class="flex items-center gap-2 ml-auto">
					{#if user?.role === 'moderator'}
					<button
						onclick={togglepin}
						class="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-[var(--p-radius-pill)] border text-[13.5px] font-medium transition-all duration-[120ms] {pinned ? 'text-[var(--p-accent)] border-[var(--p-border-hover)] bg-[var(--p-accent-bg)]' : 'text-[var(--p-text-muted)] border-[var(--p-border)] bg-transparent hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)]'}"
					>
						{#if pinned}
							<IconPinnedOff size={14} />
							<span>Unpin</span>
						{:else}
							<IconPinFilled size={14} />
							<span>Pin</span>
						{/if}
					</button>
					{/if}
					{#if user?.id === idea.authorid}
					<button
						onclick={() => { editmode = true; edittitle = ideatitle; editbody = ideabody; }}
						class="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-[var(--p-radius-pill)] border border-[var(--p-border)] text-[var(--p-text-muted)] text-[13.5px] font-medium transition-all duration-[120ms] hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)]"
					>
						<Pencil size={14} />
						<span>Edit</span>
					</button>
					{/if}
					<button
						onclick={deleteidea}
						class="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-[var(--p-radius-pill)] border border-[var(--p-border)] text-[var(--p-text-muted)] text-[13.5px] font-medium transition-all duration-[120ms] hover:text-red-400 hover:border-red-400/30"
					>
						<Trash2 size={14} />
						<span>Delete</span>
					</button>
				</div>
			{/if}
		</div>

		<!-- Comments section -->
		<h2 class="text-[17px] font-semibold tracking-[-0.015em] mb-[18px] text-[var(--p-text)]">
			Discussion · {totalcomments}
		</h2>

		<!-- Composer -->
		{#if user}
			<div class="flex gap-3 p-4 bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[14px] mb-7 transition-[border-color] duration-[160ms] focus-within:border-[var(--p-border-hover)]">
				<span
					class="w-8 h-8 rounded-full inline-flex items-center justify-center text-[var(--p-avatar-text)] font-semibold text-[13px] shrink-0 border border-white/[0.08]"
					style="background: {avatargrad(user.handle, theme.current)}"
				>
					{initials(user.name || user.handle)}
				</span>
				<div class="flex-1">
					<textarea
						bind:value={commentbody}
						placeholder="Add a comment…"
						rows={3}
						onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postcomment(); } }}
						class="w-full bg-transparent border-none outline-none text-[14px] text-[var(--p-text)] placeholder:text-[var(--p-text-muted)] resize-none leading-[1.5] pt-1"
					></textarea>
					<div class="flex justify-end items-center mt-2">
						<button
							onclick={postcomment}
							disabled={!commentbody.trim() || posting}
							class="inline-flex items-center h-8 px-3.5 rounded-[var(--p-radius-pill)] bg-[var(--p-accent)] text-[#14090d] font-semibold text-[13px] transition-colors duration-[120ms] hover:bg-[var(--p-accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
						>
							Comment
						</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="p-4 bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[14px] mb-7 text-center">
				<span class="text-[14px] text-[var(--p-text-secondary)]">
					<a href={`${base}/api/auth/login`} class="text-[var(--p-accent-soft)] hover:underline">Sign in</a> to join the discussion
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
						ondelete={() => deletecomment(comment.id)}
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

