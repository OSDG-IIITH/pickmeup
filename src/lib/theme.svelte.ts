export type Theme = 'dark' | 'valentine' | 'mint' | 'ocean';

export const themes = [
	{ id: 'dark' as Theme, label: 'Dark', color: '#707080' },
	{ id: 'valentine' as Theme, label: 'Valentine', color: '#ff5d8f' },
	{ id: 'mint' as Theme, label: 'Mint', color: '#00d68f' },
	{ id: 'ocean' as Theme, label: 'Ocean', color: '#4a8ecc' },
];

function createtheme() {
	let current = $state<Theme>('dark');

	function apply(t: Theme) {
		current = t;
		if (typeof document !== 'undefined') {
			document.documentElement.dataset.theme = t;
			try { localStorage.setItem('theme', t); } catch {}
		}
	}

	return {
		get current() { return current; },
		set: apply,
		init() {
			try {
				const saved = localStorage.getItem('theme') as Theme | null;
				const valid: Theme[] = ['valentine', 'mint', 'ocean'];
			apply(valid.includes(saved as Theme) ? saved as Theme : 'dark');
			} catch { apply('dark'); }
		}
	};
}

export const theme = createtheme();
