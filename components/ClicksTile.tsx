import SmartImage from "@/components/SmartImage";
import React from "react";

interface TileProps {
  link: string;
  localPath: string;
  onClick: () => void;
}

const ClicksTile: React.FC<TileProps> = ({ link, localPath, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="shadow-lg flex p-1 text-center hover:opacity-80 transition-opacity rounded-lg overflow-hidden cursor-pointer w-full"
    >
      <SmartImage
        src={localPath}
        alt={link}
        loading="lazy"
        className="rounded w-full h-auto object-cover"
        wrapperClassName="w-full rounded"
        placeholderClassName="aspect-square"
      />
    </div>
  );
};

export default ClicksTile;
