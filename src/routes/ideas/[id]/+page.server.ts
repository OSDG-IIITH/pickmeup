import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ideas, users, tags, votes, comments, commentvotes } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';
import { eq, count, countDistinct, sql, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ request, params }) => {
	const user = await getuser(request);
	const id = params.id;

	const [idea] = await db
		.select({
			id: ideas.id,
			title: ideas.title,
			body: ideas.body,
			status: ideas.status,
			pinned: ideas.pinned,
			authorid: ideas.authorid,
			authorhandle: users.handle,
			authorname: users.name,
			createdat: ideas.createdat,
			votes: count(votes.user),
			voted: user ? sql<boolean>`bool_or(${votes.user} = ${user.id})` : sql<null>`null`
		})
		.from(ideas)
		.innerJoin(users, eq(ideas.authorid, users.id))
		.leftJoin(votes, eq(votes.idea, ideas.id))
		.where(eq(ideas.id, id))
		.groupBy(ideas.id, users.id, users.handle, users.name);

	if (!idea) error(404, 'Idea not found');

	const ideatags = await db.select({ tag: tags.tag }).from(tags).where(eq(tags.idea, id));

	const commentrows = await db
		.select({
			id: comments.id,
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

	type Reply = (typeof commentrows)[0];
	type Thread = Reply & { replies: Reply[] };

	const top: Thread[] = commentrows.filter((c) => !c.parent).map((c) => ({ ...c, replies: [] }));
	const map = new Map(top.map((c) => [c.id, c]));
	for (const c of commentrows.filter((c) => c.parent)) {
		map.get(c.parent!)?.replies.push(c);
	}

	return {
		idea: { ...idea, tags: ideatags.map((t) => t.tag) },
		comments: top,
		user
	};
};
