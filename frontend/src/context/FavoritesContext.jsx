import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const FavoritesCtx = createContext(null);
const STORAGE_KEY = 'basera_favorites_v1';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readStorage);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch { /* ignore quota errors */ }
  }, [favorites]);

  // Sync across tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setFavorites(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const ids = useMemo(() => new Set(favorites.map((r) => r._id)), [favorites]);

  const isFav = useCallback((id) => ids.has(id), [ids]);

  const toggle = useCallback((room) => {
    if (!room?._id) return false;
    let added = false;
    setFavorites((prev) => {
      const exists = prev.some((r) => r._id === room._id);
      if (exists) return prev.filter((r) => r._id !== room._id);
      added = true;
      // Store a slim snapshot so listing renders without an extra fetch
      const slim = {
        _id: room._id,
        title: room.title,
        locality: room.locality,
        price: room.price,
        gender: room.gender,
        roomType: room.roomType,
        amenities: room.amenities?.slice(0, 4) || [],
        images: room.images?.slice(0, 1) || [],
        savedAt: Date.now(),
      };
      return [slim, ...prev];
    });
    return added;
  }, []);

  const remove = useCallback((id) => {
    setFavorites((prev) => prev.filter((r) => r._id !== id));
  }, []);

  const clearAll = useCallback(() => setFavorites([]), []);

  const value = useMemo(
    () => ({ favorites, count: favorites.length, isFav, toggle, remove, clearAll }),
    [favorites, isFav, toggle, remove, clearAll]
  );

  return <FavoritesCtx.Provider value={value}>{children}</FavoritesCtx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesCtx);
  if (!ctx) {
    return {
      favorites: [], count: 0,
      isFav: () => false, toggle: () => false, remove: () => {}, clearAll: () => {},
    };
  }
  return ctx;
}
