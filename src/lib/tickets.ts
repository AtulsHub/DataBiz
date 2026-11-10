import { createHash, randomBytes } from "crypto";
import QRCode from "qrcode";

/** Human-friendly ticket code for QR / door scan. */
export function createTicketCode() {
  const raw = randomBytes(5).toString("hex").toUpperCase();
  return `DBZ-${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/** Payload stored in the QR — scanners can paste this whole string or just the code. */
export function ticketQrPayload(ticketCode: string) {
  return `DATABIZ:${ticketCode}`;
}

export function parseTicketCode(input: string): string | null {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return null;
  const fromPayload = trimmed.match(/DBZ-[0-9A-F]{4}-[0-9A-F]{6}/);
  if (fromPayload) return fromPayload[0];
  if (/^DBZ-[0-9A-F]{4}-[0-9A-F]{6}$/.test(trimmed)) return trimmed;
  return null;
}

export async function ticketQrDataUrl(ticketCode: string) {
  return QRCode.toDataURL(ticketQrPayload(ticketCode), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
    color: {
      dark: "#111113",
      light: "#ffffff",
    },
  });
}

/** Stable secondary checksum shown on the card (not for auth). */
export function ticketChecksum(ticketCode: string) {
  return createHash("sha256")
    .update(ticketCode)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
}
