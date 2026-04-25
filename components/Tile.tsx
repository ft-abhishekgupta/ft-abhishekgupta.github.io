import { Image } from "@nextui-org/image";
import { Chip } from "@nextui-org/react";
import React from "react";

interface TileProps {
  name: string;
  imageUrl: string;
  slug?: string;
  userRating?: number | null;
  backloggdUrl?: string;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = rating / 2; // Convert 1-10 scale to 1-5 stars
  return (
    <div className="flex items-center gap-0.5" title={`${stars}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= stars ? "text-yellow-400" : "text-gray-600"}
          style={{ fontSize: "12px" }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const Tile: React.FC<TileProps> = ({
  name,
  imageUrl,
  slug,
  userRating,
  backloggdUrl,
}) => {
  const content = (
    <div
      className="shadow-lg m-1.5 flex flex-col text-center rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 bg-content1"
      style={{ width: "160px" }}
    >
      <div className="relative">
        <Image
          src={imageUrl}
          className="rounded-t"
          alt={name}
          width={160}
          height={213}
          style={{ width: "160px", height: "213px", objectFit: "cover" }}
        />
        {userRating && (
          <div className="absolute bottom-1 right-1 z-10">
            <Chip size="sm" color="warning" variant="solid" className="text-xs">
              ★ {(userRating / 2).toFixed(1)}
            </Chip>
          </div>
        )}
      </div>
      <div className="p-1.5 flex flex-col items-center gap-1">
        <div
          className="font-semibold text-xs leading-tight"
          style={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {name}
        </div>
        {userRating && <StarRating rating={userRating} />}
      </div>
    </div>
  );

  if (backloggdUrl) {
    return (
      <a
        href={backloggdUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline"
      >
        {content}
      </a>
    );
  }

  return content;
};

export default Tile;
