import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Home         from './pages/Home.jsx';
import Listings     from './pages/Listings.jsx';
import RoomDetail   from './pages/RoomDetail.jsx';
import Login        from './pages/Login.jsx';
import Register     from './pages/Register.jsx';
import AddListing   from './pages/AddListing.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import EditListing  from './pages/EditListing.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"           element={<Home />} />
          <Route path="/listings"   element={<Listings />} />
          <Route path="/rooms/:id"  element={<RoomDetail />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />

          {/* Owner-protected (handled inside the page components) */}
          <Route path="/add-listing"        element={<AddListing />} />
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/rooms/:id/edit"     element={<EditListing />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center text-center" id="not-found">
      <p className="text-[120px] font-bold leading-none tracking-tighter text-accent-dark/20 sm:text-[160px]">
        404
      </p>
      <h1 className="-mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-ink-muted">
        The page you&apos;re looking for has either moved, been removed, or never existed.
        Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Link to="/" className="btn-primary">Back home</Link>
        <Link to="/listings" className="btn-secondary">Browse rooms</Link>
      </div>
    </div>
  );
}
