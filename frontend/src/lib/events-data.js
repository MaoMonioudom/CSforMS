export const events = [{
  id: "maker-fair-2026",
  image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop",
  title: "Maker Fair 2026",
  date: "2026-07-12T10:00:00Z",
  location: "Main Hall, Building A",
  participants: 128,
  capacity: 250,
  shortDescription: "A full-day celebration of makers, builders, and tinkerers from across the community.",
  description: "Maker Fair 2026 brings together hundreds of makers for a day of demos, hands-on workshops, lightning talks, and a community marketplace. Whether you build robots, sew costumes, weld furniture, or compose generative music — there is a space for you. Expect interactive booths, mentor office hours, a kids' zone, and an evening showcase.",
  tags: ["festival", "showcase", "all-ages"],
  author: {
    name: "Amelia Chen",
    role: "Community Lead",
    avatar: "https://i.pravatar.cc/120?img=47"
  }
}, {
  id: "soldering-bootcamp",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
  title: "Soldering Bootcamp",
  date: "2026-06-20T14:00:00Z",
  location: "Electronics Lab",
  participants: 18,
  capacity: 24,
  shortDescription: "Hands-on workshop covering through-hole and surface-mount soldering fundamentals.",
  description: "Spend an afternoon learning to solder like a pro. We cover iron care, flux, through-hole joints, surface-mount reflow, and rework. Every attendee leaves with a working blinky badge they built themselves. Tools and components provided.",
  tags: ["workshop", "electronics", "beginner"],
  author: {
    name: "Devon Park",
    role: "Electronics Mentor",
    avatar: "https://i.pravatar.cc/120?img=12"
  }
}, {
  id: "robot-sumo-night",
  image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&auto=format&fit=crop",
  title: "Robot Sumo Night",
  date: "2026-06-28T18:30:00Z",
  location: "Arena, Building B",
  participants: 42,
  capacity: 60,
  shortDescription: "Friendly competition for autonomous mini-bots. Bring a bot or come cheer.",
  description: "Our quarterly sumo competition is back. Build a sub-500g autonomous robot and push opponents out of the ring. Open to all skill levels — mentors on hand to help with last-minute tuning. Pizza and trophies for everyone.",
  tags: ["competition", "robotics"],
  author: {
    name: "Priya Natarajan",
    role: "Robotics Captain",
    avatar: "https://i.pravatar.cc/120?img=32"
  }
}, {
  id: "intro-to-cad",
  image: "https://images.unsplash.com/photo-1581090700227-4c4f50b6e5e0?w=1200&auto=format&fit=crop",
  title: "Intro to Parametric CAD",
  date: "2026-07-02T17:00:00Z",
  location: "Design Studio",
  participants: 9,
  capacity: 20,
  shortDescription: "Get started with parametric modeling for 3D printing and CNC.",
  description: "A two-hour primer on parametric CAD using free tools. We build a parametric enclosure together — defining sketches, constraints, and design intent so your model stays clean when dimensions change. Bring a laptop.",
  tags: ["workshop", "cad", "beginner"],
  author: {
    name: "Marco Silva",
    role: "Fabrication Lead",
    avatar: "https://i.pravatar.cc/120?img=15"
  }
}, {
  id: "textile-circuits",
  image: "https://images.unsplash.com/photo-1558174685-430919a96c8d?w=1200&auto=format&fit=crop",
  title: "Textile Circuits Workshop",
  date: "2026-07-09T13:00:00Z",
  location: "Soft Lab",
  participants: 11,
  capacity: 16,
  shortDescription: "Sew conductive thread, attach LEDs, and code a wearable badge.",
  description: "Explore the intersection of textiles and electronics. We pattern, sew, and program a soft circuit badge using conductive thread and a tiny microcontroller. No sewing experience required.",
  tags: ["workshop", "wearables", "soft-circuits"],
  author: {
    name: "Hana Yamamoto",
    role: "Soft Goods Mentor",
    avatar: "https://i.pravatar.cc/120?img=49"
  }
}, {
  id: "open-shop-friday",
  image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1200&auto=format&fit=crop",
  title: "Open Shop Friday",
  date: "2026-06-13T16:00:00Z",
  location: "Wood + Metal Shop",
  participants: 22,
  capacity: 40,
  shortDescription: "Drop in, use the tools, get help from staff on whatever you're building.",
  description: "Every Friday afternoon the shop is open for members to work on personal projects. Staff are on hand to answer questions, demo machines, and help you plan your build. Snacks provided.",
  tags: ["open-shop", "weekly", "community"],
  author: {
    name: "Jordan Reyes",
    role: "Shop Steward",
    avatar: "https://i.pravatar.cc/120?img=22"
  }
}];
export function getEventById(id) {
  return events.find(e => e.id === id);
}
export function formatEventDate(iso) {
  // Use fixed UTC formatting to avoid SSR/client hydration mismatches
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short"
  });
}
