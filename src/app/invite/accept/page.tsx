import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  acceptInvitationByToken,
  getInvitePreviewByToken,
  InvitationsApiError,
} from "@/features/organizations/server";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const inviteToken = token?.trim();

  if (!inviteToken) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8">Invalid invite link.</div>;
  }

  const session = await getServerSession(authOptions);

  try {
    const preview = await getInvitePreviewByToken(inviteToken);

    if (!session?.user?.id) {
      const encodedToken = encodeURIComponent(inviteToken);
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8 flex items-center justify-center">
          <div className="max-w-lg w-full bg-zinc-900/40 border border-white/10 rounded-2xl p-6">
            <h1 className="text-xl font-semibold text-white mb-2">You&apos;re invited</h1>
            <p className="text-sm text-zinc-400 mb-6">
              {preview.inviter?.name ?? preview.inviter?.email ?? "An admin"} invited you to join
              <span className="text-zinc-200"> {preview.orgName}</span> as {preview.role === "ORG_ADMIN" ? "Admin" : "Member"}.
            </p>
            <div className="flex gap-3">
              <Link
                href={`/auth/signin?inviteToken=${encodedToken}&callbackUrl=${encodeURIComponent(`/invite/accept?token=${inviteToken}`)}`}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm"
              >
                Sign in to continue
              </Link>
              <Link
                href={`/auth/signup?inviteToken=${encodedToken}&callbackUrl=${encodeURIComponent(`/invite/accept?token=${inviteToken}`)}`}
                className="px-4 py-2 rounded-xl border border-white/10 text-sm text-zinc-200 hover:bg-white/5"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      );
    }

    await acceptInvitationByToken(inviteToken, session.user.id, session.user.email);
    redirect(`/${preview.orgId}/dashboard?inviteAccepted=1`);
  } catch (error) {
    const message =
      error instanceof InvitationsApiError ? error.message : "Unable to process invitation";

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8 flex items-center justify-center">
        <div className="max-w-lg w-full bg-zinc-900/40 border border-white/10 rounded-2xl p-6">
          <h1 className="text-xl font-semibold text-white mb-2">Invitation unavailable</h1>
          <p className="text-sm text-zinc-400">{message}</p>
        </div>
      </div>
    );
  }
}
