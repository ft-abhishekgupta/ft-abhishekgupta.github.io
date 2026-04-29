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
      <img
        src={localPath}
        alt={link}
        loading="lazy"
        className="rounded w-full h-auto object-cover"
      />
    </div>
  );
};

export default ClicksTile;
