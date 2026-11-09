/** Format an ISO timestamp for <input type="datetime-local"> in Asia/Kolkata. */
export function toDatetimeLocalValue(iso: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date(iso))
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Parse datetime-local as Asia/Kolkata wall time. */
export function fromDatetimeLocalValue(value: string) {
  if (!value) return null;
  return new Date(`${value}:00+05:30`);
}
