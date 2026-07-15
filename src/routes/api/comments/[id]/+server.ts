import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { comments, editcomment } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';

export const PATCH: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });

	const id = params.id!;
	const [comment] = await db.select().from(comments).where(eq(comments.id, id));
	if (!comment) return json({ error: 'not found' }, { status: 404 });

	if (comment.authorid !== user.id) {
		return json({ error: 'forbidden' }, { status: 403 });
	}

	const body = await request.json().catch(() => null);
	const parsed = editcomment.safeParse(body);
	if (!parsed.success) return json({ error: 'invalid' }, { status: 400 });

	await db
		.update(comments)
		.set({ body: parsed.data.body, updatedat: new Date() })
		.where(eq(comments.id, id));

	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });

	const id = params.id!;
	const [comment] = await db.select().from(comments).where(eq(comments.id, id));
	if (!comment) return json({ error: 'not found' }, { status: 404 });

	if (comment.authorid !== user.id && user.role !== 'moderator') {
		return json({ error: 'forbidden' }, { status: 403 });
	}

	await db.delete(comments).where(eq(comments.id, id));
	return json({ ok: true });
};
