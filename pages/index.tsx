import { Link } from "@nextui-org/link";
import { Image } from "@nextui-org/image";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <main className="flex min-h-screen flex-col items-center p-24">
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
