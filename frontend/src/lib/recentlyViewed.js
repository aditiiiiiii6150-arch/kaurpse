// Tiny localStorage helper to track recently viewed rooms.
const KEY = 'basera_recent_v1';
const MAX = 6;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch { /* ignore */ }
}

export function getRecent() {
  return read();
}

export function pushRecent(room) {
  if (!room?._id) return;
  const slim = {
    _id: room._id,
    title: room.title,
    locality: room.locality,
    price: room.price,
    gender: room.gender,
    roomType: room.roomType,
    amenities: room.amenities?.slice(0, 4) || [],
    images: room.images?.slice(0, 1) || [],
    viewedAt: Date.now(),
  };
  const list = read().filter((r) => r._id !== slim._id);
  list.unshift(slim);
  write(list);
}

export function clearRecent() { write([]); }
