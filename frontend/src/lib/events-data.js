export const events = [{
  id: "maker-fair-2026",
  image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop",
  title: "Maker Fair 2026",
  date: "2026-07-04T10:00:00Z",
  endDate: "2026-07-08T18:00:00Z",
  location: "Main Hall, Building A",
  participants: 128,
  capacity: 250,
  shortDescription: "A multi-day celebration of makers, builders, and tinkerers from across the community.",
  description: "Maker Fair 2026 brings together hundreds of makers for five days of demos, hands-on workshops, lightning talks, and a community marketplace. Whether you build robots, sew costumes, weld furniture, or compose generative music — there is a space for you. Expect interactive booths, mentor office hours, a kids' zone, and an evening showcase.",
  tags: ["festival", "showcase", "all-ages"],
  author: { name: "Amelia Chen", role: "Community Lead", avatar: "https://i.pravatar.cc/120?img=47" }
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
  author: { name: "Devon Park", role: "Electronics Mentor", avatar: "https://i.pravatar.cc/120?img=12" }
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
  author: { name: "Priya Natarajan", role: "Robotics Captain", avatar: "https://i.pravatar.cc/120?img=32" }
}, {
  id: "intro-to-cad",
  image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=1200&auto=format&fit=crop",
  title: "Intro to Parametric CAD",
  date: "2026-07-02T17:00:00Z",
  location: "Design Studio",
  participants: 9,
  capacity: 20,
  shortDescription: "Get started with parametric modeling for 3D printing and CNC.",
  description: "A two-hour primer on parametric CAD using free tools. We build a parametric enclosure together — defining sketches, constraints, and design intent so your model stays clean when dimensions change. Bring a laptop.",
  tags: ["workshop", "cad", "beginner"],
  author: { name: "Marco Silva", role: "Fabrication Lead", avatar: "https://i.pravatar.cc/120?img=15" }
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
  author: { name: "Hana Yamamoto", role: "Soft Goods Mentor", avatar: "https://i.pravatar.cc/120?img=49" }
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
  author: { name: "Jordan Reyes", role: "Shop Steward", avatar: "https://i.pravatar.cc/120?img=22" }
}, {
  id: "pcb-design-sprint",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
  title: "PCB Design Sprint",
  date: "2026-07-18T10:00:00Z",
  location: "Electronics Lab",
  participants: 14,
  capacity: 20,
  shortDescription: "Go from schematic to fabrication-ready Gerbers in one Saturday session.",
  description: "Bring a circuit idea, leave with files ready for JLCPCB. We'll cover KiCad schematic capture, PCB layout rules, design-rule checks, and exporting Gerbers. Boards are group-ordered at the end — arrive with a simple design in mind.",
  tags: ["workshop", "pcb", "kicad"],
  author: { name: "Lin Park", role: "Electronics Mentor", avatar: "https://i.pravatar.cc/120?img=8" }
}, {
  id: "laser-cutting-intro",
  image: "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=1200&auto=format&fit=crop",
  title: "Laser Cutting Certification",
  date: "2026-07-22T14:00:00Z",
  location: "Fab Lab",
  participants: 7,
  capacity: 12,
  shortDescription: "Get certified on the 100W CO₂ laser cutter — required before solo use.",
  description: "Two-hour certification covering safety, material compatibility, vector file setup, speed/power settings, and kerf compensation. Pass the quiz at the end and you're cleared for solo sessions on the big laser. Acrylic and plywood stock provided.",
  tags: ["certification", "laser", "fabrication"],
  author: { name: "Marco Silva", role: "Fabrication Lead", avatar: "https://i.pravatar.cc/120?img=15" }
}, {
  id: "python-for-hardware",
  image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop",
  title: "Python for Hardware Hackers",
  date: "2026-07-25T15:00:00Z",
  location: "Code Room",
  participants: 30,
  capacity: 40,
  shortDescription: "MicroPython and CircuitPython on real hardware — no prior Python needed.",
  description: "We'll blink LEDs, read sensors, drive servos, and talk I²C — all from Python running directly on the microcontroller. Boards, breadboards, and components provided. You keep the hardware at the end.",
  tags: ["workshop", "python", "microcontroller", "beginner"],
  author: { name: "Sasha Rivera", role: "Software Mentor", avatar: "https://i.pravatar.cc/120?img=5" }
}, {
  id: "woodworking-joinery",
  image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop",
  title: "Joinery & Dovetails",
  date: "2026-08-02T10:00:00Z",
  location: "Wood Shop",
  participants: 6,
  capacity: 10,
  shortDescription: "Hand-cut joinery techniques for furniture makers and curious beginners.",
  description: "Learn to cut mortise-and-tenon joints and half-blind dovetails by hand. We'll cover marking gauges, chisels, saw technique, and fitting for a gap-free joint. Everyone leaves with a joined sample block. No power tools in this one.",
  tags: ["workshop", "woodworking", "traditional"],
  author: { name: "Cam Nguyen", role: "Wood Shop Lead", avatar: "https://i.pravatar.cc/120?img=60" }
}, {
  id: "drone-fpv-racing",
  image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&auto=format&fit=crop",
  title: "FPV Drone Racing Night",
  date: "2026-08-08T19:00:00Z",
  location: "Rooftop Track",
  participants: 35,
  capacity: 50,
  shortDescription: "Bring your quad or borrow one of ours and race the rooftop slalom course.",
  description: "Monthly FPV racing meetup on the rooftop obstacle course. Pilots of all skill levels welcome. Loaner 3-inch quads available (first-come). Sim practice recommended but not required. Crashes happen — bring spare props. Awards for fastest lap and best freestyle clip.",
  tags: ["competition", "drones", "fpv"],
  author: { name: "Kai Thorsen", role: "Drone Club Lead", avatar: "https://i.pravatar.cc/120?img=18" }
}, {
  id: "generative-art-night",
  image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  title: "Generative Art & Code Night",
  date: "2026-08-14T18:00:00Z",
  location: "Media Lab",
  participants: 20,
  capacity: 35,
  shortDescription: "p5.js, TouchDesigner, and pen plotters — an open creative coding session.",
  description: "Drop in, open a laptop, and make something weird. We'll have a short intro to p5.js for newcomers and a TouchDesigner patch to mess with on the projector. A AxiDraw pen plotter is set up if you want to plot your output on paper. No skill gate — curiosity is enough.",
  tags: ["creative-coding", "art", "open-session"],
  author: { name: "Bea Lorca", role: "Media Lab Resident", avatar: "https://i.pravatar.cc/120?img=44" }
}];

export function getEventById(id) {
  return events.find(e => e.id === id);
}

// Derived purely from the clock — "ongoing" means we're between the event's
// start and its end (events without an endDate are treated as instantaneous).
export function getEventStatus(event, now = new Date()) {
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : start;
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "ongoing";
}

export function formatEventDate(iso) {
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

// Compact "Jul 12, 2026" form for card badges — full date without the noise
// of weekday/time/timezone.
export function formatEventDateShort(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
