import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ideas, users, tags, votes, comments } from '$lib/server/db/schema';
import { getuser } from '$lib/server/auth';
import { eq, countDistinct, sql, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ request, params }) => {
	const me = await getuser(request);
	const handle = params.handle;

	const [profile] = await db.select().from(users).where(eq(users.handle, handle));
	if (!profile) error(404, 'User not found');

	const posted = await db
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
			votes: countDistinct(votes.user),
			comments: countDistinct(comments.id),
			voted: me ? sql<boolean>`bool_or(${votes.user} = ${me.id})` : sql<null>`null`,
			ideatags: sql<string[]>`array_remove(array_agg(distinct ${tags.tag}), null)`
		})
		.from(ideas)
		.innerJoin(users, eq(ideas.authorid, users.id))
		.leftJoin(votes, eq(votes.idea, ideas.id))
		.leftJoin(comments, eq(comments.idea, ideas.id))
		.leftJoin(tags, eq(tags.idea, ideas.id))
		.where(eq(ideas.authorid, profile.id))
		.groupBy(ideas.id, users.id, users.handle, users.name)
		.orderBy(desc(ideas.createdat));

	const totallikes = posted.reduce((s, i) => s + i.votes, 0);
	const totalcomments = posted.reduce((s, i) => s + i.comments, 0);

	// liked tab only for own profile
	let liked: typeof posted = [];
	if (me && me.id === profile.id) {
		liked = await db
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
				votes: countDistinct(votes.user),
				comments: countDistinct(comments.id),
				voted: sql<boolean>`true`,
				ideatags: sql<string[]>`array_remove(array_agg(distinct ${tags.tag}), null)`
			})
			.from(votes)
			.innerJoin(ideas, eq(ideas.id, votes.idea))
			.innerJoin(users, eq(ideas.authorid, users.id))
			.leftJoin(comments, eq(comments.idea, ideas.id))
			.leftJoin(tags, eq(tags.idea, ideas.id))
			.where(eq(votes.user, me.id))
			.groupBy(ideas.id, users.id, users.handle, users.name)
			.orderBy(desc(ideas.createdat));
	}

	return {
		profile,
		posted,
		liked,
		totallikes,
		totalcomments,
		isme: me?.id === profile.id
	};
};
