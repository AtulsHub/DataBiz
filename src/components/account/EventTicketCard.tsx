"use client";

import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { MyEventTicket } from "@/app/actions/account";
import { site } from "@/content/site";
import { formatDateTime } from "@/lib/utils";

type Props = {
  ticket: MyEventTicket;
};

const DRAG_X = 170;

export function EventTicketCard({ ticket }: Props) {
  const reduceMotion = useReducedMotion();
  const checkedIn = Boolean(ticket.checkedInAt) || ticket.status === "attended";
  const fullName = `${ticket.firstName} ${ticket.lastName}`.trim();
  const [flipped, setFlipped] = useState(false);

  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const originRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0, t: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const shellRef = useRef<HTMLDivElement>(null);

  const dragX = useMotionValue(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springX = useSpring(dragX, { stiffness: 140, damping: 14, mass: 1.05 });
  const rotateZ = useSpring(
    useTransform(springX, [-DRAG_X, DRAG_X], [-32, 32]),
    { stiffness: 120, damping: 12, mass: 1.15 },
  );
  const pullY = useSpring(
    useTransform(springX, (x) => Math.abs(x) * 0.08),
    { stiffness: 160, damping: 18 },
  );
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [8, -8]), {
    stiffness: 240,
    damping: 24,
  });
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 240,
    damping: 24,
  });

  // Cord bow follows swing so the string stays visually attached.
  const leftPath = useTransform(rotateZ, (deg) => {
    const bow = deg * 0.55;
    return `M 28 8 C ${48 + bow * 0.2} ${42} ${78 + bow} ${78} 100 108`;
  });
  const rightPath = useTransform(rotateZ, (deg) => {
    const bow = deg * 0.55;
    return `M 172 8 C ${152 + bow * 0.2} ${42} ${122 + bow} ${78} 100 108`;
  });

  const pendulumTransform = useMotionTemplate`translate3d(0, ${pullY}px, 0) rotateZ(${rotateZ}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    let raf = 0;
    const tick = () => {
      if (!draggingRef.current) {
        frame += 1;
        dragX.set(Math.sin(frame / 62) * 11);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragX, reduceMotion]);

  const updatePointerTilt = useCallback(
    (clientX: number, clientY: number) => {
      if (reduceMotion || !shellRef.current) return;
      const rect = shellRef.current.getBoundingClientRect();
      pointerX.set((clientX - rect.left) / rect.width - 0.5);
      pointerY.set((clientY - rect.top) / rect.height - 0.5);
    },
    [pointerX, pointerY, reduceMotion],
  );

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    dragX.set(clamp(velocityRef.current.x * 0.09, -DRAG_X * 0.6, DRAG_X * 0.6));

    window.setTimeout(() => {
      if (!draggingRef.current) dragX.set(0);
    }, 260);

    if (!movedRef.current) setFlipped((value) => !value);
  }, [dragX]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = event.clientX - originRef.current.x;
      const dy = event.clientY - originRef.current.y;
      if (Math.hypot(dx, dy) > 8) movedRef.current = true;

      const now = performance.now();
      const dt = Math.max(now - lastRef.current.t, 1);
      velocityRef.current = {
        x: ((dx - lastRef.current.x) / dt) * 1000,
        y: ((dy - lastRef.current.y) / dt) * 1000,
      };
      lastRef.current = { x: dx, y: dy, t: now };

      dragX.set(clamp(dx, -DRAG_X, DRAG_X));
      updatePointerTilt(event.clientX, event.clientY);
    };

    const onUp = () => endDrag();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragX, endDrag, updatePointerTilt]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    draggingRef.current = true;
    movedRef.current = false;
    originRef.current = { x: event.clientX, y: event.clientY };
    lastRef.current = { x: 0, y: 0, t: performance.now() };
    velocityRef.current = { x: 0, y: 0 };
    updatePointerTilt(event.clientX, event.clientY);
  };

  return (
    <div className="ticket-stage">
      <p className="ticket-stage__hint">
        Drag to swing · tap to flip
      </p>

      <div className="ticket-rig">
        {/* Fixed collar — the neck stay */}
        <div className="ticket-collar" aria-hidden>
          <span className="ticket-collar__band" />
        </div>

        {/* Everything below the collar swings together */}
        <motion.div
          ref={shellRef}
          className="ticket-pendulum"
          style={{ transform: pendulumTransform }}
          onPointerDown={onPointerDown}
          onPointerMove={(event) => {
            if (!draggingRef.current) {
              updatePointerTilt(event.clientX, event.clientY);
            }
          }}
          onPointerLeave={() => {
            if (!draggingRef.current) {
              pointerX.set(0);
              pointerY.set(0);
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={`Virtual ID for ${fullName}. Drag to swing, activate to flip.`}
          onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setFlipped((value) => !value);
            }
          }}
        >
          <svg
            className="ticket-cords"
            viewBox="0 0 200 118"
            aria-hidden
          >
            <defs>
              <linearGradient id="cordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7a5c" />
                <stop offset="55%" stopColor="#e8482e" />
                <stop offset="100%" stopColor="#9e2a18" />
              </linearGradient>
            </defs>
            <motion.path
              d={leftPath}
              fill="none"
              stroke="url(#cordGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <motion.path
              d={rightPath}
              fill="none"
              stroke="url(#cordGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Soft highlight edge */}
            <motion.path
              d={leftPath}
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.2"
              strokeLinecap="round"
              style={{ transform: "translateX(-1.2px)" }}
            />
            <motion.path
              d={rightPath}
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.2"
              strokeLinecap="round"
              style={{ transform: "translateX(1.2px)" }}
            />
          </svg>

          <div className="ticket-clip" aria-hidden>
            <span className="ticket-clip__ring" />
            <span className="ticket-clip__stem" />
          </div>

          <motion.div
            className="ticket-badge-flip"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 170, damping: 18 }
            }
          >
            <article className="ticket-badge ticket-badge--front">
              <span className="ticket-badge__hole" aria-hidden />
              <header className="ticket-badge__head">
                <div>
                  <p className="ticket-badge__eyebrow">Virtual ID</p>
                  <p className="ticket-badge__brand">{site.name}</p>
                  <p className="ticket-badge__college">{site.college}</p>
                </div>
                <p
                  className={
                    checkedIn
                      ? "ticket-badge__status ticket-badge__status--in"
                      : "ticket-badge__status"
                  }
                >
                  {checkedIn ? "Checked in" : "Show at door"}
                </p>
              </header>

              <div className="ticket-badge__body">
                <div>
                  <p className="ticket-badge__name">{fullName}</p>
                  <p className="ticket-badge__meta">
                    {ticket.year} · {ticket.branch}
                  </p>
                  <p className="ticket-badge__email">{ticket.email}</p>
                </div>

                <div className="ticket-badge__event">
                  <p className="ticket-badge__event-label">Event</p>
                  <h1 className="ticket-badge__event-title">
                    {ticket.event.title}
                  </h1>
                  <p className="ticket-badge__event-when">
                    {formatDateTime(ticket.event.startsAt)}
                    {ticket.event.venue ? ` · ${ticket.event.venue}` : null}
                  </p>
                </div>

                <div className="ticket-badge__qr-wrap">
                  <div className="ticket-badge__qr">
                    <Image
                      src={ticket.qrDataUrl}
                      alt={`QR code for ticket ${ticket.ticketCode}`}
                      width={220}
                      height={220}
                      unoptimized
                      draggable={false}
                      className="pointer-events-none size-full select-none"
                    />
                  </div>
                  <p className="ticket-badge__code">{ticket.ticketCode}</p>
                </div>
              </div>
            </article>

            <article
              className="ticket-badge ticket-badge--back"
              aria-hidden={!flipped}
            >
              <span className="ticket-badge__hole" />
              <div className="ticket-badge__back-inner">
                <p className="ticket-badge__eyebrow">Scan side</p>
                <p className="ticket-badge__brand">{site.name}</p>
                <div className="ticket-badge__qr ticket-badge__qr--lg">
                  <Image
                    src={ticket.qrDataUrl}
                    alt=""
                    width={260}
                    height={260}
                    unoptimized
                    draggable={false}
                    className="pointer-events-none size-full select-none"
                  />
                </div>
                <p className="ticket-badge__code">{ticket.ticketCode}</p>
                <p className="ticket-badge__check">check {ticket.checksum}</p>
                <p className="ticket-badge__foot">
                  {checkedIn
                    ? `Checked in ${
                        ticket.checkedInAt
                          ? formatDateTime(ticket.checkedInAt)
                          : "already"
                      }.`
                    : "Desk staff scan this QR (or type the code) to mark attendance."}
                </p>
              </div>
            </article>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
