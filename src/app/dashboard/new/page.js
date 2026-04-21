import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ListingWizard from "@/components/ListingWizard";

export const dynamic = "force-dynamic";

export default function NewListingPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/new");
  if (user.role !== "owner") redirect("/rooms");
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">← Dashboard</Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">List a new room</h1>
        <p className="mt-1 text-sm text-ink-muted">Fill in the details across 5 quick steps.</p>
      </div>
      <ListingWizard mode="create" defaultOwner={{ name: user.name, phone: "" }} />
    </div>
  );
}
