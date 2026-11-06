// Tamil-inspired decorative SVG: title ornament.
// Pure SVG (no images) so they stay crisp and light at any size.

/** Small ornament used under section titles. */
export function TitleOrnament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 16" className={className} aria-hidden="true">
      <path d="M0 8 H44 M76 8 H120" stroke="#c79a3b" strokeWidth="1.2" />
      <path d="M60 1 L67 8 L60 15 L53 8 Z" fill="none" stroke="#c79a3b" strokeWidth="1.4" />
      <circle cx="60" cy="8" r="2.2" fill="#8e1b55" />
      <circle cx="48" cy="8" r="1.6" fill="#c79a3b" />
      <circle cx="72" cy="8" r="1.6" fill="#c79a3b" />
    </svg>
  );
}
