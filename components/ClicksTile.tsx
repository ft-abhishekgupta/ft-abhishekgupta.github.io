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
      className="shadow-lg m-2 flex p-1 text-center hover:opacity-80 transition-opacity rounded-lg overflow-hidden cursor-pointer"
      style={{ maxWidth: "300px" }}
    >
      <img
        src={localPath}
        alt={link}
        width={300}
        height={300}
        loading="lazy"
        style={{ maxWidth: "300px", objectFit: "cover" }}
        className="rounded"
      />
    </div>
  );
};

export default ClicksTile;
