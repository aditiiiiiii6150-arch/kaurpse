import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center" id="not-found">
      <p className="text-[120px] font-bold leading-none tracking-tighter text-accent-dark/20 sm:text-[160px]">
        404
      </p>
      <h1 className="-mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-ink-muted">
        The page you&apos;re looking for has either moved, been removed, or never existed.
        Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/rooms" className="btn-outline">Browse rooms</Link>
      </div>
    </div>
  );
}
