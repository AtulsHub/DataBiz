"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const NetworkField = dynamic(
  () => import("./NetworkField").then((m) => m.NetworkField),
  { ssr: false },
);

/** Skip WebGL when the visitor prefers reduced motion. */
export function NetworkFieldLazy() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOk(!reduce);
  }, []);

  if (!ok) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 40%, var(--glow), transparent 45%)",
        }}
      />
    );
  }

  return <NetworkField />;
}
