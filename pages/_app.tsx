import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import clsx from "clsx";

import Cursor from "@/components/motion/Cursor";
import PageTransition from "@/components/motion/PageTransition";
import Preloader from "@/components/motion/Preloader";
import ScrollProgress from "@/components/motion/ScrollProgress";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { fontMono, fontPixel, fontSans } from "@/config/fonts";
import "lenis/dist/lenis.css";
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
        {/* Expose the font variables on :root so portals (popovers, cursor,
            modals) rendered outside the app div share the same type. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--font-sans:${fontSans.style.fontFamily};--font-mono:${fontMono.style.fontFamily};--font-pixel:${fontPixel.style.fontFamily};}`,
          }}
        />
        <SmoothScroll />
        <div
          className={clsx(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontMono.variable,
          )}
        >
          <PageTransition loader={pageProps.loader}>
            <Component {...pageProps} />
          </PageTransition>
        </div>
        <ScrollProgress />
        <Cursor />
        <div aria-hidden="true" className="grain" />
        <Preloader loader={pageProps.loader} />
      </NextThemesProvider>
    </NextUIProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
