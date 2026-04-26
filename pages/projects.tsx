import rawData from "../scripts/data/projects.json";
import { Chip, Input, Select, SelectItem } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectItem {
  name: string;
  displayName: string;
  description: string;
  url: string;
  language: string;
  topics: string[];
  stars: number;
  updatedAt: string;
  category: string;
  screenshots: string[];
  features: string[];
}

const data: ProjectItem[] = rawData as ProjectItem[];

const CATEGORY_COLORS: Record<string, string> = {
  Android: "bg-green-500/10 text-green-500 border-green-500/20",
  Web: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Bot: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Blockchain: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Desktop: "bg-red-500/10 text-red-500 border-red-500/20",
  HPC: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  Python: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const LANGUAGE_ICONS: Record<string, string> = {
  Java: "☕",
  Python: "🐍",
  TypeScript: "📘",
  JavaScript: "📒",
  PHP: "🐘",
  CSS: "🎨",
  Solidity: "⛓️",
  "C++": "⚡",
  C: "⚡",
};

type SortOption = "recent" | "stars" | "name-asc";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function Projects() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  const categories = useMemo(() => {
    const cs = new Set<string>();
    data.forEach((p) => cs.add(p.category));
    return Array.from(cs).sort();
  }, []);

  const filteredProjects = useMemo(() => {
    let projects = [...data];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      projects = projects.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.language.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      projects = projects.filter((p) => p.category === categoryFilter);
    }

    switch (sortBy) {
      case "stars":
        projects.sort((a, b) => b.stars - a.stars);
        break;
      case "name-asc":
        projects.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      case "recent":
      default:
        projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        break;
    }

    return projects;
  }, [search, sortBy, categoryFilter]);

  const activeProject = activeIndex !== null ? filteredProjects[activeIndex] : null;

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setScreenshotIndex(0);
  };
  const closeLightbox = () => setActiveIndex(null);

  const goNext = useCallback(() => {
    if (activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % filteredProjects.length);
      setScreenshotIndex(0);
    }
  }, [activeIndex, filteredProjects.length]);

  const goPrev = useCallback(() => {
    if (activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + filteredProjects.length) % filteredProjects.length);
      setScreenshotIndex(0);
    }
  }, [activeIndex, filteredProjects.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, goNext, goPrev]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activeIndex]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-center flex-row gap-2 mb-4">
          <Chip color="success" size="lg" variant="bordered">
            {data.length}
          </Chip>
          <h1 className="text-3xl font-bold text-center my-8 p-4">
            Projects
          </h1>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              categoryFilter === "all"
                ? "bg-primary text-white shadow-lg scale-105"
                : "bg-default-100 text-default-600 hover:bg-default-200"
            }`}
          >
            All ({data.length})
          </button>
          {categories.map((cat) => {
            const count = data.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === cat
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-default-100 text-default-600 hover:bg-default-200"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
          <Input
            className="max-w-xs"
            placeholder="Search projects..."
            value={search}
            onValueChange={setSearch}
            isClearable
            onClear={() => setSearch("")}
            startContent={<span className="text-default-400">🔍</span>}
            size="sm"
          />
          <Select
            className="max-w-[180px]"
            label="Sort by"
            size="sm"
            selectedKeys={new Set([sortBy])}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              if (val) setSortBy(val as SortOption);
            }}
          >
            <SelectItem key="recent">Most Recent</SelectItem>
            <SelectItem key="stars">Most Stars</SelectItem>
            <SelectItem key="name-asc">Name (A → Z)</SelectItem>
          </Select>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => openLightbox(index)}
                className="group cursor-pointer rounded-xl border border-default-200 bg-content1 p-5 transition-all duration-200 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1"
              >
                {/* Screenshot preview */}
                {project.screenshots.length > 0 && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-default-100 aspect-video flex items-center justify-center">
                    <img
                      src={project.screenshots[0]}
                      alt={project.displayName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Category & Language */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      CATEGORY_COLORS[project.category] || CATEGORY_COLORS.Other
                    }`}
                  >
                    {project.category}
                  </span>
                  {project.language && (
                    <span className="text-xs text-default-400 flex items-center gap-1">
                      {LANGUAGE_ICONS[project.language] || "💻"}{" "}
                      {project.language}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                  {project.displayName}
                </h3>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-default-500 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Footer: stars & date */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-default-100">
                  {project.stars > 0 ? (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      ⭐ {project.stars}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-default-400">
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <p className="text-center text-default-400 mt-8">
            No projects found matching &quot;{search}&quot;
          </p>
        )}

        {/* Footer link */}
        <div className="text-center mt-8 mb-4">
          <a
            href="https://github.com/ft-abhishekgupta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            View all repositories on GitHub →
          </a>
        </div>
      </div>

      {/* Lightbox overlay */}
      {activeProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-10 hover:text-gray-300 transition-colors w-10 h-10 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Previous project */}
          <button
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold z-10 hover:text-gray-300 transition-colors w-10 h-10 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous"
          >
            ‹
          </button>

          {/* Content card */}
          <div
            className="bg-content1 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Screenshot carousel */}
            {activeProject.screenshots.length > 0 && (
              <div className="relative bg-black/50 rounded-t-2xl">
                <div className="flex items-center justify-center min-h-[200px] md:min-h-[350px]">
                  <img
                    src={activeProject.screenshots[screenshotIndex]}
                    alt={`${activeProject.displayName} screenshot ${screenshotIndex + 1}`}
                    className="max-w-full max-h-[50vh] object-contain rounded-t-2xl"
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                  />
                </div>
                {activeProject.screenshots.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
                      onClick={() => setScreenshotIndex((screenshotIndex - 1 + activeProject.screenshots.length) % activeProject.screenshots.length)}
                    >
                      ‹
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
                      onClick={() => setScreenshotIndex((screenshotIndex + 1) % activeProject.screenshots.length)}
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {activeProject.screenshots.map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === screenshotIndex ? "bg-white scale-125" : "bg-white/40"
                          }`}
                          onClick={() => setScreenshotIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Project details */}
            <div className="p-6 md:p-8 space-y-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        CATEGORY_COLORS[activeProject.category] || CATEGORY_COLORS.Other
                      }`}
                    >
                      {activeProject.category}
                    </span>
                    {activeProject.language && (
                      <span className="text-xs text-default-400 flex items-center gap-1">
                        {LANGUAGE_ICONS[activeProject.language] || "💻"}{" "}
                        {activeProject.language}
                      </span>
                    )}
                    {activeProject.stars > 0 && (
                      <span className="text-xs text-yellow-500 flex items-center gap-1">
                        ⭐ {activeProject.stars}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {activeProject.displayName}
                  </h2>
                </div>
                <a
                  href={activeProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <GitHubIcon className="w-4 h-4" />
                  GitHub
                </a>
              </div>

              {/* Description */}
              {activeProject.description && (
                <p className="text-default-600 leading-relaxed">
                  {activeProject.description}
                </p>
              )}

              {/* Features */}
              {activeProject.features.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-2">
                    Key Features
                  </h3>
                  <ul className="space-y-1.5">
                    {activeProject.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-default-600">
                        <span className="text-primary mt-0.5">▸</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Topics */}
              {activeProject.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.topics.map((topic) => (
                    <Chip key={topic} size="sm" variant="flat" className="text-xs">
                      {topic}
                    </Chip>
                  ))}
                </div>
              )}

              {/* Screenshot thumbnails */}
              {activeProject.screenshots.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {activeProject.screenshots.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setScreenshotIndex(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === screenshotIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer meta */}
              <div className="flex items-center gap-4 pt-3 border-t border-default-200 text-xs text-default-400">
                {activeProject.updatedAt && (
                  <span>Updated {formatDate(activeProject.updatedAt)}</span>
                )}
                <span className="ml-auto text-default-300">
                  {activeIndex !== null && `${activeIndex + 1} / ${filteredProjects.length}`}
                </span>
              </div>
            </div>
          </div>

          {/* Next project */}
          <button
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold z-10 hover:text-gray-300 transition-colors w-10 h-10 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next"
          >
            ›
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 text-white text-sm opacity-70">
            Use ← → to navigate • Esc to close
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
