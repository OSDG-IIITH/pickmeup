import type { RequestHandler } from '@sveltejs/kit';
import { getIronSession } from 'iron-session';
import { sessionoptions } from '$lib/server/auth';

export const GET: RequestHandler = async ({ request }) => {
	const res = new Response();
	const session = await getIronSession(request, res, sessionoptions);
	session.destroy();
	await session.save();

	const headers = new Headers({ Location: '/' });
	headers.append('Set-Cookie', res.headers.get('Set-Cookie')!);
	return new Response(null, { status: 302, headers });
};
