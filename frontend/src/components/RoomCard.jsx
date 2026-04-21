import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&auto=format&fit=crop';

export default function RoomCard({ room }) {
  const { isFav, toggle } = useFavorites();
  const toast = useToast();

  if (!room) return null;
  const { _id, title, locality, price, gender, roomType, amenities = [], images = [] } = room;
  const imgSrc = images[0] || PLACEHOLDER;
  const saved = isFav(_id);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(room);
    toast.success(added ? 'Saved to your list' : 'Removed from saved');
  };

  return (
    <Link
      to={`/rooms/${_id}`}
      className="card card-hover group block relative"
      data-testid="room-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas-soft">
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          loading="lazy"
        />
        {/* gentle dark gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent opacity-90" />

        {/* room type tag (top-right) */}
        <span className="absolute right-3 top-3 rounded-full bg-canvas-card/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-soft backdrop-blur">
          {roomType}
        </span>

        {/* save heart (top-left) */}
        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? 'Remove from saved' : 'Save room'}
          aria-pressed={saved}
          title={saved ? 'Saved' : 'Save'}
          className={`absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full border backdrop-blur shadow-soft transition-all duration-200
            ${saved
              ? 'bg-accent border-accent-dark text-ink scale-100'
              : 'bg-canvas-card/90 border-line text-ink-muted hover:text-accent-dark hover:scale-110'}`}
          data-testid="save-room"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* price chip (bottom-left, on image) */}
        <span className="absolute left-3 bottom-3 inline-flex items-baseline gap-1 rounded-full bg-canvas-card/95 px-3 py-1 shadow-soft backdrop-blur">
          <span className="text-sm font-bold text-ink">
            ₹{Number(price).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] font-medium text-ink-muted">/mo</span>
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-[17px] font-semibold leading-snug line-clamp-1 text-ink group-hover:text-accent-dark transition-colors">
          {title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-[13px] text-ink-muted">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 11s4-3.5 4-7a4 4 0 1 0-8 0c0 3.5 4 7 4 7z" />
            <circle cx="6" cy="4" r="1.3" />
          </svg>
          {locality}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-full bg-canvas-soft px-2.5 py-0.5 text-[11px] font-medium text-ink-soft border border-line">
            {gender}
          </span>
          {amenities.slice(0, 2).map((a) => (
            <span
              key={a}
              className="inline-flex items-center rounded-full bg-canvas-soft px-2.5 py-0.5 text-[11px] font-medium text-ink-soft border border-line"
            >
              {a}
            </span>
          ))}
          {amenities.length > 2 && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium text-ink-subtle">
              +{amenities.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
