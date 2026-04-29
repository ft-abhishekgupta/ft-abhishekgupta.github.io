import DefaultLayout from "@/layouts/default";

export default function Resume() {
  return (
    <DefaultLayout>
      <div className="flex flex-col items-center gap-4 sm:gap-6 px-2 sm:px-0 pb-8">
        <h1 className="text-3xl font-bold text-center my-6 sm:my-8">Resume</h1>
        <img
          src={"./Resume-1.jpg"}
          alt="Resume page 1"
          width={800}
          height={1131}
          className="w-full max-w-3xl h-auto rounded-lg shadow-lg"
        />
        <img
          src={"./Resume-2.jpg"}
          alt="Resume page 2"
          width={800}
          height={1131}
          className="w-full max-w-3xl h-auto rounded-lg shadow-lg"
        />
      </div>
    </DefaultLayout>
  );
}
