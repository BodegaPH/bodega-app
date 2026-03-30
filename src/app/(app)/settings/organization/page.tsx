import { redirectToOrgScopedPath } from '@/lib/redirect-helper';
export default async function Page() { await redirectToOrgScopedPath('settings/organization'); }
