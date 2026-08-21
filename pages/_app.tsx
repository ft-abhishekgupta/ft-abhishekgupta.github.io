import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { fontSans, fontMono } from "@/config/fonts";
import { useRouter } from "next/router";
import clsx from "clsx";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
      >
        <div
          className={clsx(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontMono.variable,
          )}
        >
          <Component {...pageProps} />
        </div>
      </NextThemesProvider>
    </NextUIProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
