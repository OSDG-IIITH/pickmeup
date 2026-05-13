import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { ideas } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';

export const PATCH: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });
	if (user.role !== 'moderator') return json({ error: 'forbidden' }, { status: 403 });

	const id = params.id!;
	const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
	if (!idea) return json({ error: 'not found' }, { status: 404 });

	await db.update(ideas).set({ pinned: !idea.pinned }).where(eq(ideas.id, id));
	return json({ pinned: !idea.pinned });
};
