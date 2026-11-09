export type TeamMember = {
  name: string;
  roleTitle: string;
  bio: string;
  photoUrl?: string;
  sortOrder: number;
  isCurrent: boolean;
  yearLabel?: string;
};

/**
 * Public roster is empty until the core publishes names.
 * SPEC: do not invent a team roster.
 */
export const teamMembers: TeamMember[] = [];

export function getCurrentTeam() {
  return teamMembers
    .filter((m) => m.isCurrent)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
