import { redirectToOrgScopedPath } from '@/app/components/app/redirectHelper';
export default async function Page() { await redirectToOrgScopedPath('movements'); }
