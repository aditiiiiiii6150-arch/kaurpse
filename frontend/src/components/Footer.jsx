import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="site-footer" className="mt-20 border-t border-line bg-canvas-soft/60">
      <div className="page-container py-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-ink text-canvas font-bold">B</span>
              <span className="text-base font-bold tracking-tight">BASERA</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              A calm way to find rooms, PGs &amp; flats in Srinagar (Garhwal). Made for students &amp; owners.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/listings" className="text-ink hover:text-accent-dark">Browse rooms</Link></li>
              <li><Link to="/register" className="text-ink hover:text-accent-dark">List your room</Link></li>
              <li><Link to="/dashboard" className="text-ink hover:text-accent-dark">Owner dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Stay safe</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li>Always inspect before paying.</li>
              <li>Never share OTPs with owners.</li>
              <li>Prefer in-person token deposits.</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-ink-subtle md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} BASERA — built with care for Srinagar.</p>
          <p>Designed minimally · Listings updated daily</p>
        </div>
      </div>
    </footer>
  );
}
