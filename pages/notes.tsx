import DefaultLayout from "@/layouts/default";

export default function Notes() {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold text-center my-8">Notes</h1>
        <div className="w-full" style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}>
          <iframe
            src="https://ft-abhishekgupta.notion.site/Notes-34e67adc9af9806196c6e4d2757c2c31"
            className="w-full h-full rounded-xl border border-default-200"
            style={{ border: "none" }}
            allowFullScreen
            title="Notes"
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
