import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { casurl } from '$lib/server/auth';

export const GET: RequestHandler = ({ url }) => {
	const service = encodeURIComponent(`${url.origin}/api/auth/login/callback`);
	return redirect(302, `${casurl}/login?service=${service}`);
};
