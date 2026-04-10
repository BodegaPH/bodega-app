import { redirectByCanonicalPolicy } from "@/lib/redirect-helper";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return redirectByCanonicalPolicy({ currentPath: "/" });
}
