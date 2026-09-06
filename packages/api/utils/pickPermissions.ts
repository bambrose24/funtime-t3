export const isSuperAdminUser = (email?: string | null) =>
  email?.toLowerCase() === "bambrose24@gmail.com";

/** Kickoff itself is locked. Only explicit super-admin edits may bypass it. */
export const isPickLocked = (
  kickoff: Date,
  now: Date,
  overrideActorEmail?: string | null,
) => kickoff <= now && !isSuperAdminUser(overrideActorEmail);
