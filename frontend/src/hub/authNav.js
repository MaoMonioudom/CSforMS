// Admin/Staff always land in the admin panel, Lecturers in their own panel —
// regardless of what page they clicked "Sign In" from, they're here to
// manage things, not to resume browsing. Everyone else returns to wherever
// they came from (`from`), or their profile if there's nowhere to return to.
export function destinationFor(role, from) {
  if (role === "Admin" || role === "Staff") return "/admin";
  if (role === "Lecturer") return "/lecturer";
  return from || "/profile";
}
