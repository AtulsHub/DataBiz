"use client";

/**
 * Soft animated atmosphere for the light (and dark) site shell.
 * Respects prefers-reduced-motion via CSS.
 */
export function AmbientField() {
  return (
    <div
      className="ambient-field pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="ambient-grid" />
      <div className="ambient-sheen" />
    </div>
  );
}
