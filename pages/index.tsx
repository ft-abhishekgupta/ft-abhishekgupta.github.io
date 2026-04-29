import { Link } from "@nextui-org/link";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <main className="flex flex-col items-center py-6 sm:py-10 px-2">
        <Link href={"/games"} className="block w-full max-w-[500px]">
          <img
            src={"./profile.png"}
            alt="Profile Image"
            width={500}
            height={500}
            className="w-full h-auto rounded-lg"
          />
        </Link>
        <br />
        Hello World !!!
      </main>
    </DefaultLayout>
  );
}
