import React from 'react';
import { Link } from 'react-router-dom';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&auto=format&fit=crop';

export default function RoomCard({ room }) {
  if (!room) return null;
  const { _id, title, locality, price, gender, roomType, amenities = [], images = [] } = room;
  const imgSrc = images[0] || PLACEHOLDER;

  return (
    <Link
      to={`/rooms/${_id}`}
      className="card card-hover group block"
      data-testid="room-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas-soft">
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          loading="lazy"
        />
        <span className="absolute right-3 top-3 rounded-full bg-canvas-card/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-soft backdrop-blur">
          {roomType}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-ink group-hover:text-accent-dark transition-colors">
            {title}
          </h3>
          <span className="shrink-0 whitespace-nowrap text-[15px] font-bold text-accent-dark">
            ₹{Number(price).toLocaleString('en-IN')}
            <span className="text-[10px] font-medium text-ink-muted">/mo</span>
          </span>
        </div>

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
