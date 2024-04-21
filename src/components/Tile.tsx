// components/Tile.js
import Image from "next/image";
import React from "react";

interface TileProps {
  name: string;
  imageUrl: string;
}

const Tile: React.FC<TileProps> = ({ name, imageUrl }) => {
  return (
    <div
      className="shadow-lg m-2 flex p-1 text-center"
      style={{ maxWidth: "160px" }}
    >
      <div className="">
        <Image
          src={imageUrl}
          className="rounded-t"
          alt={name}
          width={160}
          height={160}
          style={{ maxWidth: "160px" }}
        />
        <div className="font-bold text-m">{name}</div>
      </div>
    </div>
  );
};

export default Tile;
