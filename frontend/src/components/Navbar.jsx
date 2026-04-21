import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const linkBase = 'rounded-[10px] px-3 py-2 text-sm font-medium transition-colors';
  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? 'bg-canvas-soft text-ink' : 'text-ink-muted hover:text-ink hover:bg-canvas-soft'}`;

  return (
    <header
      id="site-header"
      className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md"
    >
      <div className="page-container !py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5" data-testid="navbar-logo">
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-canvas-card text-ink hover:bg-canvas-soft"
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

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-line bg-canvas-card animate-slide-up" id="mobile-nav">
          <div className="page-container !py-3 flex flex-col gap-1">
            <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? 'bg-canvas-soft' : 'hover:bg-canvas-soft'}`}>Home</NavLink>
            <NavLink to="/listings" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-canvas-soft' : 'hover:bg-canvas-soft'}`}>Browse listings</NavLink>
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
