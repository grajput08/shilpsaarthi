import { Card, CardHeader, CardBody } from '@/components/ui';

export interface BarDatum {
  label: string;
  value: number;
}

export default function BarList({
  title,
  data,
  emptyLabel = 'No data',
}: {
  title: string;
  data: BarDatum[];
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody className="space-y-2">
        {data.length === 0 ? (
          <p className="text-sm text-slate-400">{emptyLabel}</p>
        ) : (
          data.map((d) => (
            <div key={d.label} className="text-sm">
              <div className="mb-0.5 flex justify-between">
                <span className="text-slate-600">{d.label}</span>
                <span className="font-medium text-slate-800">{d.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-400" style={{ width: `${(d.value / max) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
