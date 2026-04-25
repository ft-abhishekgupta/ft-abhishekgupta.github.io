import React from "react";

interface TileProps {
  link: string;
  localPath: string;
}

const ClicksTile: React.FC<TileProps> = ({ link, localPath }) => {
  return (
    <a
      href={`https://www.instagram.com/p/${link}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="shadow-lg m-2 flex p-1 text-center hover:opacity-80 transition-opacity rounded-lg overflow-hidden"
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
    </a>
  );
};

export default ClicksTile;
