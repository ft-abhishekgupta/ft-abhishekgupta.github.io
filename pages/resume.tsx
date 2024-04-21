import DefaultLayout from "@/layouts/default";
import { Image } from "@nextui-org/image";

export default function Resume() {
  return (
    <DefaultLayout>
      <div className="">
        <h1 className="text-3xl font-bold text-center my-8">Resume</h1>
        <Image
          src={"./Resume-1.jpg"}
          alt="Profile Image"
          shadow="lg"
          radius="lg"
          width={800}
          height={800}
        />
        <br />
        <Image
          shadow="lg"
          radius="lg"
          src={"./Resume-2.jpg"}
          alt="Profile Image"
          width={800}
          height={800}
        />
      </div>
    </DefaultLayout>
  );
}
