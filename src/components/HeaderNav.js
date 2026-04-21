"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";

export default function HeaderNav() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleLogout() {
    setBusy(true);
    await logout();
    setBusy(false);
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  }

  const NavLink = ({ href, children }) => {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={`rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
          active ? "bg-canvas-soft text-ink" : "text-ink-muted hover:text-ink hover:bg-canvas-soft"
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header
      id="site-header"
      className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md"
    >
      <div className="container-page flex items-center justify-between py-3.5">
        <Link href="/" className="group flex items-center gap-2.5" id="logo-link">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-ink text-canvas font-bold tracking-tight transition-transform group-hover:rotate-[-4deg]">
            B
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">BASERA</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-ink-subtle sm:inline">
              Srinagar · Garhwal
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" id="desktop-nav">
          <NavLink href="/rooms">Browse</NavLink>
          {user?.role === "owner" && <NavLink href="/dashboard">Dashboard</NavLink>}
          {ready && !user && (
            <>
              <NavLink href="/login">Login</NavLink>
              <Link href="/register" className="btn-accent ml-1">Sign up</Link>
            </>
          )}
          {user && (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-sm text-ink-muted lg:inline">
                Hi, <span className="font-semibold text-ink">{user.name?.split(" ")[0]}</span>
              </span>
              <button
                onClick={handleLogout}
                disabled={busy}
                className="btn-outline btn-sm"
                id="logout-btn"
              >
                {busy ? <span className="spinner" /> : "Logout"}
              </button>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-canvas-card text-ink hover:bg-canvas-soft"
          id="mobile-menu-btn"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <path d="M4 4l10 10" />
                <path d="M14 4L4 14" />
              </>
            ) : (
              <>
                <path d="M3 5h12" />
                <path d="M3 9h12" />
                <path d="M3 13h12" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden border-t border-line bg-canvas-card animate-slide-up" id="mobile-nav">
          <div className="container-page flex flex-col gap-1 py-3">
            <Link href="/rooms" className="rounded-[10px] px-3 py-2.5 text-sm font-medium hover:bg-canvas-soft">Browse rooms</Link>
            {user?.role === "owner" && (
              <Link href="/dashboard" className="rounded-[10px] px-3 py-2.5 text-sm font-medium hover:bg-canvas-soft">Dashboard</Link>
            )}
            {ready && !user && (
              <>
                <Link href="/login" className="rounded-[10px] px-3 py-2.5 text-sm font-medium hover:bg-canvas-soft">Login</Link>
                <Link href="/register" className="btn-accent w-full mt-1">Create account</Link>
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                disabled={busy}
                className="btn-outline w-full mt-1"
              >
                {busy ? <span className="spinner" /> : `Logout (${user.name?.split(" ")[0]})`}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
