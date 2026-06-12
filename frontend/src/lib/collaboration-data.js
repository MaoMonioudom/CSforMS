export const collabPosts = [{
  id: "ai-hackathon-team",
  type: "recruiting",
  projectTitle: "AI Hackathon Team",
  rolesNeeded: ["Frontend Developer", "ML Engineer"],
  category: "Competition",
  shortPitch: "Building an AI-powered study assistant for the upcoming National Hackathon 2026.",
  description: "We're a team of 3 prepping for the National AI Hackathon in August. The concept: an AI tutor that adapts to each student's learning pace using LLM fine-tuning + retrieval. We have a backend engineer and two ML folks — we need a strong frontend developer (React/Next experience) and one more ML engineer focused on RAG. Meetings twice a week, fully remote-friendly.",
  skills: ["React", "TypeScript", "Python", "LangChain", "PyTorch"],
  teamSize: {
    current: 3,
    target: 5
  },
  author: {
    name: "Moni Ratha",
    avatar: "https://i.pravatar.cc/150?img=12",
    year: "Year 3",
    major: "Computer Science"
  },
  contact: {
    email: "moni.ratha@example.edu",
    discord: "moni#4421",
    telegram: "@moniratha"
  },
  postedAt: "2026-06-02T10:00:00Z"
}, {
  id: "iot-greenhouse",
  type: "looking-for-team",
  projectTitle: "IoT Smart Greenhouse",
  rolesNeeded: ["Embedded Engineer", "Mobile Developer", "UI Designer"],
  category: "Class Project",
  shortPitch: "Looking to join a team building a smart greenhouse monitoring system for IoT class final.",
  description: "Solo for now — I have a Raspberry Pi + ESP32 sensors and a rough plan to monitor soil, humidity and light, syncing to a mobile app. Looking to join (or start) a 3–4 person team for the IoT final project. I can lead the hardware side. Open to either joining an existing team or forming a new one.",
  skills: ["C++", "MQTT", "React Native", "Figma"],
  teamSize: {
    current: 1,
    target: 4
  },
  author: {
    name: "Sophea Lim",
    avatar: "https://i.pravatar.cc/150?img=47",
    year: "Year 2",
    major: "Electrical Engineering"
  },
  contact: {
    email: "sophea.lim@example.edu",
    telegram: "@sopheal"
  },
  postedAt: "2026-06-01T15:30:00Z"
}, {
  id: "campus-events-app",
  type: "recruiting",
  projectTitle: "Campus Events Mobile App",
  rolesNeeded: ["iOS Developer", "Backend Developer"],
  category: "Startup",
  shortPitch: "Building the official-feeling unofficial campus events app. Looking for two co-founders.",
  description: "Prototype is live on Android (Flutter) and gaining ~200 weekly users. Validating monetization via paid event boosts. Need an iOS-savvy dev (Swift or shared Flutter) and a backend dev (Node/Postgres) to scale. Equity split for serious long-term collaborators.",
  skills: ["Flutter", "Swift", "Node.js", "PostgreSQL"],
  teamSize: {
    current: 2,
    target: 4
  },
  author: {
    name: "Dara Kong",
    avatar: "https://i.pravatar.cc/150?img=33",
    year: "Year 4",
    major: "Software Engineering"
  },
  contact: {
    email: "dara.kong@example.edu",
    discord: "darak#9912"
  },
  postedAt: "2026-05-30T09:15:00Z"
}, {
  id: "robotics-research",
  type: "recruiting",
  projectTitle: "Soft Robotics Research Assistant",
  rolesNeeded: ["Mechanical Engineer", "Computer Vision Engineer"],
  category: "Research",
  shortPitch: "Faculty-led research on soft grippers. Recruiting two undergrad assistants.",
  description: "Working under Prof. Chan on a pneumatic soft gripper that uses computer vision to adapt to fragile objects. Looking for one ME for fabrication (silicone molding, pneumatics) and one CV engineer (OpenCV / PyTorch) to work on grasp planning. ~10 hrs/week, paid stipend possible after first month.",
  skills: ["Solidworks", "OpenCV", "ROS", "PyTorch"],
  teamSize: {
    current: 2,
    target: 4
  },
  author: {
    name: "Prof. Linda Chan",
    avatar: "https://i.pravatar.cc/150?img=23",
    year: "Faculty",
    major: "Robotics Lab"
  },
  contact: {
    email: "l.chan@example.edu"
  },
  postedAt: "2026-05-28T12:00:00Z"
}, {
  id: "ux-portfolio-buddy",
  type: "looking-for-team",
  projectTitle: "UX Portfolio Project Partner",
  rolesNeeded: ["Frontend Developer"],
  category: "Personal Project",
  shortPitch: "Designer looking for a frontend dev to ship a real portfolio case study together.",
  description: "I'm a 3rd-year design student with 4 polished mockups (Figma prototypes ready). Want to partner with a frontend dev to turn one into a real, deployed product so we both get a strong case study. Project idea: a study-group matching tool for our campus. Time commit ~6 hrs/week for 6 weeks.",
  skills: ["Figma", "React", "Tailwind", "Framer Motion"],
  teamSize: {
    current: 1,
    target: 2
  },
  author: {
    name: "Nita Sok",
    avatar: "https://i.pravatar.cc/150?img=49",
    year: "Year 3",
    major: "UX Design"
  },
  contact: {
    email: "nita.sok@example.edu",
    telegram: "@nitasok"
  },
  postedAt: "2026-05-25T18:45:00Z"
}, {
  id: "game-jam-2026",
  type: "recruiting",
  projectTitle: "Global Game Jam 2026 Squad",
  rolesNeeded: ["2D Artist", "Sound Designer", "Unity Developer"],
  category: "Competition",
  shortPitch: "Forming a 4-person team for the 48-hour Global Game Jam in July.",
  description: "Done two jams before, placed top 10 last year. We have one Unity dev (me) committed. Looking for a 2D artist (pixel or vector), a sound/music person, and one more Unity dev with shader experience. Vibes-based collab — we eat pizza, sleep on couches, ship a game.",
  skills: ["Unity", "C#", "Aseprite", "FMOD"],
  teamSize: {
    current: 1,
    target: 4
  },
  author: {
    name: "Vibol Heng",
    avatar: "https://i.pravatar.cc/150?img=14",
    year: "Year 2",
    major: "Game Development"
  },
  contact: {
    email: "vibol.heng@example.edu",
    discord: "vibol#0007"
  },
  postedAt: "2026-05-22T20:00:00Z"
}];
export function getCollabPostById(id) {
  return collabPosts.find(p => p.id === id);
}
export function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  const now = new Date("2026-06-04T00:00:00Z").getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
export const collabTypeLabel = {
  "looking-for-team": "Looking for Team",
  recruiting: "Recruiting Teammates"
};
export const collabTypeEmoji = {
  "looking-for-team": "🙋",
  recruiting: "🤝"
};
