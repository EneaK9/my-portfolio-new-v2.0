import { json, redirect } from '@remix-run/node';

const VALID_THEMES = new Set(['dark', 'light']);

function getThemeFromCookie(cookieHeader) {
  if (!cookieHeader) return 'dark';
  const match = cookieHeader.match(/(?:^|;\s*)theme=(dark|light)(?:;|$)/);
  return match?.[1] || 'dark';
}

function getNextTheme(currentTheme, requestedTheme) {
  if (requestedTheme && VALID_THEMES.has(requestedTheme)) {
    return requestedTheme;
  }
  return currentTheme === 'dark' ? 'light' : 'dark';
}

function getThemeCookieHeader(theme) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo');
  const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : '/';
  return redirect(safeRedirect);
}

export async function action({ request }) {
  const formData = await request.formData();
  const requestedTheme = formData.get('theme');
  const currentTheme = getThemeFromCookie(request.headers.get('Cookie'));
  const theme = getNextTheme(currentTheme, requestedTheme);

  return json(
    { status: 'success', theme },
    {
      headers: {
        'Set-Cookie': getThemeCookieHeader(theme),
      },
    }
  );
}

export default function SetThemeRoute() {
  return null;
}
