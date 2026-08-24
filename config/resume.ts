export const profile = {
  name: "Abhishek Gupta",
  headline: "Software Engineer",
  roles: [
    "Full-Stack Engineer",
    "Distributed Systems",
    "Azure Cloud Architecture",
    "AI Engineering",
  ],
  summary:
    "I build systems that stay up. 6+ years at Microsoft Xbox owning distributed services, cloud infrastructure and the products on top of them, end to end.",
  location: "Noida, India",
  email: "ft.abhishekgupta@gmail.com",
  photo: "/profile-photo.jpg",
  photoWebp: "/profile-photo.webp",
  resumeUrl: "/Abhishek-Gupta-Resume.pdf",
};

export const credentials = [
  { value: "Microsoft", label: "Xbox" },
  { value: "6+ years", label: "Experience" },
  { value: "Tech Lead", label: "Xbox Services" },
  { value: "M.Tech", label: "IIT Kanpur" },
];

export interface Tech {
  name: string;
  slug: string;
  color: string;
}

export const techStack: Tech[] = [
  { name: "C#", slug: "csharp", color: "#A179DC" },
  { name: ".NET", slug: "dotnet", color: "#7C5CFF" },
  { name: "TypeScript", slug: "typescript", color: "#3178C6" },
  { name: "JavaScript", slug: "javascript", color: "#F7DF1E" },
  { name: "Node.js", slug: "nodedotjs", color: "#5FA04E" },
  { name: "React", slug: "react", color: "#61DAFB" },
  { name: "Python", slug: "python", color: "#4B8BBE" },
  { name: "Azure", slug: "microsoftazure", color: "#3AA0F3" },
  { name: "SQL Server", slug: "microsoftsqlserver", color: "#EE352C" },
  { name: "Redis", slug: "redis", color: "#FF6155" },
  { name: "Kubernetes", slug: "kubernetes", color: "#5B87E8" },
  { name: "Docker", slug: "docker", color: "#2496ED" },
  { name: "Terraform", slug: "terraform", color: "#A277EE" },
  { name: "Azure AI", slug: "openai", color: "#E8E8E8" },
  { name: "MCP", slug: "modelcontextprotocol", color: "#D4D4D8" },
  { name: "Git", slug: "git", color: "#F05032" },
];

export interface SkillGroup {
  title: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend & Architecture",
    items: [
      "Distributed Systems",
      "System Design",
      "Microservices",
      "Event-Driven Architecture",
      "REST APIs",
      "Message Queues",
      "Data Modeling & Partitioning",
      "Caching & Idempotency",
    ],
  },
  {
    title: "Cloud & Data",
    items: [
      "Azure",
      "Cosmos DB (NoSQL)",
      "SQL Server",
      "Redis",
      "Service Bus",
      "Event Hubs",
      "AKS (Kubernetes)",
      "Docker",
    ],
  },
  {
    title: "Languages & Frameworks",
    items: [
      "C# / .NET Core",
      "ASP.NET Core",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "React",
      "Python",
      "SQL",
    ],
  },
  {
    title: "Reliability & DevOps",
    items: [
      "SLO / SLA",
      "Observability",
      "Live-Site & On-Call",
      "Incident Management",
      "CI/CD (Azure DevOps)",
      "Terraform (IaC)",
      "Unit & Integration Testing",
    ],
  },
  {
    title: "Security & Identity",
    items: [
      "OAuth 2.0",
      "RBAC",
      "JIT Access",
      "Managed Identity",
      "Service-to-Service Auth",
      "CVE Remediation",
    ],
  },
  {
    title: "AI Engineering",
    items: [
      "AI Agents & Agentic Development",
      "MCP",
      "Tool Calling",
      "Embeddings & RAG",
      "Vector Search",
    ],
  },
];

export interface TimelineEntry {
  kind: "work" | "education";
  role: string;
  org: string;
  meta?: string;
  period: string;
  location?: string;
  points: string[];
  tags?: string[];
}

