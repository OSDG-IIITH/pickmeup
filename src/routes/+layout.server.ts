import type { LayoutServerLoad } from './$types';
import { getuser } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ request }) => {
	const user = await getuser(request);
	return { user };
};
