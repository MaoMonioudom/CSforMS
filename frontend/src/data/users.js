/**
 * Demo user accounts — there's no backend/database yet, so these are
 * seed accounts checked client-side. Admin-created lecturers are stored
 * separately via userStore's localStorage overlay.
 */
export const ROLES = { ADMIN: "admin", LECTURER: "lecturer" };

export const SEED_USERS = [
  {
    id: "admin-1",
    name: "Site Admin",
    email: "admin@makerspace.edu",
    password: "admin123",
    role: ROLES.ADMIN,
    active: true,
  },
  {
    id: "lect-1",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@makerspace.edu",
    password: "lecturer123",
    role: ROLES.LECTURER,
    active: true,
  },
  {
    id: "lect-2",
    name: "Prof. Marcus Webb",
    email: "marcus.webb@makerspace.edu",
    password: "lecturer123",
    role: ROLES.LECTURER,
    active: true,
  },
  {
    id: "lect-3",
    name: "Lena Müller",
    email: "lena.muller@makerspace.edu",
    password: "lecturer123",
    role: ROLES.LECTURER,
    active: true,
  },
  {
    id: "lect-4",
    name: "Dr. Aiko Tanaka",
    email: "aiko.tanaka@makerspace.edu",
    password: "lecturer123",
    role: ROLES.LECTURER,
    active: true,
  },
  {
    id: "lect-5",
    name: "Thomas Bright",
    email: "thomas.bright@makerspace.edu",
    password: "lecturer123",
    role: ROLES.LECTURER,
    active: true,
  },
  {
    id: "lect-6",
    name: "Priya Nair",
    email: "priya.nair@makerspace.edu",
    password: "lecturer123",
    role: ROLES.LECTURER,
    active: true,
  },
  {
    id: "lect-7",
    name: "Marco Villanueva",
    email: "marco.villanueva@makerspace.edu",
    password: "lecturer123",
    role: ROLES.LECTURER,
    active: true,
  },
];
