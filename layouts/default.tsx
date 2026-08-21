import { Navbar } from "@/components/navbar";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { Head } from "./head";

export default function DefaultLayout({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Head />
      <Navbar />
      <main
        className={clsx(
          "flex-grow w-full",
          !fullWidth && "container mx-auto max-w-7xl px-4 sm:px-6",
        )}
      >
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="."
          title="Homepage"
        >
          <span className="text-default-600">Developed by</span>
          <p className="text-primary">Abhishek</p>
        </Link>
      </footer>
    </div>
  );
}
