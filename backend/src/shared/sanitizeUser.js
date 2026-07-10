export function toPublicUser(row) {
  if (!row) return row;
  const { password_hash, ...rest } = row;
  return rest;
}
