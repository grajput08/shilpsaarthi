'use client';

import { useState } from 'react';
import { Input, Select } from '@/components/ui';
import { CRAFT_CATEGORY, enumOptions, type CraftCategory } from '@/lib/domain';
import { emptyProduct, type ProductDraft } from '@/lib/field/verify-types';
import { FieldFormCard } from '@/components/field/verify/VerifyFormBits';
import { cn } from '@/lib/cn';
import { Camera, Plus } from 'lucide-react';

type ItemStatus = 'pending' | 'verified' | 'corrected' | 'rejected' | 'cancelled' | 'not_applicable';

function formatPriceRange(p: ProductDraft) {
  if (p.price_min && p.price_max) return `₹${p.price_min}–${p.price_max}`;
  if (p.price_min) return `₹${p.price_min}+`;
  return '—';
}

export default function ProductsStep({
  products,
  onProductsChange,
  itemStatus,
  onItemStatusChange,
  itemNote,
  onItemNoteChange,
  onAddPhoto,
}: {
  products: ProductDraft[];
  onProductsChange: (products: ProductDraft[]) => void;
  itemStatus: ItemStatus;
  onItemStatusChange: (s: ItemStatus) => void;
  itemNote: string;
  onItemNoteChange: (note: string) => void;
  onAddPhoto: (productId: string, files: FileList | null) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = products.find((p) => p.id === editingId);

  function updateProduct(id: string, patch: Partial<ProductDraft>) {
    onProductsChange(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function addProduct() {
    const p = emptyProduct();
    onProductsChange([...products, p]);
    setEditingId(p.id);
    onItemStatusChange('verified');
  }

  function markNoProducts() {
    onProductsChange([]);
    onItemStatusChange('not_applicable');
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-field-muted">
        {products.length > 0 ? `${products.length} product${products.length > 1 ? 's' : ''} added` : 'No products added yet'}
      </p>

      {products.map((p) => (
        <FieldFormCard key={p.id} className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-field-ink">{p.name || 'Untitled product'}</p>
              <p className="text-xs text-field-muted">
                {[p.materials, p.dimensions].filter(Boolean).join(' · ') || 'Add details'}
              </p>
            </div>
            <button type="button" className="shrink-0 text-xs font-semibold text-field-accent" onClick={() => setEditingId(p.id)}>
              Edit
            </button>
          </div>
          {p.photo_paths.length > 0 ? (
            <div className="flex gap-1.5">
              {p.photo_paths.slice(0, 3).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="h-14 w-14 rounded-lg border border-field-border object-cover" />
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-field-ink">{formatPriceRange(p)}</span>
            {p.monthly_capacity ? (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-field-muted">{p.monthly_capacity} / month</span>
            ) : null}
            {p.can_ship ? (
              <span className="rounded-full bg-india-50 px-2.5 py-1 font-medium text-india-700">Can ship</span>
            ) : (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-field-muted">No packaging</span>
            )}
          </div>
          {p.buyers ? <p className="text-xs text-field-muted">{p.buyers}</p> : null}
        </FieldFormCard>
      ))}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={addProduct}
          className="flex min-h-[44px] items-center justify-center gap-1 rounded-xl border-2 border-field-accent text-sm font-semibold text-field-accent transition-colors hover:bg-field-accent/5"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
        <button
          type="button"
          onClick={markNoProducts}
          className="min-h-[44px] rounded-xl border border-field-border text-sm font-medium text-field-muted transition-colors hover:bg-stone-50"
        >
          No product today
        </button>
      </div>

      <FieldFormCard className="rounded-xl bg-stone-50/60 text-xs text-field-muted [text-wrap:pretty]">
        Capture front, side &amp; close-up shots. These feed marketplace and exhibition shortlists later.
      </FieldFormCard>

      <select
        data-testid="item-products"
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
      <Input data-testid="note-products" value={itemNote} onChange={(e) => onItemNoteChange(e.target.value)} className="sr-only" tabIndex={-1} aria-hidden />

      {editing ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 pb-[calc(56px+env(safe-area-inset-bottom))]">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-field-surface p-4 shadow-pop">
            <h3 className="mb-3 font-bold text-field-ink">Edit product</h3>
            <div className="space-y-3">
              <Input placeholder="Product name" value={editing.name} onChange={(e) => updateProduct(editing.id, { name: e.target.value })} />
              <Select
                value={editing.category}
                onChange={(e) => updateProduct(editing.id, { category: e.target.value as CraftCategory })}
              >
                <option value="">Category…</option>
                {enumOptions(CRAFT_CATEGORY).map((c) => (
                  <option key={c} value={c}>
                    {CRAFT_CATEGORY[c]}
                  </option>
                ))}
              </Select>
              <Input placeholder="Materials · e.g. acrylic on canvas" value={editing.materials} onChange={(e) => updateProduct(editing.id, { materials: e.target.value })} />
              <Input placeholder="Dimensions · e.g. 18×24 in" value={editing.dimensions} onChange={(e) => updateProduct(editing.id, { dimensions: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Min ₹" inputMode="decimal" value={editing.price_min} onChange={(e) => updateProduct(editing.id, { price_min: e.target.value })} />
                <Input placeholder="Max ₹" inputMode="decimal" value={editing.price_max} onChange={(e) => updateProduct(editing.id, { price_max: e.target.value })} />
              </div>
              <Input placeholder="8–10 / month" value={editing.monthly_capacity} onChange={(e) => updateProduct(editing.id, { monthly_capacity: e.target.value })} />
              <Input placeholder="Buyers · Local market · Exhibitions" value={editing.buyers} onChange={(e) => updateProduct(editing.id, { buyers: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.can_ship} onChange={(e) => updateProduct(editing.id, { can_ship: e.target.checked })} />
                Can ship
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-field-border px-3 py-2 text-sm text-field-muted">
                <Camera className="h-4 w-4" /> Add photos
                <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => onAddPhoto(editing.id, e.target.files)} />
              </label>
            </div>
            <button
              type="button"
              className={cn(
                'mt-4 w-full rounded-xl bg-field-accent py-3 text-sm font-semibold text-white',
              )}
              onClick={() => setEditingId(null)}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
