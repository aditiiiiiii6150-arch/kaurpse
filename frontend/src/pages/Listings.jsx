import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import RoomCard from '../components/RoomCard.jsx';
import Filters from '../components/Filters.jsx';
import EmptyState from '../components/EmptyState.jsx';

const KEYS = ['q', 'locality', 'roomType', 'gender', 'minPrice', 'maxPrice', 'sort'];
const EMPTY_FILTERS = { q: '', locality: '', roomType: '', gender: '', minPrice: '', maxPrice: '', sort: '' };

const SORTS = [
  { value: '',           label: 'Recommended' },
  { value: 'price_asc',  label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest',     label: 'Newest first' },
];

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL = source of truth for committed filters
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

  // Local "draft" filters so search can be debounced before pushing to URL
  const [draft, setDraft] = useState(filters);
  useEffect(() => { setDraft(filters); /* sync when URL changes externally */ }, [filters]);

  // Debounce only the text "q" field; commit other filters immediately
  const qTimeout = useRef(null);
  const handleDraftChange = (next) => {
    setDraft(next);
    const onlyQChanged = KEYS.every((k) => k === 'q' || next[k] === filters[k]);
    if (onlyQChanged) {
      if (qTimeout.current) clearTimeout(qTimeout.current);
      qTimeout.current = setTimeout(() => updateUrl(next, { page: 1 }), 350);
    } else {
      if (qTimeout.current) clearTimeout(qTimeout.current);
      updateUrl(next, { page: 1 });
    }
  };

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      KEYS.forEach((k) => { if (filters[k]) params[k] = filters[k]; });
      const { data } = await api.get('/rooms', { params });
      let list  = Array.isArray(data) ? data : (data.rooms || []);
      const count = data.total ?? list.length;

      // Client-side sort fallback (in case API ignores `sort`)
      if (filters.sort === 'price_asc')  list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
      if (filters.sort === 'price_desc') list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
      if (filters.sort === 'newest')     list = [...list].sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

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

  const handleClear = () => {
    if (qTimeout.current) clearTimeout(qTimeout.current);
    setSearchParams(new URLSearchParams());
  };

  const handleSort = (val) => {
    updateUrl({ ...filters, sort: val }, { page: 1 });
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;
  const chipKeys = ['q', 'locality', 'roomType', 'gender', 'minPrice', 'maxPrice'];
  const activeChips = chipKeys
    .filter((k) => filters[k])
    .map((k) => ({
      k,
      label:
        k === 'q' ? `“${filters[k]}”` :
        k === 'minPrice' ? `≥ ₹${filters[k]}` :
        k === 'maxPrice' ? `≤ ₹${filters[k]}` :
        filters[k],
    }));

  return (
    <div className="page-container" id="listings-page">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Browse</span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Available rooms
          </h1>
          <p className="mt-2 text-sm text-ink-muted" data-testid="results-count">
            {loading
              ? 'Loading rooms…'
              : `Showing ${rooms.length} of ${total} room${total !== 1 ? 's' : ''} in Srinagar (Garhwal)`}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Sort
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => handleSort(e.target.value)}
            className="input-field !py-2 !w-auto pr-8"
            data-testid="sort-select"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filters (sticky on lg) */}
      <div className="mb-5 lg:sticky lg:top-[72px] lg:z-20">
        <Filters filters={draft} onChange={handleDraftChange} onClear={handleClear} />
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2" data-testid="filter-chips">
          {activeChips.map(({ k, label }) => (
            <button
              key={k}
              onClick={() => handleDraftChange({ ...filters, [k]: '' })}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas-card px-3 py-1 text-xs font-medium text-ink hover:border-ink/30 hover:bg-canvas-soft transition"
            >
              {label}
              <span className="text-ink-subtle">✕</span>
            </button>
          ))}
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-ink-muted hover:text-ink underline underline-offset-4"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white text-xs">!</span>
          {error}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in"
          >
            {rooms.map((room) => <RoomCard key={room._id} room={room} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-10" role="navigation" aria-label="Pagination">
              <button
                disabled={page === 1}
                onClick={() => updateUrl(filters, { page: page - 1 })}
                className="btn-secondary !px-3.5 !py-2 disabled:opacity-40"
                aria-label="Previous page"
              >
                ←
              </button>
              {pageRange(page, totalPages).map((pg, i) =>
                pg === '…' ? (
                  <span key={`gap-${i}`} className="px-2 text-ink-muted">…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => updateUrl(filters, { page: pg })}
                    className={`min-w-9 h-9 px-3 rounded-full text-sm font-semibold transition ${
                      pg === page
                        ? 'bg-ink text-canvas'
                        : 'bg-canvas-card border border-line text-ink hover:bg-canvas-soft'
                    }`}
                    aria-label={`Page ${pg}`}
                    aria-current={pg === page ? 'page' : undefined}
                  >
                    {pg}
                  </button>
                )
              )}
              <button
                disabled={page === totalPages}
                onClick={() => updateUrl(filters, { page: page + 1 })}
                className="btn-secondary !px-3.5 !py-2 disabled:opacity-40"
                aria-label="Next page"
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

/** Compact pagination range with ellipses (e.g. 1 … 4 5 6 … 12) */
function pageRange(current, total) {
  const out = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) out.push(i);
    return out;
  }
  const add = (n) => out.push(n);
  add(1);
  if (current > 3) add('…');
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) add(i);
  if (current < total - 2) add('…');
  add(total);
  return out;
}
