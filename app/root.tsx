import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { cssBundleHref } from "@remix-run/css-bundle";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "./tailwind.css?url";
import { getAuthenticator } from "./auth/authenticator.server";
import { Footer, Sidebar } from "./components/organisms/base";
import { getPreference } from "./auth/preference.server";
import { useState } from "react";
import { SignInProvider } from "./contexts/SignInProvider";
import { SignInBottomSheet } from "./components/molecules/auth";

export const links = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.8/static/pretendard.css" },
  { rel: "stylesheet", href: "https://cdn.jsdelivr.net/gh/Nyannnnnng/GyeonggiTitleWoff/stylesheet.css" },
  { rel: "stylesheet", href: styles },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;

  const sensei = await getAuthenticator(env).isAuthenticated(request);
  const preference = await getPreference(env, request);
  return json({
    currentUsername: sensei?.username ?? null,
    darkMode: preference.darkMode ?? false,
  });
};

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  const { currentUsername } = loaderData;

  const [darkMode, setDarkMode] = useState(loaderData.darkMode);

  return (
    <html lang="ko" className={darkMode ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content={darkMode ? "#262626" : "#ffffff"} />
        <meta name="background-color" content={darkMode ? "#262626" : "#ffffff"} />
        <Meta />
        <Links />
      </head>
      <body className="text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200 transition">
        <SignInProvider>
          <div className="mx-auto flex flex-col-reverse lg:flex-row">
            <div className="px-4 py-6 w-80">
              <Sidebar currentUsername={currentUsername} setDarkMode={setDarkMode} />
            </div>
            <div className="w-full overflow-y-auto">
              <div className="xl:h-screen max-w-3xl 2xl:max-w-4xl md:px-8 py-6 xl:border-l xl:border-r border-neutral-100 dark:border-neutral-700">
                <Outlet />
                <Footer />
              </div>
            </div>
          </div>
          <SignInBottomSheet />
        </SignInProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
