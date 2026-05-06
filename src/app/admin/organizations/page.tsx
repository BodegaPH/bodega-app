import { getPlatformAdminMonitoringOrganizations } from "@/features/admin/server";
import Link from "next/link";

interface OrganizationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getPageParam(value: string | string[] | undefined): number {
  if (typeof value !== "string") return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

const PAGE_SIZE = 25;

export default async function AdminOrganizationsPage({ searchParams }: OrganizationsPageProps) {
  const params = await searchParams;
  const page = getPageParam(params.page);

  const organizationsResponse = await getPlatformAdminMonitoringOrganizations({
    page,
    pageSize: PAGE_SIZE,
  });
  const organizations = organizationsResponse.rows;
  const total = organizationsResponse.pagination.total;
  const totalPages = Math.max(1, organizationsResponse.pagination.totalPages);
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between px-2">
        <div>
          <h1 className="text-2xl font-mono uppercase tracking-widest text-white">[SYS.DIR] Organizations</h1>
          <p className="mt-2 text-[10px] font-mono text-zinc-500">
            Read-only platform-wide list of organizations.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-none border border-white/10 bg-zinc-950">
        <table className="min-w-full text-left text-[12px] font-mono">
          <thead className="bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Members</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  No organizations found.
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr key={org.id} className="text-zinc-300 hover:bg-white/[0.01]">
                  <td className="px-4 py-3 font-mono text-[10px] text-zinc-500 uppercase">{org.id.split('-')[0]}...</td>
                  <td className="px-4 py-3 uppercase tracking-widest">{org.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-none border px-2 py-0.5 text-[10px] uppercase tracking-widest inline-flex ${
                        org.isActive
                          ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400"
                          : "border-zinc-500/30 bg-zinc-950/30 text-zinc-500"
                      }`}
                    >
                      {org.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{org.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{org.memberCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-none border border-white/10 bg-zinc-950 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
          <span>
            Page {Math.min(page, totalPages)} of {totalPages} · {total} total
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/organizations?page=${prevPage}`}
              aria-disabled={page <= 1}
              className={`rounded-none border border-white/10 px-3 py-1.5 transition-none ${
                page <= 1
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/admin/organizations?page=${nextPage}`}
              aria-disabled={page >= totalPages}
              className={`rounded-none border border-white/10 px-3 py-1.5 transition-none ${
                page >= totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
