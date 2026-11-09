export type AlumniProfile = {
  slug: string;
  name: string;
  batch: number;
  branch: string;
  societyRole: string;
  currentTitle: string;
  organization: string;
  linkedinUrl?: string;
  note?: string;
  status: "pending" | "published";
  sortOrder: number;
};

/** Alumni list stays empty until the core publishes profiles. */
export const alumniProfiles: AlumniProfile[] = [];

