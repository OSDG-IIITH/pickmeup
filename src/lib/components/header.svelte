<script lang="ts">
	import { initials, avatargrad } from '$lib/utils';
	import { User, Plus, LogOut } from '@lucide/svelte';
	import { base } from '$app/paths';

	interface Props {
		user: { handle: string; name: string; role: string } | null;
	}
	let { user }: Props = $props();

	let menuopen = $state(false);

	function outside(node: HTMLElement) {
		function handle(e: MouseEvent) {
			if (!node.contains(e.target as Node)) menuopen = false;
		}
		document.addEventListener('mousedown', handle);
		return {
			destroy() {
				document.removeEventListener('mousedown', handle);
			}
		};
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-[var(--p-border)] bg-[rgba(20,9,13,0.72)] [backdrop-filter:blur(16px)_saturate(140%)]"
>
	<div class="w-full max-w-[1180px] mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
		<!-- Brand -->
		<a href={`${base}/`} class="text-[19px] font-semibold tracking-[-0.02em] inline-flex items-center gap-2 text-[var(--p-text)]">
			<span class="w-2 h-2 rounded-full bg-[var(--p-accent)] shadow-[0_0_12px_var(--p-accent-glow),0_0_4px_var(--p-accent)]"></span>
			<span>pickmeup</span>
		</a>

		<!-- Actions -->
		<div class="flex items-center gap-3">
			{#if user}
				<a
					href={`${base}/new`}
					class="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--p-radius-pill)] border border-[var(--p-border)] text-[var(--p-text-secondary)] text-[13.5px] font-medium transition-all duration-[120ms] hover:text-[var(--p-text)] hover:border-[var(--p-border-strong)] hover:bg-[var(--p-bg-hover)]"
				>
					<Plus size={14} />
					<span>New idea</span>
				</a>

				<!-- Avatar + dropdown -->
				<div class="relative" use:outside>
					<button
						onclick={() => (menuopen = !menuopen)}
						class="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#14090d] font-semibold text-[13px] tracking-[-0.01em] border border-white/[0.08] cursor-pointer"
						style="background: {avatargrad(user.handle)}"
					>
						{initials(user.name || user.handle)}
					</button>

					{#if menuopen}
						<div
							class="absolute right-0 top-[calc(100%+8px)] w-60 bg-[var(--p-bg-elevated)] border border-[var(--p-border-strong)] rounded-[14px] p-1.5 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.6),0_0_0_1px_var(--p-border)] z-50 dropin"
							role="menu"
						>
							<div class="px-3 pt-3 pb-2.5 border-b border-[var(--p-border)] mb-1.5">
								<div class="font-semibold text-[14px] text-[var(--p-text)]">{user.name}</div>
								<div class="text-[var(--p-text-secondary)] text-[12.5px] mt-0.5">@{user.handle}</div>
							</div>
							<a
								href={`${base}/profile/${user.handle}`}
								onclick={() => (menuopen = false)}
								class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13.5px] text-[var(--p-text-secondary)] transition-all duration-100 hover:bg-[var(--p-bg-hover)] hover:text-[var(--p-text)]"
							>
								<User size={14} /><span>My profile</span>
							</a>
							<div class="h-px bg-[var(--p-border)] my-1.5"></div>
							<a
								href={`${base}/api/auth/logout`}
								class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13.5px] text-[var(--p-text-secondary)] transition-all duration-100 hover:bg-[var(--p-bg-hover)] hover:text-[var(--p-text)]"
							>
								<LogOut size={14} /><span>Sign out</span>
							</a>
						</div>
					{/if}
				</div>
			{:else}
				<a
					href={`${base}/api/auth/login`}
					class="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--p-radius-pill)] bg-[var(--p-accent)] text-[#14090d] font-semibold text-[13.5px] tracking-[-0.005em] transition-all duration-[120ms] hover:bg-[var(--p-accent-soft)] hover:shadow-[0_0_24px_-2px_var(--p-accent-glow)] active:translate-y-px"
				>
					Sign in
				</a>
			{/if}
		</div>
	</div>
</header>

<style>
	@keyframes dropIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.dropin {
		animation: dropIn 160ms ease;
	}
</style>
