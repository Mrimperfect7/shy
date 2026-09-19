import prisma from "@/lib/prisma";
import AdminPollClient from "./AdminPollClient";

export const dynamic = 'force-dynamic';

export default async function AdminPollsPage() {
  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      options: {
        orderBy: { id: "asc" }
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div>
        <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--charcoal)" }}>Polls Management</h1>
        <p className="font-sans text-sm text-gray-500">Create and manage popup polls for the storefront.</p>
      </div>

      <AdminPollClient initialPolls={polls} />
    </div>
  );
}
