import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { count, eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { votes } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });

	const id = params.id!;
	const existing = await db
		.select()
		.from(votes)
		.where(and(eq(votes.idea, id), eq(votes.user, user.id)));

	if (existing.length > 0) {
		await db.delete(votes).where(and(eq(votes.idea, id), eq(votes.user, user.id)));
	} else {
		await db.insert(votes).values({ idea: id, user: user.id });
	}

	const [{ total }] = await db.select({ total: count() }).from(votes).where(eq(votes.idea, id));
	return json({ voted: existing.length === 0, count: total });
};
