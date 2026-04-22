import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Room from "@/models/Room";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SIZE = 12;

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = {};
  const locality = searchParams.get("locality");
  const roomType = searchParams.get("roomType");
  const gender = searchParams.get("gender");
  const minPrice = parseInt(searchParams.get("minPrice") || "0", 10);
  const maxPrice = parseInt(searchParams.get("maxPrice") || "0", 10);
  const search = searchParams.get("q");
  const mine = searchParams.get("mine");
  const cursor = searchParams.get("cursor");
  const limitParam = parseInt(searchParams.get("limit") || `${PAGE_SIZE}`, 10);
  const limit = Math.min(Math.max(limitParam, 1), 50);

  if (locality) q.locality = locality;
  if (roomType) q.roomType = roomType;
  if (gender) q.gender = gender;
  if (minPrice || maxPrice) {
    q.price = {};
    if (minPrice) q.price.$gte = minPrice;
    if (maxPrice) q.price.$lte = maxPrice;
  }
  if (search) q.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];

  if (mine === "1") {
    const user = getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    q.owner = user.id;
    // Dashboard route: keep behaviour as-is (no cursor pagination, return everything)
    const rooms = await Room.find(q).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ rooms });
  }

  q.available = true;

  // Cursor-based pagination ordered by _id desc (matches createdAt desc since
  // ObjectId is monotonically increasing).
  if (cursor && mongoose.isValidObjectId(cursor)) {
    q._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  // Fetch limit + 1 so we can detect whether more results exist.
  const docs = await Room.find(q).sort({ _id: -1 }).limit(limit + 1).lean();
  const hasMore = docs.length > limit;
  const rooms = hasMore ? docs.slice(0, limit) : docs;
  const nextCursor = hasMore ? String(rooms[rooms.length - 1]._id) : null;

  return NextResponse.json({ rooms, nextCursor });
}

export async function POST(req) {
  try {
    const user = getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "owner") return NextResponse.json({ error: "Only owners can list rooms" }, { status: 403 });

    const body = await req.json();
    const required = ["title", "description", "price", "roomType", "locality", "ownerName", "ownerPhone"];
    for (const k of required) if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 });

    await dbConnect();
    const room = await Room.create({
      title: body.title,
      description: body.description,
      price: Number(body.price),
      roomType: body.roomType,
      locality: body.locality,
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      gender: body.gender || "Any",
      images: Array.isArray(body.images) ? body.images : [],
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      owner: user.id,
      available: body.available !== false,
    });
    return NextResponse.json({ room });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
