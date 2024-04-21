import Image from "next/image";
import "./../globals.css";

export default function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <a href="/games">
        <Image
          src={"./profile.png"}
          alt="Profile Image"
          width={500}
          height={500}
        />
      </a>
      <br />
      Hello World !!!
    </main>
  );
}
