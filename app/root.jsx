import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useRouteError,
} from '@remix-run/react';
import { json } from '@remix-run/node';
import { ThemeProvider, themeStyles } from '~/components/theme-provider';
import GothamBook from '~/assets/fonts/gotham-book.woff2';
import GothamMedium from '~/assets/fonts/gotham-medium.woff2';
import { useEffect, useState } from 'react';
import { Error } from '~/layouts/error';
import { VisuallyHidden } from '~/components/visually-hidden';
import { Navbar } from '~/layouts/navbar';
import { Progress } from '~/components/progress';
import config from '~/config.json';
import styles from './root.module.css';
import './reset.module.css';
import './global.module.css';

export const links = () => [
  {
    rel: 'preload',
    href: GothamMedium,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: '',
  },
  {
    rel: 'preload',
    href: GothamBook,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: '',
  },
  { rel: 'manifest', href: '/manifest.json' },
  { rel: 'icon', href: '/favicon.ico' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'shortcut_icon', href: '/shortcut.png', type: 'image/png', sizes: '64x64' },
  { rel: 'apple-touch-icon', href: '/icon-256.png', sizes: '256x256' },
  { rel: 'author', href: '/humans.txt', type: 'text/plain' },
];

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

export const loader = async ({ request }) => {
  const { url } = request;
  const { pathname } = new URL(url);
  const pathnameSliced = pathname.endsWith('/') ? pathname.slice(0, -1) : url;
  const canonicalUrl = `${config.url}${pathnameSliced}`;
  const theme = getThemeFromCookie(request.headers.get('Cookie'));

  return json({ canonicalUrl, theme });
};

export default function App() {
  const { canonicalUrl, theme: initialTheme } = useLoaderData();
  const [theme, setTheme] = useState(initialTheme);
  const { state } = useNavigation();

  function toggleTheme(newTheme) {
    const nextTheme = getNextTheme(theme, newTheme);
    setTheme(nextTheme);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', nextTheme);
      document.cookie = `theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.body?.setAttribute('data-theme', nextTheme);
    }
  }

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme && VALID_THEMES.has(storedTheme)) {
      setTheme(storedTheme);
      document.cookie = `theme=${storedTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.documentElement.setAttribute('data-theme', storedTheme);
      document.body?.setAttribute('data-theme', storedTheme);
    }
  }, []);

  useEffect(() => {
    console.info(
      `${config.ascii}\n`,
      `Taking a peek huh? Check out the source code: ${config.repo}\n\n`
    );
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Theme color doesn't support oklch so I'm hard coding these hexes for now */}
        <meta name="theme-color" content={theme === 'dark' ? '#111' : '#F2F2F2'} />
        <meta
          name="color-scheme"
          content={theme === 'light' ? 'light dark' : 'dark light'}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);document.cookie='theme='+t+'; Path=/; Max-Age=31536000; SameSite=Lax';}}catch(e){}})();`,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <Meta />
        <Links />
        <link rel="canonical" href={canonicalUrl} />
      </head>
      <body data-theme={theme}>
        <ThemeProvider theme={theme} toggleTheme={toggleTheme}>
          <Progress />
          <VisuallyHidden showOnFocus as="a" className={styles.skip} href="#main-content">
            Skip to main content
          </VisuallyHidden>
          <Navbar />
          <main
            id="main-content"
            className={styles.container}
            tabIndex={-1}
            data-loading={state === 'loading'}
          >
            <Outlet />
          </main>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111" />
        <meta name="color-scheme" content="dark light" />
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <Meta />
        <Links />
      </head>
      <body data-theme="dark">
        <Error error={error} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
