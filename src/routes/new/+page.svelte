<script lang="ts">
	import { goto } from '$app/navigation';
	import { z } from 'zod';
	import { ArrowLeft, X } from '@lucide/svelte';

	let { data } = $props();

	const schema = z.object({
		title: z.string().min(6, 'Title must be at least 6 characters').max(120),
		body: z.string().min(20, 'Idea must be at least 20 characters').max(1200)
	});

	let title = $state('');
	let body = $state('');
	let tags = $state<string[]>([]);
	let taginput = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let apierror = $state('');

	const titlelimit = 120;
	const bodylimit = 1200;

	const fielderrors = $derived.by(() => {
		if (!submitted) return { title: '', body: '' };
		const result = schema.safeParse({ title: title.trim(), body: body.trim() });
		if (result.success) return { title: '', body: '' };
		return {
			title: result.error.issues.find((i) => i.path[0] === 'title')?.message ?? '',
			body: result.error.issues.find((i) => i.path[0] === 'body')?.message ?? ''
		};
	});

	function addtag(raw: string) {
		const t = raw.trim().replace(/^#/, '').toLowerCase();
		if (t && !tags.includes(t) && tags.length < 4) tags = [...tags, t];
		taginput = '';
	}

	function removetag(t: string) {
		tags = tags.filter((x) => x !== t);
	}

	function ontagkey(e: KeyboardEvent) {
		if ((e.key === 'Enter' || e.key === ',') && taginput.trim()) {
			e.preventDefault();
			addtag(taginput);
		} else if (e.key === 'Backspace' && !taginput && tags.length) {
			tags = tags.slice(0, -1);
		}
	}

	async function submit() {
		if (submitting) return;
		submitted = true;
		apierror = '';

		const result = schema.safeParse({ title: title.trim(), body: body.trim() });
		if (!result.success) return;

		submitting = true;
		const res = await fetch('/api/ideas', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ title: title.trim(), body: body.trim(), tags })
		});
		if (res.ok) {
			const { id } = await res.json();
			goto(`/ideas/${id}`);
		} else {
			apierror = 'Something went wrong. Please try again.';
			submitting = false;
		}
	}
</script>

