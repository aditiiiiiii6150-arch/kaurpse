import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import RoomCard from '../components/RoomCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Saved() {
  const { favorites, count, clearAll } = useFavorites();
  const toast = useToast();

  const handleClear = () => {
    if (count === 0) return;
    if (!window.confirm('Remove all saved rooms?')) return;
    clearAll();
    toast.success('Saved list cleared');
  };

  return (
    <div className="page-container" id="saved-page">
      <div className="mb-8 flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Your collection</span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Saved rooms
            {count > 0 && (
              <span className="ml-3 align-middle inline-flex h-7 min-w-[28px] px-2 items-center justify-center rounded-full bg-accent text-ink text-sm font-semibold">
                {count}
              </span>
            )}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {count > 0
              ? 'Your shortlist lives here. We keep it on your device — no account needed.'
              : 'Tap the heart on any room to keep it here for later.'}
          </p>
        </div>
        {count > 0 && (
          <button onClick={handleClear} className="btn-secondary self-start sm:self-auto" data-testid="clear-saved">
            Clear all
          </button>
        )}
      </div>

      {count === 0 ? (
        <EmptyState
          icon="♡"
          title="No saved rooms yet"
          description="Browse listings and tap the heart to save rooms you like. They’ll show up right here."
          action={<Link to="/listings" className="btn-primary">Browse rooms</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
