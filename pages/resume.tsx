import { DownloadIcon } from "@/components/home/primitives";
import Magnetic from "@/components/motion/Magnetic";
import PageHeader from "@/components/PageHeader";
import SmartImage from "@/components/SmartImage";
import { profile } from "@/config/resume";
import DefaultLayout from "@/layouts/default";

export default function Resume() {
  return (
    <DefaultLayout>
      <PageHeader
        description="The one-page version: experience, skills and education."
        title="Resume"
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Magnetic>
            <a
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-colors duration-300 hover:bg-secondary hover:text-signal-ink"
              download
              href={profile.resumeUrl}
            >
              <DownloadIcon className="h-4 w-4 transition-transform duration-500 ease-signal group-hover:translate-y-0.5" />
              Download PDF
            </a>
          </Magnetic>
          <Magnetic>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-default-300 px-6 py-3.5 text-sm font-semibold transition-colors duration-300 hover:border-foreground"
              href={profile.resumeUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open in new tab
            </a>
          </Magnetic>
        </div>
      </PageHeader>

      <div className="flex justify-center pb-8">
        <SmartImage
          src={"./Resume-1.png"}
          alt="Resume"
          width={800}
          height={1131}
          className="w-full h-auto rounded-2xl shadow-2xl"
          wrapperClassName="tile-reveal w-full max-w-3xl rounded-2xl shadow-2xl"
          placeholderClassName="aspect-[800/1131]"
        />
      </div>
    </DefaultLayout>
  );
}