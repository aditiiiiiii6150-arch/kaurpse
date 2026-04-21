import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Room from "@/models/Room";
import { getCurrentUser } from "@/lib/auth";
import ListingWizard from "@/components/ListingWizard";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }) {
  const user = getCurrentUser();
  if (!user) redirect(`/login?next=/dashboard/${params.id}/edit`);
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await dbConnect();
  const room = await Room.findById(params.id).lean();
  if (!room) notFound();
  if (String(room.owner) !== String(user.id)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">← Dashboard</Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit listing</h1>
        <p className="mt-1 text-sm text-ink-muted">Update any details — your changes go live immediately.</p>
      </div>
      <ListingWizard
        mode="edit"
        roomId={params.id}
        initial={JSON.parse(JSON.stringify(room))}
      />
    </div>
  );
}