export const timeline: TimelineEntry[] = [
  {
    kind: "work",
    role: "Software Engineer II · Technical Lead",
    org: "Microsoft : Xbox Services",
    period: "Sep 2022 - Present",
    location: "Noida, India",
    points: [
      "Lead the team behind a publisher news feed platform that consolidated a fleet of legacy systems into one high-availability service delivering content across Xbox storefronts.",
      "Re-platformed core read paths onto Azure Cosmos DB with a redesigned partitioning and caching strategy, substantially cutting latency and downstream load through zero-downtime cutovers.",
      "Designed an event-driven content certification pipeline — idempotent messaging with retries and dead-lettering — that replaced a slow manual review step, including the AI moderation layer for text, images and video and similarity detection built on Azure AI Search embeddings.",
      "Created and led an internal developer productivity platform: a suite of debugging and operations tools behind RBAC and just-in-time access, adopted widely across engineering teams.",
      "Hardened platform security by replacing shared-key authentication with a Managed Identity Terraform module, and drove component-governance and CVE remediation across the service estate.",
    ],
    tags: [
      "C# / .NET",
      "Cosmos DB",
      "Redis",
      "Service Bus",
      "Azure AI",
      "React",
      "Terraform",
    ],
  },
  {
    kind: "work",
    role: "Software Engineer",
    org: "Microsoft : Xbox Services",
    period: "Jun 2020 - Sep 2022",
    location: "Noida, India",
    points: [
      "Built and owned the React sales-authoring application and its backing APIs for offer modeling, discounts and pricing campaigns used to run commerce promotions.",
      "Owned the publisher-portal metadata ingestion platform from React UI through .NET via a pluggable processor model, powering daily game publishes across Xbox storefronts.",
      "Spearheaded a decoupled UI deployment architecture on Azure with independent CI/CD, adopted as a standard across sibling products.",
    ],
    tags: ["React", "TypeScript", "ASP.NET Core", "Azure", "Azure DevOps"],
  },
  {
    kind: "education",
    role: "M.Tech, Computer Science & Engineering",
    org: "IIT Kanpur",
    meta: "9.7 CGPA",
    period: "2018 - 2020",
    points: ["Academic Excellence Award · GATE 2018 : AIR 323 (top 0.3%)."],
  },
  {
    kind: "education",
    role: "B.Tech, Computer Science & Engineering",
    org: "IET Lucknow, AKTU",
    meta: "82%",
    period: "2014 - 2018",
    points: ["TCS CodeVita 2017 : AIR 145 of 99,473."],
  },
];

export interface Highlight {
  title: string;
  role: string;
  blurb: string;
  metric: string;
  tags: string[];
  href?: string;
}

/**
 * Hand-picked personal projects. Copy/metadata mirrors scripts/data/projects.json
 * (regenerated by scripts/getProjects.py) — the /projects page lists everything.
 */
export const highlights: Highlight[] = [
  {
    title: "TheTodoApp - Productivity Suite",
    role: "Web · Next.js",
    blurb:
      "Tasks, habits, Pomodoro and projects in one dashboard, recurring schedules, streak heatmaps and completion analytics.",
    metric: "Live app",
    tags: ["Next.js", "React", "Firebase"],
    href: "https://ft-abhishekgupta.github.io/the-todo-app/",
  },
  {
    title: "PharmWare - Pharmacy Inventory",
    role: "Android · Java",
    blurb:
      "Complete pharmacy inventory management system with billing, stock control and customer tracking.",
    metric: "31 ★ on GitHub",
    tags: ["Java", "Android", "SQLite"],
    href: "https://github.com/ft-abhishekgupta/android-pharmacy-inventory-system-pharmware",
  },
  {
    title: "Online Quiz Portal",
    role: "Web · PHP",
    blurb:
      "Quiz platform with randomised question generation, user management and score tracking.",
    metric: "7 ★ on GitHub",
    tags: ["PHP", "MySQL", "JavaScript"],
    href: "https://github.com/ft-abhishekgupta/php-mysql-onlinequizportal",
  },
  {
    title: "Ethereum Voting DApp",
    role: "Blockchain · Solidity",
    blurb:
      "Decentralised voting system running on Ethereum smart contracts with a web3 front end.",
    metric: "Smart contracts",
    tags: ["Solidity", "Web3", "Ethereum"],
    href: "https://github.com/ft-abhishekgupta/ethereum-dapp-votingsystem",
  },
  {
    title: "Linkr - Social Network App",
    role: "Android · Java",
    blurb:
      "A full-featured social networking app with real-time messaging, posts and user profiles.",
    metric: "Real-time chat",
    tags: ["Java", "Android", "Firebase"],
    href: "https://github.com/ft-abhishekgupta/android-socialnetwork-linkr",
  },
  {
    title: "Java Swing Games",
    role: "Desktop · Java",
    blurb:
      "Chess, Tetris, Sudoku, Snake & Ladders and more, classic games rebuilt from scratch in Java Swing.",
    metric: "7 classic games",
    tags: ["Java", "Swing", "Game loops"],
    href: "https://github.com/ft-abhishekgupta/java-swing-games",
  },
];

export const achievements = [
  "2× Microsoft Impact Award",
  "NexusHub : Xbox Hackathon Winner 2026",
  "GATE 2018 : AIR 323",
  "CodeVita 2017 : AIR 145",
  "Cultural V-Team Champion, Xbox IDC",
];
