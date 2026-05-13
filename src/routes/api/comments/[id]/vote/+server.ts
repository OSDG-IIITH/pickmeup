import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { count, eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { commentvotes } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });

	const id = params.id!;
	const existing = await db
		.select()
		.from(commentvotes)
		.where(and(eq(commentvotes.comment, id), eq(commentvotes.user, user.id)));

	if (existing.length > 0) {
		await db
			.delete(commentvotes)
			.where(and(eq(commentvotes.comment, id), eq(commentvotes.user, user.id)));
	} else {
		await db.insert(commentvotes).values({ comment: id, user: user.id });
	}

	const [{ total }] = await db
		.select({ total: count() })
		.from(commentvotes)
		.where(eq(commentvotes.comment, id));
	return json({ voted: existing.length === 0, count: total });
};
