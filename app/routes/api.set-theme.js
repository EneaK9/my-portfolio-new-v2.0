import { json, createCookieSessionStorage } from '@remix-run/node';

export async function action({ request, context }) {
  const formData = await request.formData();
  const theme = formData.get('theme');
  const env = context?.cloudflare?.env ?? process.env;
  const sessionSecret = env.SESSION_SECRET || 'fallback-session-secret';

  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 604_800,
      path: '/',
      sameSite: 'lax',
      secrets: [sessionSecret],
      secure: true,
    },
  });

  const session = await getSession(request.headers.get('Cookie'));
  session.set('theme', theme);

  return json(
    { status: 'success' },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
}
