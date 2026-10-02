import { Chip } from "@nextui-org/react";
import React from "react";

import SmartImage from "@/components/SmartImage";

interface TileProps {
  name: string;
  imageUrl: string;
  slug?: string;
  userRating?: number | null;
  backloggdUrl?: string;
  year?: number | null;
  /** Stable id so grid reorders can be FLIP-animated. */
  flipId?: string;
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
  year,
  flipId,
}) => {
  // Three layers so transforms never fight: the outer element is moved by
  // Flip, the middle by the scroll-driven reveal, the inner by pointer tilt.
  const content = (
    <div className="tile-reveal w-full">
    <div
      className="tilt-card group relative shadow-lg flex flex-col text-center rounded-xl overflow-hidden bg-content1 w-full transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/10"
      data-tilt
    >
      <span aria-hidden="true" className="tilt-glare" />
      <div className="relative w-full aspect-[160/213] overflow-hidden bg-default-100">
        <SmartImage
          src={imageUrl}
          className="rounded-t w-full h-full object-cover"
          alt={name}
          width={160}
          height={213}
          loading="lazy"
          wrapperClassName="absolute inset-0 rounded-t transition-transform duration-700 ease-signal group-hover:scale-110"
        />
        {userRating && (
          <div className="absolute bottom-1 right-1 z-10">
            <Chip size="sm" color="warning" variant="solid" className="text-xs">
              ★ {(userRating / 2).toFixed(1)}
            </Chip>
          </div>
        )}
      </div>
      <div className="p-1.5 flex flex-col items-center gap-0.5">
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
        {year && (
          <span className="text-[10px] text-default-400">{year}</span>
        )}
        {userRating && <StarRating rating={userRating} />}
      </div>
    </div>
    </div>
  );

  if (backloggdUrl) {
    return (
      <a
        href={backloggdUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Open"
        data-flip-id={flipId}
        className="no-underline block w-full"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="w-full" data-flip-id={flipId}>
      {content}
    </div>
  );
};

export default Tile;
