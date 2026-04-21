import React from 'react';
import { LOCALITIES, ROOM_TYPES, GENDERS } from '../constants.js';

export default function Filters({ filters, onChange, onClear }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const activeCount = Object.values(filters).filter((v) => v !== '' && v != null).length;

  return (
    <div id="filters" className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-ink-muted hover:text-ink underline underline-offset-4"
            data-testid="reset-filters"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Search */}
        <div className="xl:col-span-2">
          <label className="label">Search</label>
          <input
            type="text"
            name="q"
            value={filters.q}
            onChange={handleChange}
            placeholder="Title, locality…"
            className="input-field"
            data-testid="filter-search"
          />
        </div>

        <div>
          <label className="label">Locality</label>
          <select
            name="locality" value={filters.locality} onChange={handleChange}
            className="input-field" data-testid="filter-locality"
          >
            <option value="">All localities</option>
            {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Room type</label>
          <select
            name="roomType" value={filters.roomType} onChange={handleChange}
            className="input-field" data-testid="filter-room-type"
          >
            <option value="">Any type</option>
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Gender</label>
          <select
            name="gender" value={filters.gender} onChange={handleChange}
            className="input-field" data-testid="filter-gender"
          >
            <option value="">Any</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">Min ₹</label>
            <input
              type="number" name="minPrice" value={filters.minPrice} onChange={handleChange}
              placeholder="0" min="0" className="input-field" data-testid="filter-min-price"
            />
          </div>
          <div className="flex-1">
            <label className="label">Max ₹</label>
            <input
              type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange}
              placeholder="∞" min="0" className="input-field" data-testid="filter-max-price"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
