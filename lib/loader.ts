/** Shared shapes for data passed from getStaticProps to the motion chrome. */

export interface LoaderStat {
  label: string;
  value: number;
}

export interface LoaderRow {
  title: string;
  sub: string;
}

/**
 * Tiny, build-time summary each page hands to its loading scene so scenes can
 * speak about real content without bundling the full datasets into _app.
 */
export interface LoaderData {
  stats?: LoaderStat[];
  items?: string[];
  rows?: LoaderRow[];
  image?: string | null;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#039;": "'",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

/** Decodes the handful of HTML entities the scrapers leave in titles. */
export function decodeEntities(text: string) {
  return text.replace(/&(amp|quot|#0?39|lt|gt);/g, (m) => ENTITIES[m] ?? m);
}
