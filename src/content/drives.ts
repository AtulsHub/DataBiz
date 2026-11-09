export type Drive = {
  slug: string;
  title: string;
  description: string;
  opensAt: string;
  closesAt: string;
  status: "draft" | "open" | "closed";
  roles: { name: string; description: string }[];
};

/** No invented open drive — recruiting block appears only when status is open. */
export const drives: Drive[] = [];

export function getOpenDrive(now = new Date()) {
  return (
    drives.find(
      (d) =>
        d.status === "open" &&
        new Date(d.opensAt) <= now &&
        new Date(d.closesAt) >= now,
    ) ?? null
  );
}
