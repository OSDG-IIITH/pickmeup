import type { RequestHandler } from '@sveltejs/kit';
import { getIronSession } from 'iron-session';
import { ulid } from 'ulid';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { sessionoptions, casurl, casserviceurl, type SessionUser } from '$lib/server/auth';
import { base } from '$app/paths';

export const GET: RequestHandler = async ({ url, request }) => {
	const ticket = url.searchParams.get('ticket');
	if (!ticket) return new Response(null, { status: 302, headers: { Location: `${base}/` } });

	const serviceUrl = casserviceurl || `${url.origin}${base}/api/auth/login/callback`;
	const service = encodeURIComponent(serviceUrl);
	const validateurl = `${casurl}/serviceValidate?service=${service}&ticket=${ticket}&format=JSON`;

	const data = await fetch(validateurl).then((r) => r.json());
	const success = data?.serviceResponse?.authenticationSuccess;
	if (!success) return new Response(null, { status: 302, headers: { Location: `${base}/` } });

	const attrs = success.attributes;
	const handle: string = attrs.uid?.[0] ?? success.user;
	const name: string = attrs.Name?.[0] ?? handle;
	const email: string = attrs['E-Mail']?.[0] ?? '';

	const mods = (env.MODERATOR_EMAILS ?? '').split(',').map((e: string) => e.trim());
	const role: 'user' | 'moderator' = mods.includes(email) ? 'moderator' : 'user';

	const [user] = await db
		.insert(users)
		.values({ id: ulid(), handle, name, role })
		.onConflictDoUpdate({ target: users.handle, set: { name, role } })
		.returning({ id: users.id, handle: users.handle, name: users.name, role: users.role });

	const sessionuser: SessionUser = { id: user.id, handle: user.handle, name: user.name, role: role };

	const res = new Response();
	const session = await getIronSession<{ user?: SessionUser }>(request, res, sessionoptions);
	session.user = sessionuser;
	await session.save();

	const headers = new Headers({ Location: '/' });
	headers.append('Set-Cookie', res.headers.get('Set-Cookie')!);
	return new Response(null, { status: 302, headers });
};
