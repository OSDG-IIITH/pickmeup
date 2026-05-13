import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { ideas, users, tags, votes, comments } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';
import { eq, and, desc, countDistinct, sql, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ request, url }) => {
	const user = await getuser(request);
	const sort = url.searchParams.get('sort') ?? 'votes';
	const tag = url.searchParams.get('tag') ?? null;

	const sortexpr =
		sort === 'recent' ? desc(ideas.createdat) : desc(countDistinct(votes.user));

	const tagfilter = tag
		? inArray(ideas.id, db.select({ id: tags.idea }).from(tags).where(eq(tags.tag, tag)))
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
			voted: user
				? sql<boolean>`bool_or(${votes.user} = ${user.id})`
				: sql<null>`null`,
			ideatags: sql<string[]>`array_remove(array_agg(distinct ${tags.tag}), null)`
		})
		.from(ideas)
		.innerJoin(users, eq(ideas.authorid, users.id))
		.leftJoin(votes, eq(votes.idea, ideas.id))
		.leftJoin(comments, eq(comments.idea, ideas.id))
		.leftJoin(tags, eq(tags.idea, ideas.id))
		.where(and(eq(ideas.status, 'open'), tagfilter))
		.groupBy(ideas.id, users.id, users.handle)
		.orderBy(desc(ideas.pinned), sortexpr)
		.limit(20);

	const distincttags = await db
		.selectDistinct({ tag: tags.tag })
		.from(tags)
		.orderBy(tags.tag);

	return {
		ideas: rows,
		availabletags: distincttags.map((t) => t.tag),
		sort,
		activetag: tag
	};
};
