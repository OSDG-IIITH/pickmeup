import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { ulid } from 'ulid';
import { db } from '$lib/server/db';
import { comments } from '$lib/server/db/schema';
import { createcomment } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });

	const ideaid = params.id!;
	const body = await request.json().catch(() => null);
	const parsed = createcomment.safeParse(body);
	if (!parsed.success) return json({ error: 'invalid' }, { status: 400 });

	if (parsed.data.parent) {
		const [parent] = await db
			.select()
			.from(comments)
			.where(eq(comments.id, parsed.data.parent));
		if (!parent) return json({ error: 'parent not found' }, { status: 404 });
		if (parent.idea !== ideaid) return json({ error: 'parent belongs to different idea' }, { status: 400 });
		if (parent.parent) return json({ error: 'nested too deep' }, { status: 400 });
	}

	const id = ulid();
	await db.insert(comments).values({
		id,
		idea: ideaid,
		authorid: user.id,
		body: parsed.data.body,
		parent: parsed.data.parent
	});

	return json({ id }, { status: 201 });
};
