// Shown instantly while a page is loading, so taps feel immediate.
export default function Loading() {
  return (
    <div className="container-x py-12" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-8 w-56 animate-pulse rounded bg-sand/70" />
      <div className="mx-auto mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-sand/50" />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-pulse rounded-lg bg-sand/60" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-sand/50" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-sand/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
