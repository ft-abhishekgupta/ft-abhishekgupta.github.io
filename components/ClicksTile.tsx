// components/Tile.js

import { Image } from "@nextui-org/image";
import React from "react";

interface TileProps {
  link: string;
  imageUrl: string;
}

const ClicksTile: React.FC<TileProps> = ({ link, imageUrl }) => {
  return (
    <div
      className="shadow-lg m-2 flex p-1 text-center"
      style={{ maxWidth: "300px" }}
    >
      <div className="">
        <Image
          src={imageUrl}
          className="rounded-t"
          alt={link}
          width={300}
          height={300}
          style={{ maxWidth: "300px" }}
        />
        <div className="font-bold text-m">{link}</div>
      </div>
    </div>
  );
};

export default ClicksTile;
