#!/usr/bin/env python3
"""
Fetch public GitHub repos for ft-abhishekgupta and generate projects.json.

Uses the `gh` CLI to pull repo metadata, then enriches it with:
- Human-readable display names
- Project categories based on name/language/topics
"""

import json
import os
import subprocess
import sys
from pathlib import Path

GITHUB_USER = "ft-abhishekgupta"
SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = SCRIPT_DIR / "data" / "projects.json"

GH_FIELDS = "name,description,url,primaryLanguage,repositoryTopics,stargazerCount,updatedAt"

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
    """Convert a repo slug into a human-readable title."""
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


def fetch_repos() -> list[dict]:
    """Call `gh repo list` and return parsed JSON."""
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
    """Normalise raw gh output into the shape we want."""
    projects = []
    for repo in raw_repos:
        name = repo.get("name", "")
        lang = (repo.get("primaryLanguage") or {}).get("name", "")
        topics = [t.get("name", "") for t in (repo.get("repositoryTopics") or [])]

        projects.append({
            "name": name,
            "displayName": make_display_name(name),
            "description": repo.get("description") or "",
            "url": repo.get("url", ""),
            "language": lang,
            "topics": topics,
            "stars": repo.get("stargazerCount", 0),
            "updatedAt": repo.get("updatedAt", ""),
            "category": categorize(name, lang, topics),
        })

    projects.sort(key=lambda p: p["updatedAt"], reverse=True)
    return projects


def main():
    # Ensure output directory exists
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

    # Quick summary
    categories = {}
    for p in projects:
        categories[p["category"]] = categories.get(p["category"], 0) + 1
    print("Categories:", ", ".join(f"{k}: {v}" for k, v in sorted(categories.items())))


if __name__ == "__main__":
    main()
