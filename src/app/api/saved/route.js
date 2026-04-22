import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ savedIds: [], count: 0 });
  await dbConnect();
  const u = await User.findById(user.id).select("savedRooms").lean();
  const savedIds = (u?.savedRooms || []).map((id) => String(id));
  return NextResponse.json({ savedIds, count: savedIds.length });
}
