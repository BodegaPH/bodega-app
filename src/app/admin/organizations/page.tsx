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
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Organizations
        </h1>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">
          Read-only platform-wide list of organizations.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Members</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-200">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  No organizations found.
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{org.id}</td>
                  <td className="px-4 py-3 text-zinc-100">{org.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        org.isActive
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
                      }`}
                    >
                      {org.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{org.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right text-zinc-200">{org.memberCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          Page {Math.min(page, totalPages)} of {totalPages} · {total} total
        </span>
        <div className="flex gap-2">
          <Link
            href={`/admin/organizations?page=${prevPage}`}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 hover:bg-white/10"
          >
            Previous
          </Link>
          <Link
            href={`/admin/organizations?page=${nextPage}`}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 hover:bg-white/10"
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
