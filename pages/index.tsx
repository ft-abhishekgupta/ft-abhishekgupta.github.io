import { Link } from "@nextui-org/link";
import { Image } from "@nextui-org/image";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <main className="flex min-h-screen flex-col items-center p-10">
        <Link href={"/games"}>
          <Image
            src={"./profile.png"}
            alt="Profile Image"
            width={500}
            height={500}
          />
        </Link>
        <br />
        Hello World !!!
      </main>
    </DefaultLayout>
  );
}
