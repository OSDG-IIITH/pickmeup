import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getuser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ request }) => {
	const user = await getuser(request);
	if (!user) redirect(302, '/api/auth/login');
	return { user };
};
