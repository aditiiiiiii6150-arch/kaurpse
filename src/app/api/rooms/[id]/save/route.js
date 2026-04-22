import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Room from "@/models/Room";
import { getCurrentUser } from "@/lib/auth";

function badId(id) {
  return !mongoose.isValidObjectId(id);
}

async function ensureUser() {
  const u = getCurrentUser();
  if (!u) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { user: u };
}

export async function POST(_req, { params }) {
  if (badId(params.id)) return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  const { user, error } = await ensureUser();
  if (error) return error;
  await dbConnect();

  const room = await Room.findById(params.id).select("_id").lean();
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  await User.updateOne(
    { _id: user.id },
    { $addToSet: { savedRooms: room._id } }
  );
  return NextResponse.json({ saved: true });
}

export async function DELETE(_req, { params }) {
  if (badId(params.id)) return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  const { user, error } = await ensureUser();
  if (error) return error;
  await dbConnect();

  await User.updateOne(
    { _id: user.id },
    { $pull: { savedRooms: new mongoose.Types.ObjectId(params.id) } }
  );
  return NextResponse.json({ saved: false });
}
