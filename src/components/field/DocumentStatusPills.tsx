import { DOCUMENT_TYPE, type DocumentType } from '@/lib/domain';
import { cn } from '@/lib/cn';

const TRACKED_DOCS: DocumentType[] = ['id_proof', 'bank_passbook', 'caste_tribe_certificate'];

export default function DocumentStatusPills({
  documents,
}: {
  documents: { doc_type: string; status: string }[];
}) {
  const byType = new Map(documents.map((d) => [d.doc_type, d.status]));

  return (
    <div className="flex flex-wrap gap-2">
      {TRACKED_DOCS.map((type) => {
        const status = byType.get(type);
        const available = status === 'available';
        const label = DOCUMENT_TYPE[type].replace(' / ', ' ');
        return (
          <span
            key={type}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
              available ? 'bg-india-50 text-india-700 ring-1 ring-inset ring-india-200' : 'text-field-muted',
            )}
          >
            {available ? `${label} on file` : `No ${label.toLowerCase()}`}
          </span>
        );
      })}
    </div>
  );
}
