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
      data-cursor="View"
      className="tile-reveal group flex w-full cursor-pointer overflow-hidden rounded-xl bg-content1 p-1 text-center shadow-lg"
    >
      <SmartImage
        src={localPath}
        alt={link}
        loading="lazy"
        className="rounded-lg w-full h-auto object-cover"
        wrapperClassName="w-full rounded-lg transition-transform duration-1000 ease-signal group-hover:scale-[1.06]"
        placeholderClassName="aspect-square"
      />
    </div>
  );
};

export default ClicksTile;
