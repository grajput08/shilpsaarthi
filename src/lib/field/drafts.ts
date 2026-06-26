'use client';

/** Offline-first verification drafts persisted in localStorage. */
export const DRAFT_PREFIX = 'ss_verify_draft_';

export interface VerificationDraft {
  artisanId: string;
  artisanName: string;
  clientGeneratedId: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'failed';
  data: Record<string, unknown>;
}

export function loadDraft(artisanId: string): VerificationDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(DRAFT_PREFIX + artisanId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VerificationDraft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: VerificationDraft): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFT_PREFIX + draft.artisanId, JSON.stringify(draft));
}

export function deleteDraft(artisanId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_PREFIX + artisanId);
}

export function listDrafts(): VerificationDraft[] {
  if (typeof window === 'undefined') return [];
  const out: VerificationDraft[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(DRAFT_PREFIX)) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          out.push(JSON.parse(raw) as VerificationDraft);
        } catch {
          /* ignore */
        }
      }
    }
  }
  return out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}
