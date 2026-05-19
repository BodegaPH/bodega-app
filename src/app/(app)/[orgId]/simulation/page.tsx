import { getTopRiskSnapshots } from "@/features/simulation/server";
import RiskTable from "@/features/simulation/components/RiskTable";

export const metadata = {
  title: "Simulation | Bodega",
};

interface SimulationPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function SimulationPage({ params }: SimulationPageProps) {
  const { orgId } = await params;
  
  const snapshots = await getTopRiskSnapshots(orgId, { limit: 100 });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <RiskTable snapshots={snapshots} />
    </div>
  );
}
