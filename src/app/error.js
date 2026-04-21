"use client";
import Link from "next/link";

export default function Error({ reset }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600 text-2xl font-bold">!</div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-ink-muted">An unexpected error occurred. You can retry or head back home.</p>
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={() => reset()} className="btn-primary">Retry</button>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  );
}
