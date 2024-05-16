import Tile from "@/components/tile";
import data from "../scripts/data/games.json";
import { Chip } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";

export default function Games() {
  return (
    <DefaultLayout>
      <div className="mx-auto">
        <div className="flex items-center justify-center flex-row">
          <Chip color="primary" size="lg" variant="bordered">
            {data.length}
          </Chip>
          <h1 className="text-3xl font-bold text-center my-8 p-4">
            Games Played
          </h1>
        </div>
        <div className="flex flex-wrap justify-center">
          {data.map((item, index) => (
            <Tile key={index} name={item.name} imageUrl={item.imageUrl} />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
