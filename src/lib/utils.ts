import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/** formats ISO date string as relative time */
export function timeago(date: string | Date): string {
	const ms = Date.now() - new Date(date).getTime();
	const s = ms / 1000;
	if (s < 60) return 'just now';
	if (s < 3600) return `${Math.floor(s / 60)}m ago`;
	if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
	if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
	return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

/** derives 1-2 uppercase initials from a handle */
export function initials(handle: string): string {
	return (
		handle
			.split(/[.\s_-]/)
			.map((s) => s[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase() || handle.slice(0, 2).toUpperCase()
	);
}

/** derives a gradient from a handle string, tinted by theme */
export function avatargrad(handle: string, themename?: string): string {
	let hash = 0;
	for (let i = 0; i < handle.length; i++) hash = ((hash * 31 + handle.charCodeAt(i)) | 0);
	const n = Math.abs(hash);
	if (themename === 'dark') {
		const h = 215 + (n % 50);
		return `linear-gradient(135deg, hsl(${h} 18% 26%), hsl(${(h + 30) % 360} 22% 18%))`;
	}
	if (themename === 'mint') {
		const h = 145 + (n % 35);
		const s = 48 + ((n >> 4) % 20);
		return `linear-gradient(135deg, hsl(${h} ${s}% 52%), hsl(${(h + 18) % 360} ${s - 6}% 36%))`;
	}
	if (themename === 'ocean') {
		const h = 195 + (n % 50);
		const s = 70 + ((n >> 4) % 20);
		return `linear-gradient(135deg, hsl(${h} ${s}% 78%), hsl(${(h + 25) % 360} ${s - 10}% 60%))`;
	}
	const hue1 = 330 + (n % 30);
	const sat = 60 + ((n >> 4) % 20);
	return `linear-gradient(135deg, hsl(${hue1} ${sat}% 70%), hsl(${(hue1 - 30 + 360) % 360} ${sat - 10}% 50%))`;
}
