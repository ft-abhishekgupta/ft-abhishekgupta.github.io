import { DownloadIcon } from "@/components/home/primitives";
import { profile } from "@/config/resume";
import DefaultLayout from "@/layouts/default";

export default function Resume() {
  return (
    <DefaultLayout>
      <div className="flex flex-col items-center gap-4 sm:gap-6 px-2 sm:px-0 pb-8">
        <h1 className="text-3xl font-bold text-center my-6 sm:my-8">Resume</h1>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
            download
            href={profile.resumeUrl}
          >
            <DownloadIcon className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            Download PDF
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-default-200 px-6 py-3 text-sm font-semibold text-default-700 transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
            href={profile.resumeUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open in new tab
          </a>
        </div>

        <img
          src={"./Resume-1.png"}
          alt="Resume"
          width={800}
          height={1131}
          className="w-full max-w-3xl h-auto rounded-lg shadow-lg"
        />
      </div>
    </DefaultLayout>
  );
}
