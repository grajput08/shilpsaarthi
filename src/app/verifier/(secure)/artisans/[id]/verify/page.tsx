import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import VerifyFlow from './VerifyFlow';
import type { CraftCategory } from '@/lib/domain';

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const profile = await getProfile();
  const { data: artisan } = await supabase
    .from('artisans')
    .select('id, full_name, phone, gender, tribe_community, state, district, block, village, primary_craft, status, craft_profiles(*), products(*), documents(doc_type, status, reference_masked)')
    .eq('id', params.id)
    .maybeSingle();

  if (!artisan) notFound();

  const craftRow = Array.isArray(artisan.craft_profiles)
    ? artisan.craft_profiles[0]
    : artisan.craft_profiles;
  const docRows = (artisan.documents as { doc_type: string; status: string; reference_masked: string | null }[] | null) ?? [];
  const idProof = docRows.find((d) => d.doc_type === 'id_proof');
  const productRows = (artisan.products as {
    id: string;
    name: string;
    category: CraftCategory | null;
    description: string | null;
    materials: string | null;
    dimensions: string | null;
    price_min: number | null;
    price_max: number | null;
    monthly_capacity: number | null;
    buyers: string[] | null;
    packaging_available: boolean | null;
    can_ship: boolean | null;
    photo_paths: string[] | null;
  }[] | null) ?? [];

  return (
    <VerifyFlow
      verifierName={profile?.full_name ?? 'Field Verifier'}
      artisan={{
        id: artisan.id,
        full_name: artisan.full_name,
        phone: artisan.phone,
        gender: artisan.gender,
        tribe_community: artisan.tribe_community,
        state: artisan.state,
        district: artisan.district,
        block: artisan.block,
        village: artisan.village,
        primary_craft: artisan.primary_craft,
        idProofVerified: idProof?.status === 'available',
        idProofMasked: idProof?.reference_masked ?? null,
      }}
      initialCraft={
        craftRow
          ? {
              sub_category: craftRow.sub_category ?? '',
              experience_years: craftRow.experience_years != null ? String(craftRow.experience_years) : '',
              monthly_capacity: craftRow.monthly_capacity != null ? String(craftRow.monthly_capacity) : '',
              learned_from: craftRow.learned_from ?? '',
              group_name: craftRow.group_name ?? '',
              craft_demonstrated: false,
              craft_matches: false,
            }
          : undefined
      }
      initialProducts={productRows.map((p) => ({
        id: p.id,
        dbId: p.id,
        name: p.name,
        category: p.category ?? '',
        description: p.description ?? '',
        materials: p.materials ?? '',
        dimensions: p.dimensions ?? '',
        price_min: p.price_min != null ? String(p.price_min) : '',
        price_max: p.price_max != null ? String(p.price_max) : '',
        monthly_capacity: p.monthly_capacity != null ? String(p.monthly_capacity) : '',
        buyers: (p.buyers ?? []).join(' · '),
        packaging_available: p.packaging_available,
        can_ship: p.can_ship ?? false,
        photo_paths: p.photo_paths ?? [],
      }))}
    />
  );
}
