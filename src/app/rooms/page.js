import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Room, { LOCALITIES, ROOM_TYPES, GENDERS } from "@/models/Room";
import User from "@/models/User";
import RoomFilters from "@/components/RoomFilters";
import RoomList from "@/components/RoomList";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function RoomsPage({ searchParams }) {
  const sp = searchParams || {};
  const q = { available: true };
  if (sp.locality) q.locality = sp.locality;
  if (sp.roomType) q.roomType = sp.roomType;
  if (sp.gender) q.gender = sp.gender;
  if (sp.minPrice || sp.maxPrice) {
    q.price = {};
    if (sp.minPrice) q.price.$gte = Number(sp.minPrice);
    if (sp.maxPrice) q.price.$lte = Number(sp.maxPrice);
  }
  if (sp.q) q.$or = [
    { title: { $regex: sp.q, $options: "i" } },
    { description: { $regex: sp.q, $options: "i" } },
  ];

  let rooms = [];
  let nextCursor = null;
  let savedIds = [];
  try {
    await dbConnect();
    const docs = await Room.find(q).sort({ _id: -1 }).limit(PAGE_SIZE + 1).lean();
    const hasMore = docs.length > PAGE_SIZE;
    rooms = (hasMore ? docs.slice(0, PAGE_SIZE) : docs).map((r) =>
      JSON.parse(JSON.stringify(r))
    );
    nextCursor = hasMore ? String(rooms[rooms.length - 1]._id) : null;

    const user = getCurrentUser();
    if (user) {
      const u = await User.findById(user.id).select("savedRooms").lean();
      savedIds = (u?.savedRooms || []).map((id) => String(id));
    }
  } catch {}

  // Build query object for client load-more
  const queryForClient = {};
  ["q", "locality", "roomType", "gender", "minPrice", "maxPrice"].forEach((k) => {
    if (sp[k]) queryForClient[k] = sp[k];
  });

  const activeFilters = [
    sp.q && { k: "q", label: `"${sp.q}"` },
    sp.locality && { k: "locality", label: sp.locality },
    sp.roomType && { k: "roomType", label: sp.roomType },
    sp.gender && { k: "gender", label: sp.gender },
    sp.minPrice && { k: "minPrice", label: `≥ ₹${sp.minPrice}` },
    sp.maxPrice && { k: "maxPrice", label: `≤ ₹${sp.maxPrice}` },
  ].filter(Boolean);

  const removeUrl = (key) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => { if (k !== key && v) params.set(k, v); });
    return `/rooms${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside id="filters">
        <RoomFilters
          options={{ localities: LOCALITIES, roomTypes: ROOM_TYPES, genders: GENDERS }}
          initial={sp}
        />
      </aside>

      <section>
        <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rooms in Srinagar</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Showing <span className="font-semibold text-ink">{rooms.length}</span>
              {nextCursor ? "+" : ""} result{rooms.length === 1 ? "" : "s"}
              {activeFilters.length > 0 && <> · {activeFilters.length} filter{activeFilters.length === 1 ? "" : "s"} applied</>}
            </p>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <Link
                key={f.k}
                href={removeUrl(f.k)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas-card px-3 py-1 text-xs font-medium text-ink hover:border-ink/30 hover:bg-canvas-soft"
              >
                {f.label}
                <span className="text-ink-subtle">✕</span>
              </Link>
            ))}
            <Link href="/rooms" className="text-xs font-semibold text-ink-muted hover:text-ink underline underline-offset-4">
              Clear all
            </Link>
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-light text-accent-dark text-2xl">
              ⌕
            </div>
            <h3 className="mt-5 text-lg font-semibold">No rooms match your filters</h3>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Try widening the price range, switching locality, or clearing filters to see all available rooms.
            </p>
            <Link href="/rooms" className="btn-primary mt-6">Clear all filters</Link>
          </div>
        ) : (
          <RoomList
            initialRooms={rooms}
            initialCursor={nextCursor}
            query={queryForClient}
            savedIds={savedIds}
          />
        )}
      </section>
    </div>
  );
}
