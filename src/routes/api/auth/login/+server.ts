import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { casurl, casserviceurl } from '$lib/server/auth';
import { base } from '$app/paths';

export const GET: RequestHandler = ({ url }) => {
	const serviceUrl = casserviceurl || `${url.origin}${base}/api/auth/login/callback`;
	const service = encodeURIComponent(serviceUrl);
	return redirect(302, `${casurl}/login?service=${service}`);
};
