import DefaultLayout from "@/layouts/default";
import ClicksTile from "@/components/clicksTile";
import data from "../scripts/data/clicks.json";
import { Chip } from "@nextui-org/react";

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
            <ClicksTile key={index} link={item.permalink} imageUrl={item.url} />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
