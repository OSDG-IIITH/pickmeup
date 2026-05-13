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

/** derives a warm-pink gradient from a handle string */
export function avatargrad(handle: string): string {
	let hash = 0;
	for (let i = 0; i < handle.length; i++) hash = ((hash * 31 + handle.charCodeAt(i)) | 0);
	const hue1 = 330 + (Math.abs(hash) % 30);
	const hue2 = (hue1 - 30 + 360) % 360;
	const sat = 60 + (Math.abs(hash >> 4) % 20);
	return `linear-gradient(135deg, hsl(${hue1} ${sat}% 70%), hsl(${hue2} ${sat - 10}% 50%))`;
}
