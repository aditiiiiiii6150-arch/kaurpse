import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count: savedCount } = useFavorites();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const linkBase = 'rounded-full px-3 py-2 text-sm font-medium transition-colors';
  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? 'bg-canvas-soft text-ink' : 'text-ink-muted hover:text-ink hover:bg-canvas-soft'}`;

  const HeartIcon = ({ filled }) => (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  return (
    <header
      id="site-header"
      className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md"
    >
      <div className="page-container !py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5" data-testid="navbar-logo">
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-ink text-canvas font-display font-bold tracking-tight transition-transform group-hover:rotate-[-6deg]">
            B
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-canvas" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold tracking-tight">BASERA</span>
            <span className="hidden font-hand text-[13px] text-accent-dark sm:inline -mt-0.5">
              from Srinagar, Garhwal
            </span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-1" id="desktop-nav">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/listings" className={navLinkClass}>Listings</NavLink>

          {user?.role === 'owner' && (
            <>
              <NavLink to="/add-listing" className={navLinkClass}>+ List Room</NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
            </>
          )}

          {/* Saved */}
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `${linkBase} relative inline-flex items-center gap-1.5 ${isActive ? 'bg-canvas-soft text-ink' : 'text-ink-muted hover:text-ink hover:bg-canvas-soft'}`
            }
            data-testid="nav-saved"
          >
            <HeartIcon filled={savedCount > 0} />
            <span className="hidden lg:inline">Saved</span>
            {savedCount > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-ink">
                {savedCount}
              </span>
            )}
          </NavLink>

          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-sm text-ink-muted lg:inline">
                Hi, <span className="font-semibold text-ink">{user.name?.split(' ')[0]}</span>
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary !px-3.5 !py-2"
                data-testid="logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="ml-1 flex items-center gap-1">
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <Link to="/register" className="btn-accent !px-4 !py-2">Sign up</Link>
            </div>
          )}
        </nav>

        {/* Mobile actions: saved + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            to="/saved"
            aria-label="Saved rooms"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas-card text-ink hover:bg-canvas-soft"
          >
            <HeartIcon filled={savedCount > 0} />
            {savedCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink ring-2 ring-canvas">
                {savedCount}
              </span>
            )}
          </Link>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas-card text-ink hover:bg-canvas-soft"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
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
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-line bg-canvas-card animate-slide-up" id="mobile-nav">
          <div className="page-container !py-3 flex flex-col gap-1">
            <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? 'bg-canvas-soft' : 'hover:bg-canvas-soft'}`}>Home</NavLink>
            <NavLink to="/listings" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-canvas-soft' : 'hover:bg-canvas-soft'}`}>Browse listings</NavLink>
            <NavLink to="/saved" className={({ isActive }) => `${linkBase} flex items-center justify-between ${isActive ? 'bg-canvas-soft' : 'hover:bg-canvas-soft'}`}>
              Saved rooms
              {savedCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-ink">
                  {savedCount}
                </span>
              )}
            </NavLink>
            {user?.role === 'owner' && (
              <>
                <NavLink to="/add-listing" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-canvas-soft' : 'hover:bg-canvas-soft'}`}>+ List Room</NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-canvas-soft' : 'hover:bg-canvas-soft'}`}>Dashboard</NavLink>
              </>
            )}
            <div className="border-t border-line mt-2 pt-2">
              {user ? (
                <button onClick={handleLogout} className="btn-secondary w-full">
                  Logout ({user.name?.split(' ')[0]})
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn-secondary flex-1">Login</Link>
                  <Link to="/register" className="btn-accent flex-1">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
