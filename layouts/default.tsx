import clsx from "clsx";

import Footer from "@/components/Footer";
import { Navbar } from "@/components/navbar";
import { Head } from "./head";

export default function DefaultLayout({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Head />
      <a
        className="sr-only z-[80] rounded-full bg-secondary px-4 py-2 text-signal-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#main"
      >
        Skip to content
      </a>
      <Navbar />
      <main
        className={clsx(
          "w-full flex-grow",
          !fullWidth && "container mx-auto max-w-7xl px-4 sm:px-6",
        )}
        id="main"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
