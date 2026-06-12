const avatar = seed => `https://i.pravatar.cc/120?u=${seed}`;
export const communityPosts = [{
  id: "esp32-deep-sleep-tips",
  category: "Technical",
  author: {
    name: "Moni Chen",
    handle: "@moni",
    avatar: avatar("moni")
  },
  title: "ESP32 deep sleep is eating my battery — what am I missing?",
  body: "I've got an ESP32 running on an 18650 cell. Even in deep sleep it draws ~2mA which kills it in days. Disconnected the onboard LED, using ext0 wake on a single GPIO. Anyone here pushed it under 50µA? Would love wiring photos.",
  tags: ["esp32", "low-power", "hardware"],
  likes: 42,
  comments: [{
    id: "c1",
    author: {
      name: "Lin Park",
      avatar: avatar("lin")
    },
    body: "Most dev boards have a CP2102 / CH340 that leaks current. Cut the trace or solder onto a bare ESP32-WROOM module.",
    postedAt: "2026-06-03T10:12:00Z"
  }, {
    id: "c2",
    author: {
      name: "Sasha R.",
      avatar: avatar("sasha")
    },
    body: "Also check your voltage regulator — AMS1117 has ~5mA quiescent. Swap for an HT7333.",
    postedAt: "2026-06-03T13:40:00Z"
  }],
  postedAt: "2026-06-03T09:00:00Z"
}, {
  id: "first-3d-print-success",
  category: "Showcase",
  author: {
    name: "Jules Wong",
    handle: "@jules",
    avatar: avatar("jules")
  },
  body: "First print off the new Bambu came out clean 🎉 Tiny articulated dragon for my niece. Took 4 tries last week on my old Ender — what a difference.",
  image: "https://images.unsplash.com/photo-1631562543529-39d8c5b9bb2c?w=1200&q=80",
  tags: ["3d-printing", "show-and-tell"],
  likes: 128,
  comments: [{
    id: "c1",
    author: {
      name: "Devi K.",
      avatar: avatar("devi")
    },
    body: "Looks crispy! What filament?",
    postedAt: "2026-06-02T18:22:00Z"
  }],
  postedAt: "2026-06-02T17:00:00Z"
}, {
  id: "coffee-after-workshop",
  category: "Social",
  author: {
    name: "Ahmed Q.",
    handle: "@ahmedq",
    avatar: avatar("ahmed")
  },
  body: "Anyone want to grab coffee after Friday's soldering workshop? Thinking the cafe across the street around 5pm. First round on me if you bring a project to show ☕",
  tags: ["meetup", "coffee"],
  likes: 19,
  comments: [],
  postedAt: "2026-06-01T20:45:00Z"
}, {
  id: "kicad-vs-easyeda",
  category: "Question",
  author: {
    name: "Priya N.",
    handle: "@priya",
    avatar: avatar("priya")
  },
  title: "KiCad vs EasyEDA in 2026 — which would you pick today?",
  body: "Starting on my first custom PCB (just a small sensor breakout). I've heard KiCad 8 is much friendlier now but EasyEDA's JLCPCB integration sounds tempting. What's your honest take?",
  tags: ["pcb", "kicad", "easyeda"],
  likes: 67,
  comments: [{
    id: "c1",
    author: {
      name: "Ren M.",
      avatar: avatar("ren")
    },
    body: "KiCad. You'll outgrow EasyEDA the moment you need decent library management.",
    postedAt: "2026-05-31T11:05:00Z"
  }, {
    id: "c2",
    author: {
      name: "Bea L.",
      avatar: avatar("bea")
    },
    body: "Disagree — for a single sensor board EasyEDA + JLC is the fastest path from idea to held-in-hand.",
    postedAt: "2026-05-31T14:18:00Z"
  }],
  postedAt: "2026-05-31T10:00:00Z"
}, {
  id: "makerspace-pizza-night",
  category: "Announcement",
  author: {
    name: "Makerspace Crew",
    handle: "@crew",
    avatar: avatar("crew")
  },
  title: "Pizza + demo night, Thursday 7pm",
  body: "Bring a project, grab a slice. No agenda, just hanging out and showing off whatever weird thing you've been working on. RSVP not required but appreciated 🍕",
  tags: ["announcement", "social"],
  likes: 88,
  comments: [],
  postedAt: "2026-05-30T15:00:00Z"
}, {
  id: "raspi-camera-glitch",
  category: "Technical",
  author: {
    name: "Theo G.",
    handle: "@theo",
    avatar: avatar("theo")
  },
  title: "Pi Camera v3 randomly drops frames after ~30 min — anyone seen this?",
  body: "Running libcamera-vid with H.264 hardware encode. Works perfectly for half an hour, then frame rate tanks and dmesg shows nothing useful. Heatsink is fine, CPU under 50°C. Stumped.",
  tags: ["raspberry-pi", "camera", "linux"],
  likes: 24,
  comments: [{
    id: "c1",
    author: {
      name: "Ivy S.",
      avatar: avatar("ivy")
    },
    body: "Check the CSI cable — mine acts identical when the ribbon flexes under thermal expansion. Re-seat it.",
    postedAt: "2026-05-29T16:30:00Z"
  }],
  postedAt: "2026-05-29T15:00:00Z"
}];
export const categoryEmoji = {
  Technical: "🔧",
  Social: "☕",
  Showcase: "✨",
  Question: "❓",
  Announcement: "📣"
};
export function getCommunityPostById(id) {
  return communityPosts.find(p => p.id === id);
}
export function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const wks = Math.floor(days / 7);
  return `${wks}w ago`;
}
