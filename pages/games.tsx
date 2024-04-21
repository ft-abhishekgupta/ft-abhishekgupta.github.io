import Tile from "@/components/Tilse";
import data from "../scripts/games.json";

export default function Games() {
  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-bold text-center my-8">
        Games I Have Played ({data.length} and counting...!)
      </h1>
      <div className="flex flex-wrap justify-center">
        {data.map((item, index) => (
          <Tile key={index} name={item.name} imageUrl={item.image_url} />
        ))}
      </div>
    </div>
  );
}
