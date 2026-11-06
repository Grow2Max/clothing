// Product page placeholder: gallery on the left, details on the right.
export default function Loading() {
  return (
    <div className="container-x grid gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-12" aria-busy="true" aria-label="Loading">
      <div className="aspect-[3/4] w-full animate-pulse rounded-lg bg-sand/60" />
      <div>
        <div className="h-9 w-3/4 animate-pulse rounded bg-sand/70" />
        <div className="mt-4 h-6 w-28 animate-pulse rounded bg-sand/60" />
        <div className="mt-8 h-11 w-28 animate-pulse rounded bg-sand/50" />
        <div className="mt-6 h-12 w-48 animate-pulse rounded-full bg-sand/60" />
        <div className="mt-10 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-sand/40" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-sand/40" />
        </div>
      </div>
    </div>
  );
}
