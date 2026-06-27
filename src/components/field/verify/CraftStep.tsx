import { Input, Select } from '@/components/ui';
import { CRAFT_CATEGORY, type CraftCategory } from '@/lib/domain';
import {
  CRAFT_CHIP_CATEGORIES,
  CRAFT_SUBCATEGORIES,
  LEARNED_FROM_OPTIONS,
  type CraftProfileState,
} from '@/lib/field/verify-types';
import { FieldFormCard, VerifyCheckRow } from '@/components/field/verify/VerifyFormBits';
import { cn } from '@/lib/cn';
import { Camera, Plus } from 'lucide-react';

type ItemStatus = 'pending' | 'verified' | 'corrected' | 'rejected' | 'cancelled' | 'not_applicable';

export default function CraftStep({
  primaryCraft,
  onPrimaryCraftChange,
  craft,
  onCraftChange,
  craftPhotos,
  onAddCraftPhoto,
  itemStatus,
  onItemStatusChange,
  itemNote,
  onItemNoteChange,
}: {
  primaryCraft: CraftCategory | '';
  onPrimaryCraftChange: (c: CraftCategory) => void;
  craft: CraftProfileState;
  onCraftChange: (patch: Partial<CraftProfileState>) => void;
  craftPhotos: string[];
  onAddCraftPhoto: (files: FileList | null) => void;
  itemStatus: ItemStatus;
  onItemStatusChange: (s: ItemStatus) => void;
  itemNote: string;
  onItemNoteChange: (note: string) => void;
}) {
  const subs = primaryCraft ? CRAFT_SUBCATEGORIES[primaryCraft] ?? [] : [];

  return (
    <div className="space-y-4">
      <FieldFormCard>
        <p className="mb-2 text-xs font-medium text-field-muted">Primary craft category</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CRAFT_CHIP_CATEGORIES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onPrimaryCraftChange(key)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-150',
                primaryCraft === key
                  ? 'bg-field-accent text-white shadow-sm'
                  : 'bg-stone-100/80 text-field-muted hover:bg-stone-200/80',
              )}
            >
              {CRAFT_CATEGORY[key]}
            </button>
          ))}
        </div>
      </FieldFormCard>

      <FieldFormCard className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-field-muted">Sub-category</p>
          <Select
            value={craft.sub_category}
            onChange={(e) => onCraftChange({ sub_category: e.target.value })}
          >
            <option value="">Select sub-category…</option>
            {subs.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-field-muted">Experience</p>
            <Input
              placeholder="20+ yrs"
              value={craft.experience_years}
              onChange={(e) => onCraftChange({ experience_years: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-field-muted">Monthly capacity</p>
            <Input
              placeholder="12–15 pieces"
              value={craft.monthly_capacity}
              onChange={(e) => onCraftChange({ monthly_capacity: e.target.value })}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-field-muted">Learned from</p>
          <div className="flex flex-wrap gap-2">
            {LEARNED_FROM_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onCraftChange({ learned_from: opt })}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
                  craft.learned_from === opt
                    ? 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200'
                    : 'bg-stone-100/80 text-field-muted hover:bg-stone-200/80',
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-field-muted">Works in group · SHG / cooperative</p>
          <Input
            placeholder="Bhumkal SHG, Bichhiya"
            value={craft.group_name}
            onChange={(e) => onCraftChange({ group_name: e.target.value })}
          />
        </div>
      </FieldFormCard>

      <FieldFormCard>
        <p className="mb-2 text-xs font-medium text-field-muted">Craft photos</p>
        <div className="flex gap-2">
          {craftPhotos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              className="h-16 w-16 rounded-xl border border-field-border object-cover"
            />
          ))}
          {craftPhotos.length < 3 ? (
            <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-field-border bg-stone-50/80 text-field-muted hover:border-field-accent">
              <Plus className="h-5 w-5" />
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onAddCraftPhoto(e.target.files)} />
            </label>
          ) : null}
        </div>
      </FieldFormCard>

      <FieldFormCard className="space-y-2">
        <VerifyCheckRow
          checked={craft.craft_demonstrated}
          label="Artisan demonstrated craft knowledge"
          onChange={(v) => onCraftChange({ craft_demonstrated: v })}
        />
        <VerifyCheckRow
          checked={craft.craft_matches}
          label="Craft matches listed category"
          onChange={(v) => {
            onCraftChange({ craft_matches: v });
            if (v) onItemStatusChange('verified');
          }}
        />
        <select
          data-testid="item-craft"
          value={itemStatus}
          onChange={(e) => onItemStatusChange(e.target.value as ItemStatus)}
          className="sr-only"
          aria-hidden
          tabIndex={-1}
        >
          {['pending', 'verified', 'corrected', 'rejected', 'cancelled', 'not_applicable'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Input
          data-testid="note-craft"
          placeholder="Craft note (optional)"
          value={itemNote}
          onChange={(e) => onItemNoteChange(e.target.value)}
          className="text-sm"
        />
      </FieldFormCard>
    </div>
  );
}
