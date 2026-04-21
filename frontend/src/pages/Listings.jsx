import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import RoomCard from '../components/RoomCard.jsx';
import Filters from '../components/Filters.jsx';
import EmptyState from '../components/EmptyState.jsx';

const KEYS = ['q', 'locality', 'roomType', 'gender', 'minPrice', 'maxPrice'];
const EMPTY_FILTERS = { q: '', locality: '', roomType: '', gender: '', minPrice: '', maxPrice: '' };

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters straight from URL (single source of truth)
  const filters = useMemo(() => {
    const f = { ...EMPTY_FILTERS };
    KEYS.forEach((k) => { f[k] = searchParams.get(k) || ''; });
    return f;
  }, [searchParams]);

  const page = Number(searchParams.get('page') || 1);

  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [total, setTotal]     = useState(0);
  const LIMIT = 12;

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      KEYS.forEach((k) => { if (filters[k]) params[k] = filters[k]; });
      const { data } = await api.get('/rooms', { params });
      const list  = Array.isArray(data) ? data : (data.rooms || []);
      const count = data.total ?? list.length;
      setRooms(list);
      setTotal(count);
    } catch {
      setError('Failed to load listings. Please try again.');
      setRooms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const updateUrl = (next, opts = {}) => {
    const params = new URLSearchParams();
    KEYS.forEach((k) => { if (next[k]) params.set(k, next[k]); });
    if (opts.page && opts.page > 1) params.set('page', String(opts.page));
    setSearchParams(params, { replace: false });
  };

  const handleFilterChange = (newFilters) => updateUrl(newFilters, { page: 1 });
  const handleClear = () => setSearchParams(new URLSearchParams());

  const totalPages = Math.ceil(total / LIMIT) || 1;
  const activeChips = KEYS
    .filter((k) => filters[k])
    .map((k) => ({
      k,
      label:
        k === 'q' ? `"${filters[k]}"` :
        k === 'minPrice' ? `≥ ₹${filters[k]}` :
        k === 'maxPrice' ? `≤ ₹${filters[k]}` :
        filters[k],
    }));

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-col gap-2 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Available rooms</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {loading
              ? 'Loading rooms…'
              : `Showing ${total} room${total !== 1 ? 's' : ''} in Srinagar (Garhwal)`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <Filters filters={filters} onChange={handleFilterChange} onClear={handleClear} />
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {activeChips.map(({ k, label }) => (
            <button
              key={k}
              onClick={() => handleFilterChange({ ...filters, [k]: '' })}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas-card px-3 py-1 text-xs font-medium text-ink hover:border-ink/30 hover:bg-canvas-soft transition"
            >
              {label}
              <span className="text-ink-subtle">✕</span>
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>!</span> {error}
          <button onClick={fetchRooms} className="ml-auto font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div id="listings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-canvas-soft" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-canvas-soft rounded w-3/4" />
                <div className="h-3 bg-canvas-soft rounded w-1/2" />
                <div className="h-6 bg-canvas-soft rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <>
          <div
            id="listings-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {rooms.map((room) => <RoomCard key={room._id} room={room} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-10">
              <button
                disabled={page === 1}
                onClick={() => updateUrl(filters, { page: page - 1 })}
                className="btn-secondary !px-3.5 !py-2 disabled:opacity-40"
              >
                ←
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => updateUrl(filters, { page: pg })}
                    className={`min-w-9 h-9 px-3 rounded-[10px] text-sm font-semibold transition ${
                      pg === page
                        ? 'bg-ink text-canvas'
                        : 'bg-canvas-card border border-line text-ink hover:bg-canvas-soft'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => updateUrl(filters, { page: page + 1 })}
                className="btn-secondary !px-3.5 !py-2 disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </>
      ) : !error && (
        <EmptyState
          icon="⌕"
          title={activeChips.length > 0 ? 'No rooms match your filters' : 'No rooms available yet'}
          description={
            activeChips.length > 0
              ? 'Try widening the price range or switching locality. You can also clear all filters.'
              : 'New listings appear here as soon as owners publish them. Check back shortly.'
          }
          action={activeChips.length > 0 && (
            <button onClick={handleClear} className="btn-primary">Clear all filters</button>
          )}
        />
      )}
    </div>
  );
}
