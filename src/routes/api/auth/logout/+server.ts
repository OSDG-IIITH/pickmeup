import type { RequestHandler } from '@sveltejs/kit';
import { getIronSession } from 'iron-session';
import { sessionoptions } from '$lib/server/auth';
import { base } from '$app/paths';

export const GET: RequestHandler = async ({ request }) => {
	const res = new Response();
	const session = await getIronSession(request, res, sessionoptions);
	session.destroy();
	await session.save();

	const headers = new Headers({ Location: `${base}/` });
	headers.append('Set-Cookie', res.headers.get('Set-Cookie')!);
	return new Response(null, { status: 302, headers });
};
