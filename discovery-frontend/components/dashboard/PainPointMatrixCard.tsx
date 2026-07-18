import { Card, CardHeader } from "@/components/ui/Card";
import { BubbleMatrix } from "@/components/charts/BubbleMatrix";
import type { PainPointMatrixItem } from "@/types";

export function PainPointMatrixCard({ data }: { data: PainPointMatrixItem[] }) {
  return (
    <Card>
      <CardHeader title="Pain Points by Impact vs Frequency" />
      <BubbleMatrix data={data} />
    </Card>
  );
}
