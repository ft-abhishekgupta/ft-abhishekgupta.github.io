// components/Tile.js
import Image from "next/image";
import React from "react";

interface TileProps {
  name: string;
  imageUrl: string;
}

const Tile: React.FC<TileProps> = ({ name, imageUrl }) => {
  return (
    <div className="max-w-xs rounded shadow-lg m-4 flex justify-center">
      <div className="relative w-40">
        <Image
          src={imageUrl}
          className="rounded-t text-center"
          alt={name}
          layout="responsive"
          width={160}
          height={160}
          style={{ maxWidth: "160px" }}
        />
        <div
          className="inset-0 flex items-center justify-center"
          style={{ maxWidth: "160px" }}
        >
          <div className=" p-2 text-center max-w-xs overflow-hidden">
            <div className="font-bold text-xl">{name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tile;
