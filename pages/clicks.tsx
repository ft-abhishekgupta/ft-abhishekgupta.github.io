import DefaultLayout from "@/layouts/default";
import ClicksTile from "@/components/ClicksTile";
import rawData from "../scripts/data/clicks.json";
import { Chip } from "@nextui-org/react";

interface ClickItem {
  permalink: string;
  localPath: string;
}

const data: ClickItem[] = rawData as ClickItem[];

export default function Clicks() {
  return (
    <DefaultLayout>
      <div className="mx-auto">
        <div className="flex items-center justify-center flex-row">
          <Chip color="primary" size="lg" variant="bordered">
            {data.length}
          </Chip>
          <h1 className="text-3xl font-bold text-center my-8 p-4">
            Photos Clicked
          </h1>
        </div>
        <div className="flex flex-wrap justify-center">
          {data.map((item, index) => (
            <ClicksTile key={index} link={item.permalink} localPath={item.localPath} />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
