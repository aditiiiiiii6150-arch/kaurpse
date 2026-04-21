import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/* Scrolls window to top on every route change AND renders a floating
   "back to top" button once the user has scrolled meaningfully. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-ink text-canvas shadow-lift
        transition-all duration-300 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        hover:-translate-y-0.5 hover:bg-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50`}
      data-testid="scroll-to-top"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 13V3M3 8l5-5 5 5" />
      </svg>
    </button>
  );
}
