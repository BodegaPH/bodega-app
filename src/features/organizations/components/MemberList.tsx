"use client";

import { MembershipRole } from "@prisma/client";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: MembershipRole;
}

interface MemberListProps {
  members: Member[];
}

export default function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <p className="text-zinc-400 font-medium">No members found</p>
        <p className="text-sm text-zinc-500 mt-1">
          This organization doesn&apos;t have any members yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-zinc-500 pb-3">
              Name
            </th>
            <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-zinc-500 pb-3">
              Email
            </th>
            <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-zinc-500 pb-3">
              Role
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {members.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-white/[0.02] transition-colors group"
            >
              <td className="py-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-medium text-white shadow-inner border border-white/5">
                    {(member.name || member.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <span className="text-white font-medium">
                    {member.name || "Unknown User"}
                  </span>
                </div>
              </td>
              <td className="py-4 text-sm text-zinc-400">{member.email}</td>
              <td className="py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    member.role === "ORG_ADMIN"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-zinc-800/50 text-zinc-400 border border-white/5"
                  }`}
                >
                  {member.role === "ORG_ADMIN" ? "Admin" : "Member"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
