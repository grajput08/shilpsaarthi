import { Chip } from '@/components/ui';
import {
  ARTISAN_STATUS,
  DOC_STATUS,
  VERIFICATION_DECISION,
  PRIORITY,
  WHATSAPP_STATUS,
  type ArtisanStatus,
  type DocStatus,
  type VerificationDecision,
  type PriorityLevel,
  type WhatsappStatus,
} from '@/lib/domain';

export function ArtisanStatusBadge({ status }: { status: ArtisanStatus }) {
  const s = ARTISAN_STATUS[status];
  return <Chip tone={s.tone}>{s.label}</Chip>;
}

export function DocStatusBadge({ status }: { status: DocStatus }) {
  const s = DOC_STATUS[status];
  return <Chip tone={s.tone}>{s.label}</Chip>;
}

export function DecisionBadge({ decision }: { decision: VerificationDecision | null }) {
  if (!decision) return <Chip tone="gray">No decision</Chip>;
  const s = VERIFICATION_DECISION[decision];
  return <Chip tone={s.tone}>{s.label}</Chip>;
}

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const s = PRIORITY[priority];
  return <Chip tone={s.tone}>{s.label}</Chip>;
}

export function WhatsappStatusBadge({ status }: { status: WhatsappStatus }) {
  const s = WHATSAPP_STATUS[status];
  return <Chip tone={s.tone}>{s.label}</Chip>;
}
