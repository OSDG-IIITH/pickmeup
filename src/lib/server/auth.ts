import { getIronSession } from 'iron-session';
import { env } from '$env/dynamic/private';

export type SessionUser = {
	id: string;
	handle: string;
	name: string;
	role: 'user' | 'moderator';
};

type SessionData = {
	user?: SessionUser;
};

if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');
if (!env.CAS_URL) throw new Error('CAS_URL is not set');

export const casurl = env.CAS_URL;
export const casserviceurl = env.CAS_SERVICE_URL;

export const sessionoptions = {
	password: env.SESSION_SECRET,
	cookieName: 'pickmeup_session',
	cookieOptions: {
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: process.env.NODE_ENV === 'production'
	}
};

export function getsession(request: Request) {
	return getIronSession<SessionData>(request, new Response(), sessionoptions);
}

export async function getuser(request: Request): Promise<SessionUser | null> {
	const session = await getsession(request);
	return session.user ?? null;
}