<div class="w-full max-w-[1180px] mx-auto px-8 flex-1">
	<div class="max-w-[680px] mx-auto py-8">

		<a href="/" class="inline-flex items-center gap-1.5 text-[13px] text-[var(--p-text-secondary)] mb-6 transition-colors duration-[120ms] hover:text-[var(--p-accent-soft)]">
			<ArrowLeft size={14} />
			<span>Cancel</span>
		</a>

		<h1 class="text-[34px] font-semibold tracking-[-0.025em] m-0 mb-1.5 pt-3 text-[var(--p-text)]">
			Post an idea
		</h1>
		<p class="text-[15px] text-[var(--p-text-secondary)] m-0 mb-8">
			Tell us what you'd build. Be specific enough that someone could pick it up.
		</p>

		<!-- Title field -->
		<div class="mb-[22px]">
			<label for="title" class="block text-[13px] font-semibold text-[var(--p-text)] mb-2">Title</label>
			<input
				id="title"
				bind:value={title}
				maxlength={titlelimit}
				placeholder="A one-line pitch — what is it?"
				class="w-full bg-[var(--p-bg-card)] border rounded-[14px] px-[18px] py-4 text-[22px] font-semibold tracking-[-0.015em] text-[var(--p-text)] placeholder:text-[var(--p-text-muted)] outline-none transition-[border-color,background] duration-[160ms] focus:bg-[var(--p-bg-elevated)]"
				class:border-[var(--p-border-hover)]={fielderrors.title}
				class:border-[var(--p-border)]={!fielderrors.title}
				class:focus:border-[var(--p-border-hover)]={!fielderrors.title}
			/>
			<div class="flex justify-between mt-1.5">
				{#if fielderrors.title}
					<span class="text-[12.5px] text-[var(--p-accent)]">{fielderrors.title}</span>
				{:else}
					<span class="text-[12.5px] text-[var(--p-text-muted)]">A good title reads like a tweet, not a paper.</span>
				{/if}
				<span class="text-[12.5px] text-[var(--p-text-muted)] tabular-nums shrink-0 ml-4">{title.length}/{titlelimit}</span>
			</div>
		</div>

		<!-- Body field -->
		<div class="mb-[22px]">
			<label for="body" class="block text-[13px] font-semibold text-[var(--p-text)] mb-2">The idea</label>
			<textarea
				id="body"
				bind:value={body}
				maxlength={bodylimit}
				placeholder="What's the problem? What's the build? Who's it for?&#10;&#10;Markdown supported."
				rows={8}
				class="w-full bg-[var(--p-bg-card)] border rounded-[14px] px-4 py-3.5 text-[15px] text-[var(--p-text)] placeholder:text-[var(--p-text-muted)] outline-none resize-y leading-[1.6] transition-[border-color,background] duration-[160ms] focus:bg-[var(--p-bg-elevated)]"
				class:border-[var(--p-border-hover)]={fielderrors.body}
				class:border-[var(--p-border)]={!fielderrors.body}
				class:focus:border-[var(--p-border-hover)]={!fielderrors.body}
			></textarea>
			<div class="flex justify-between mt-1.5">
				{#if fielderrors.body}
					<span class="text-[12.5px] text-[var(--p-accent)]">{fielderrors.body}</span>
				{:else}
					<span class="text-[12.5px] text-[var(--p-text-muted)]">Aim for 80–200 words. Bullet points encouraged.</span>
				{/if}
				<span class="text-[12.5px] text-[var(--p-text-muted)] tabular-nums shrink-0 ml-4">{body.length}/{bodylimit}</span>
			</div>
		</div>

		<!-- Tags field -->
		<div class="mb-[22px]">
			<label for="taginput" class="block text-[13px] font-semibold text-[var(--p-text)] mb-2">
				Tags <span class="text-[var(--p-text-muted)] font-normal">· up to 4</span>
			</label>
			<div class="flex flex-wrap gap-1.5 items-center bg-[var(--p-bg-card)] border border-[var(--p-border)] rounded-[14px] px-3 py-2.5 transition-[border-color] duration-[160ms] focus-within:border-[var(--p-border-hover)]">
				{#each tags as tag (tag)}
					<span class="inline-flex items-center gap-1 text-[12.5px] bg-[var(--p-accent-bg)] text-[var(--p-accent-soft)] px-2.5 py-1 pr-1.5 rounded-[var(--p-radius-pill)]">
						#{tag}
						<button
							onclick={() => removetag(tag)}
							class="inline-flex p-0.5 rounded-full opacity-70 hover:opacity-100 transition-opacity"
						>
							<X size={11} />
						</button>
					</span>
				{/each}
				<input
					id="taginput"
					bind:value={taginput}
					onkeydown={ontagkey}
					onblur={() => taginput.trim() && addtag(taginput)}
					disabled={tags.length >= 4}
					placeholder={tags.length === 0 ? 'Type a tag and press Enter…' : tags.length < 4 ? 'Add another…' : ''}
					class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[14px] text-[var(--p-text)] placeholder:text-[var(--p-text-muted)] py-1 px-1.5 disabled:cursor-not-allowed"
				/>
			</div>
			<span class="block text-[12.5px] text-[var(--p-text-muted)] mt-1.5">
				Suggested: mess, infra, social, academic, utility, hackathon, iot
			</span>
		</div>

		{#if apierror}
			<p class="text-[13.5px] text-[var(--p-accent)] mb-4">{apierror}</p>
		{/if}

		<!-- Form actions -->
		<div class="flex justify-between items-center pt-2">
			{#if data.user}
				<span class="text-[13px] text-[var(--p-text-muted)]">
					Posting as <span class="text-[var(--p-text)]">@{data.user.handle}</span>
				</span>
			{/if}
			<div class="flex items-center gap-2.5 ml-auto">
				<a
					href="/"
					class="inline-flex items-center h-9 px-3.5 rounded-[var(--p-radius-pill)] border border-[var(--p-border)] text-[var(--p-text-secondary)] text-[13.5px] font-medium transition-all duration-[120ms] hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)] hover:bg-[var(--p-bg-hover)]"
				>
					Save draft
				</a>
				<button
					onclick={submit}
					disabled={submitting}
					class="inline-flex items-center h-9 px-3.5 rounded-[var(--p-radius-pill)] bg-[var(--p-accent)] text-[#14090d] font-semibold text-[13.5px] tracking-[-0.005em] transition-all duration-[120ms] hover:bg-[var(--p-accent-soft)] hover:shadow-[0_0_24px_-2px_var(--p-accent-glow)] active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
				>
					{submitting ? 'Posting…' : 'Post idea'}
				</button>
			</div>
		</div>
	</div>
</div>
