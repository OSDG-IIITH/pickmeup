import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { count, countDistinct, sql, eq, and, desc, inArray } from 'drizzle-orm';
import { ulid } from 'ulid';
import { db } from '$lib/server/db';
import { ideas, users, tags, votes, comments } from '$lib/server/db/schema';
import { createidea } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';

export const GET: RequestHandler = async ({ request, url }) => {
	const user = await getuser(request);
	const sort = url.searchParams.get('sort') ?? 'votes';
	const tag = url.searchParams.get('tag');
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const statusParam = url.searchParams.get('status');

	const status = statusParam === 'closed' && user?.role === 'moderator' ? 'closed' : 'open';

	const sortexpr =
		sort === 'recent' ? desc(ideas.createdat) : desc(sql`count(distinct ${votes.user})`);

	const tagfilter = tag
		? inArray(
				ideas.id,
				db.select({ id: tags.idea }).from(tags).where(eq(tags.tag, tag))
			)
		: undefined;

	const rows = await db
		.select({
			id: ideas.id,
			title: ideas.title,
			body: ideas.body,
			status: ideas.status,
			pinned: ideas.pinned,
			authorid: ideas.authorid,
			authorhandle: users.handle,
			createdat: ideas.createdat,
			votes: countDistinct(votes.user),
			comments: countDistinct(comments.id),
			voted: user ? sql<boolean>`bool_or(${votes.user} = ${user.id})` : sql<null>`null`
		})
		.from(ideas)
		.innerJoin(users, eq(ideas.authorid, users.id))
		.leftJoin(votes, eq(votes.idea, ideas.id))
		.leftJoin(comments, eq(comments.idea, ideas.id))
		.where(and(eq(ideas.status, status), tagfilter))
		.groupBy(ideas.id, users.id, users.handle)
		.orderBy(desc(ideas.pinned), sortexpr)
		.limit(20)
		.offset((page - 1) * 20);

	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });

	const body = await request.json().catch(() => null);
	const parsed = createidea.safeParse(body);
	if (!parsed.success) return json({ error: 'invalid' }, { status: 400 });

	const id = ulid();
	await db.transaction(async (tx) => {
		await tx.insert(ideas).values({
			id,
			title: parsed.data.title,
			body: parsed.data.body,
			authorid: user.id
		});
		if (parsed.data.tags.length > 0) {
			await tx.insert(tags).values(parsed.data.tags.map((tag) => ({ idea: id, tag })));
		}
	});

	return json({ id }, { status: 201 });
};
