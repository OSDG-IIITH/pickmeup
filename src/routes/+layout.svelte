<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative z-[1] min-h-screen flex flex-col">
	<Header user={data.user} />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
