"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  checkInByTicketCode,
  type CheckInResult,
} from "@/app/actions/events";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/forms/Field";
import { formatDateTime } from "@/lib/utils";

type Props = {
  eventId: string;
  eventTitle: string;
};

type HistoryItem = Extract<CheckInResult, { ok: true }> & { at: number };

export function CheckInScanner({ eventId, eventTitle }: Props) {
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cameraError, setCameraError] = useState<string | undefined>();
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function submitCode(raw: string) {
    const value = raw.trim();
    if (!value || pending) return;
    startTransition(async () => {
      const next = await checkInByTicketCode(value, eventId);
      setResult(next);
      if (next.ok) {
        setHistory((prev) => [{ ...next, at: Date.now() }, ...prev].slice(0, 12));
        setCode("");
      }
    });
  }

  async function startCamera() {
    setCameraError(undefined);
    if (!("BarcodeDetector" in window)) {
      setCameraError(
        "This browser cannot scan from the camera. Type or paste the ticket code instead.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Detector = (window as any).BarcodeDetector;
      const detector = new Detector({
        formats: ["qr_code"],
      });

      const tick = async () => {
        if (!streamRef.current || !videoRef.current) return;
        if (scanningRef.current || pending) {
          requestAnimationFrame(tick);
          return;
        }
        try {
          scanningRef.current = true;
          const codes = await detector.detect(videoRef.current);
          const raw = codes[0]?.rawValue as string | undefined;
          if (raw) {
            submitCode(raw);
            // brief pause so the same QR isn't double-scanned immediately
            await new Promise((r) => setTimeout(r, 1600));
          }
        } catch {
          // keep looping
        } finally {
          scanningRef.current = false;
          if (streamRef.current) requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    } catch {
      setCameraError("Could not open the camera. Allow permission or enter the code.");
      stopCamera();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-mute">
          Scanning for <strong className="text-ink">{eventTitle}</strong>. Point
          at the attendee&apos;s virtual ID QR, or type the ticket code.
        </p>
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          submitCode(code);
        }}
      >
        <Field id="ticket-code" label="Ticket code" className="flex-1">
          <input
            id="ticket-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="DBZ-XXXX-XXXXXX"
            autoComplete="off"
            className={inputClass}
            disabled={pending}
          />
        </Field>
        <Button
          type="submit"
          variant="ember"
          pending={pending}
          pendingLabel="Checking…"
        >
          Check in
        </Button>
      </form>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {!cameraOn ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => void startCamera()}>
              Open camera scanner
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={stopCamera}>
              Stop camera
            </Button>
          )}
        </div>
        {cameraError ? (
          <p className="text-sm text-danger" role="alert">
            {cameraError}
          </p>
        ) : null}
        {cameraOn ? (
          <video
            ref={videoRef}
            className="aspect-video w-full max-w-lg border border-line bg-void object-cover"
            muted
            playsInline
          />
        ) : null}
      </div>

      {result ? (
        <div
          className={
            result.ok
              ? result.alreadyCheckedIn
                ? "border border-line bg-paper-elevated px-4 py-3 text-sm"
                : "border border-ember/40 bg-ember/5 px-4 py-3 text-sm"
              : "border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
          }
          role="status"
        >
          {result.ok ? (
            <>
              <p className="font-medium text-ink">
                {result.alreadyCheckedIn ? "Already checked in" : "Checked in"}
                : {result.name}
              </p>
              <p className="mt-1 font-mono text-xs text-mute">
                {result.ticketCode} · {result.email} ·{" "}
                {formatDateTime(result.checkedInAt)}
              </p>
            </>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      ) : null}

      {history.length > 0 ? (
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute">
            Recent scans
          </p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {history.map((item) => (
              <li
                key={`${item.ticketCode}-${item.at}`}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm"
              >
                <span className="font-medium text-ink">{item.name}</span>
                <span className="font-mono text-xs text-mute">
                  {item.ticketCode}
                  {item.alreadyCheckedIn ? " · repeat" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
