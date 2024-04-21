import Image from "next/image";
import Link from "next/link";
import "./../globals.css";

export default function Index() {
  return (
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
  );
}
