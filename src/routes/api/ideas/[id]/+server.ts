import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { count, countDistinct, sql, eq, and, desc, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { ideas, users, tags, votes, comments, commentvotes } from '$lib/server/db/schema';
import { editidea } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';

export const GET: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	const id = params.id!;

	const [idea] = await db
		.select({
			id: ideas.id,
			title: ideas.title,
			body: ideas.body,
			status: ideas.status,
			pinned: ideas.pinned,
			authorid: ideas.authorid,
			authorhandle: users.handle,
			createdat: ideas.createdat,
			votes: count(votes.user),
			voted: user ? sql<boolean>`bool_or(${votes.user} = ${user.id})` : sql<null>`null`
		})
		.from(ideas)
		.innerJoin(users, eq(ideas.authorid, users.id))
		.leftJoin(votes, eq(votes.idea, ideas.id))
		.where(eq(ideas.id, id))
		.groupBy(ideas.id, users.id, users.handle);

	if (!idea) return json({ error: 'not found' }, { status: 404 });

	const ideaTags = await db.select({ tag: tags.tag }).from(tags).where(eq(tags.idea, id));

	const commentrows = await db
		.select({
			id: comments.id,
			idea: comments.idea,
			authorid: comments.authorid,
			authorhandle: users.handle,
			parent: comments.parent,
			body: comments.body,
			createdat: comments.createdat,
			votes: countDistinct(commentvotes.user),
			voted: user
				? sql<boolean>`bool_or(${commentvotes.user} = ${user.id})`
				: sql<null>`null`
		})
		.from(comments)
		.innerJoin(users, eq(comments.authorid, users.id))
		.leftJoin(commentvotes, eq(commentvotes.comment, comments.id))
		.where(eq(comments.idea, id))
		.groupBy(comments.id, users.id, users.handle)
		.orderBy(asc(comments.createdat));

	type CommentWithReplies = (typeof commentrows)[0] & { replies: (typeof commentrows)[0][] };

	const top: CommentWithReplies[] = commentrows
		.filter((c) => !c.parent)
		.map((c) => ({ ...c, replies: [] }));
	const map = new Map(top.map((c) => [c.id, c]));
	for (const c of commentrows.filter((c) => c.parent)) {
		map.get(c.parent!)?.replies.push(c);
	}

	return json({
		...idea,
		tags: ideaTags.map((t) => t.tag),
		comments: top
	});
};

export const PATCH: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });

	const id = params.id!;
	const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
	if (!idea) return json({ error: 'not found' }, { status: 404 });

	const isauthor = idea.authorid === user.id;
	const ismod = user.role === 'moderator';
	if (!isauthor && !ismod) return json({ error: 'forbidden' }, { status: 403 });

	const body = await request.json().catch(() => null);
	const parsed = editidea.safeParse(body);
	if (!parsed.success) return json({ error: 'invalid' }, { status: 400 });

	if (!isauthor && (parsed.data.title !== undefined || parsed.data.body !== undefined)) {
		return json({ error: 'forbidden' }, { status: 403 });
	}

	await db.update(ideas).set(parsed.data).where(eq(ideas.id, id));
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request, params }) => {
	const user = await getuser(request);
	if (!user) return json({ error: 'unauthorized' }, { status: 401 });

	const id = params.id!;
	const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
	if (!idea) return json({ error: 'not found' }, { status: 404 });

	if (idea.authorid !== user.id && user.role !== 'moderator') {
		return json({ error: 'forbidden' }, { status: 403 });
	}

	await db.delete(ideas).where(eq(ideas.id, id));
	return json({ ok: true });
};
