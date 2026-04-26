#!/usr/bin/env python3
"""
Fetch public GitHub repos for ft-abhishekgupta and generate projects.json.

Uses the `gh` CLI to pull repo metadata, then enriches it with:
- Human-readable display names
- Project categories based on name/language/topics
- README content and screenshots from local clones or GitHub raw URLs
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

GITHUB_USER = "ft-abhishekgupta"
SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = SCRIPT_DIR / "data" / "projects.json"

# Path to local repo clones (used in CI or locally)
LOCAL_REPOS_DIR = Path(os.environ.get("LOCAL_REPOS_DIR", r"C:\Personal\github"))

GH_FIELDS = "name,description,url,primaryLanguage,repositoryTopics,stargazerCount,updatedAt,defaultBranchRef"

RAW_BASE = f"https://raw.githubusercontent.com/{GITHUB_USER}"

# ── Display-name overrides (repo name -> pretty name) ────────────────────────
DISPLAY_NAME_OVERRIDES = {
    "ft-abhishekgupta.github.io": "Portfolio Website",
    "android-event-app-encoreiet": "Encore IET – Event App",
    "android-event-app-magnumopus": "Magnum Opus – Event App",
    "android-game-puzzle-pairemup": "Pair 'Em Up – Puzzle Game",
    "android-industrialsociology-notes-app": "Industrial Sociology Notes App",
    "android-microprocessor-notes-app": "Microprocessor Notes App",
    "android-pharmacy-inventory-system-pharmware": "PharmWare – Pharmacy Inventory",
    "android-socialnetwork-linkr": "Linkr – Social Network",
    "android-website-app-template": "Android WebView App Template",
    "ethereum-dapp-votingsystem": "Ethereum DApp – Voting System",
    "java-swing-games": "Java Swing Games",
    "material-kit-react": "Material Kit React",
    "mpich-visualisation": "MPICH Visualisation",
    "php-mysql-onlinequizportal": "Online Quiz Portal",
    "telebot-reminderservice": "Telegram Reminder Bot",
    "telebot-wordpress-bloggingviamessaging-xeon": "Xeon – WordPress Blogging Bot",
}

# ── Short descriptions for projects ──────────────────────────────────────────
SHORT_DESCRIPTIONS = {
    "android-basic-calculator": "A simple calculator app built for Android.",
    "android-basic-puzzle-game": "A sliding puzzle game for Android with multiple difficulty levels.",
    "android-calculator": "A full-featured scientific calculator for Android, published on the Play Store.",
    "android-event-app-encoreiet": "Official event app for Encore IET college fest with schedules, maps, and notifications.",
    "android-event-app-magnumopus": "Official event app for Magnum Opus college fest with event info and live updates.",
    "android-game-puzzle-pairemup": "A memory card matching game for Android with leaderboards, published on the Play Store.",
    "android-industrialsociology-notes-app": "Study notes app for Industrial Sociology with offline access, published on the Play Store.",
    "android-microprocessor-notes-app": "Study notes app for Microprocessor course with diagrams and offline reading.",
    "android-notes-app": "Engineering notes apps for Strength of Materials and Mechanics & Thermodynamics.",
    "android-pharmacy-inventory-system-pharmware": "Complete pharmacy inventory management system with billing and customer tracking.",
    "android-simple-birthday-app": "A minimal birthday greeting app for Android.",
    "android-socialnetwork-linkr": "A full-featured social networking app with real-time messaging, posts, and user profiles.",
    "android-website-app-template": "A reusable Android template for wrapping websites as native apps using WebView.",
    "ethereum-dapp-votingsystem": "A decentralized voting system built on Ethereum blockchain with Solidity smart contracts.",
    "ft-abhishekgupta.github.io": "Personal portfolio website built with Next.js, TypeScript, and Tailwind CSS.",
    "java-swing-games": "Collection of 7 classic games built with Java Swing: Chess, Tetris, Sudoku, Snake & Ladders, and more.",
    "material-kit-react": "Free React UI Kit based on Material Design with reusable components.",
    "mpich-visualisation": "Visualization tool for MPI/HPC network topologies: Fat Tree, Torus, and Dragonfly.",
    "php-mysql-onlinequizportal": "Online quiz portal with random question generation, user management, and score tracking.",
    "telebot-reminderservice": "Telegram bot that schedules and sends reminders using natural language input.",
    "telebot-wordpress-bloggingviamessaging-xeon": "Telegram bot for publishing WordPress blog posts directly via messaging.",
}

# ── Category rules (checked in order; first match wins) ──────────────────────
CATEGORY_RULES = [
    (lambda n, l, t: n.startswith("android-"), "Android"),
    (lambda n, l, t: "ethereum" in n or "dapp" in n or "blockchain" in t, "Blockchain"),
    (lambda n, l, t: "telebot" in n or "bot" in n, "Bot"),
    (lambda n, l, t: "react" in n or "next" in n or l in ("JavaScript", "TypeScript", "HTML", "CSS"), "Web"),
    (lambda n, l, t: "java-swing" in n or l == "Java", "Desktop"),
    (lambda n, l, t: "php" in n or "mysql" in n, "Web"),
    (lambda n, l, t: "mpich" in n or "mpi" in n, "HPC"),
    (lambda n, l, t: l == "Python", "Python"),
]


def make_display_name(repo_name: str) -> str:
    if repo_name in DISPLAY_NAME_OVERRIDES:
        return DISPLAY_NAME_OVERRIDES[repo_name]
    return repo_name.replace("-", " ").title()


def categorize(name: str, language: str, topics: list[str]) -> str:
    topics_str = " ".join(topics).lower()
    name_lower = name.lower()
    lang = language or ""
    for predicate, category in CATEGORY_RULES:
        if predicate(name_lower, lang, topics_str):
            return category
    return "Other"


def extract_readme_data(repo_name: str, default_branch: str) -> dict:
    """Extract screenshots and features from README.md."""
    readme_path = LOCAL_REPOS_DIR / repo_name / "README.md"
    result = {"screenshots": [], "features": [], "readmeExcerpt": ""}

    if not readme_path.exists():
        return result

    try:
        content = readme_path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return result

    # Extract images from README (markdown and HTML)
    md_imgs = re.findall(r'!\[[^\]]*\]\(([^)]+)\)', content)
    html_imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content)
    all_imgs = md_imgs + html_imgs

    screenshots = []
    for img in all_imgs:
        # Skip external badges, shields, etc.
        if any(skip in img.lower() for skip in ['shields.io', 'badge', 'play.google.com', 'img.shields']):
            continue
        # Convert relative paths to raw GitHub URLs
        if img.startswith(('http://', 'https://')):
            if 'githubusercontent.com' in img or 'youtube.com' in img:
                screenshots.append(img)
        else:
            # Relative path - convert to raw GitHub URL
            clean_path = img.lstrip('./')
            raw_url = f"{RAW_BASE}/{repo_name}/{default_branch}/{clean_path}"
            screenshots.append(raw_url)

    result["screenshots"] = screenshots[:8]  # Limit to 8 screenshots

    # Extract features from README bullet points
    feature_lines = re.findall(r'^[\s]*[-*]\s+(.+)$', content, re.MULTILINE)
    features = []
    for line in feature_lines:
        clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', line)  # Remove markdown links
        clean = re.sub(r'[*_`]', '', clean).strip()  # Remove formatting
        if 10 < len(clean) < 120 and not clean.startswith('#'):
            features.append(clean)
    result["features"] = features[:6]  # Limit to 6 features

    # Extract a short excerpt (first meaningful paragraph)
    paragraphs = re.split(r'\n\s*\n', content)
    for para in paragraphs:
        clean = para.strip()
        # Skip headings, images, badges
        if clean.startswith('#') or clean.startswith('!') or clean.startswith('<') or clean.startswith('['):
            continue
        clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)
        clean = re.sub(r'[*_`]', '', clean).strip()
        if len(clean) > 30:
            result["readmeExcerpt"] = clean[:300]
            break

    return result


def fetch_repos() -> list[dict]:
    cmd = [
        "gh", "repo", "list", GITHUB_USER,
        "--json", GH_FIELDS,
        "--limit", "100",
        "--no-archived",
    ]
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(f"gh CLI failed (exit {result.returncode}): {result.stderr.strip()}")
    return json.loads(result.stdout)


def transform(raw_repos: list[dict]) -> list[dict]:
    projects = []
    for repo in raw_repos:
        name = repo.get("name", "")
        lang = (repo.get("primaryLanguage") or {}).get("name", "")
        topics = [t.get("name", "") for t in (repo.get("repositoryTopics") or [])]
        default_branch = (repo.get("defaultBranchRef") or {}).get("name", "master")

        # Get README data
        readme_data = extract_readme_data(name, default_branch)

        # Use curated description if available, else GitHub description, else README excerpt
        description = SHORT_DESCRIPTIONS.get(name, "") or repo.get("description") or readme_data.get("readmeExcerpt", "")

        projects.append({
            "name": name,
            "displayName": make_display_name(name),
            "description": description,
            "url": repo.get("url", ""),
            "language": lang,
            "topics": topics,
            "stars": repo.get("stargazerCount", 0),
            "updatedAt": repo.get("updatedAt", ""),
            "category": categorize(name, lang, topics),
            "screenshots": readme_data["screenshots"],
            "features": readme_data["features"],
        })

    projects.sort(key=lambda p: p["updatedAt"], reverse=True)
    return projects


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    try:
        raw = fetch_repos()
        print(f"Fetched {len(raw)} repos from GitHub.")
    except Exception as exc:
        print(f"⚠ Could not fetch from GitHub: {exc}", file=sys.stderr)
        if OUTPUT_FILE.exists():
            print(f"Falling back to existing {OUTPUT_FILE}")
            return
        print("No existing data to fall back on. Exiting.", file=sys.stderr)
        sys.exit(1)

    projects = transform(raw)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(projects)} projects to {OUTPUT_FILE}")

    categories = {}
    for p in projects:
        categories[p["category"]] = categories.get(p["category"], 0) + 1
        print(f"  {p['displayName']}: {len(p['screenshots'])} screenshots, {len(p['features'])} features")
    print("Categories:", ", ".join(f"{k}: {v}" for k, v in sorted(categories.items())))


if __name__ == "__main__":
    main()
