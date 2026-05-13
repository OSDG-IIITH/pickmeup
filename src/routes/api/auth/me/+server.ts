import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getuser } from '$lib/server/auth';

export const GET: RequestHandler = async ({ request }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });
	return json(user);
};
