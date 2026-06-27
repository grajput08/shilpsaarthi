import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { signPaths } from '@/lib/storage';
import ArtisanDetailView, { type ArtisanDetailData } from '@/components/admin/ArtisanDetailView';
import { type VItem } from '@/components/admin/VerificationItems';
import {
  type ConsentStatus,
  type RegistrationSource,
  type WhatsappStatus,
} from '@/lib/domain';

export default async function AdminArtisanDetail({ params }: { params: { id: string } }) {
  const supabase = createClient('admin');
  const profile = await getProfile('admin');

  const { data: artisan } = await supabase
    .from('artisans')
    .select(
      `*,
       craft_profiles(*),
       addresses(*),
       products(*),
       documents(*),
       verifications(*, verifier:profiles(full_name), verification_items(*)),
       whatsapp_messages(*)`,
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!artisan) notFound();

  const { data: verifiers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'verifier')
    .eq('is_active', true);
  const { data: templates } = await supabase
    .from('whatsapp_templates')
    .select('template_key, name')
    .order('name');

  const craft = (artisan.craft_profiles as {
    craft_category: string | null;
    sub_category: string | null;
    experience_years: number | null;
    monthly_capacity: number | null;
    group_name: string | null;
    training_needs: string | null;
  }[] | null)?.[0] ?? null;
  const address = (artisan.addresses as {
    latitude: number | null;
    longitude: number | null;
    gps_captured_at: string | null;
    address_line: string | null;
    landmark: string | null;
    pin_code: string | null;
  }[] | null)?.[0] ?? null;
  const rawProducts = (artisan.products as {
    id: string;
    name: string;
    description: string | null;
    materials: string | null;
    price_min: number | null;
    price_max: number | null;
    photo_paths: string[];
  }[] | null) ?? [];
  const documents = (artisan.documents as {
    id: string;
    doc_type: string;
    status: string;
    reference_masked: string | null;
  }[] | null) ?? [];
  const verifications = (artisan.verifications as {
    id: string;
    visit_date: string;
    decision: string | null;
    admin_override: boolean | null;
    notes: string | null;
    reason: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    photo_paths: string[];
    verifier: { full_name: string } | null;
    verification_items: VItem[] | null;
  }[] | null) ?? [];
  const messages = (artisan.whatsapp_messages as {
    id: string;
    body: string;
    status: string;
    sent_at: string | null;
    template_key: string | null;
  }[] | null) ?? [];

  const latestVerification = [...verifications].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0] ?? null;

  const allProductPhotos = rawProducts.flatMap((p) => p.photo_paths ?? []);
  const allVisitPhotos = verifications.flatMap((v) => v.photo_paths ?? []);
  const [signedProductPhotos, signedVisitPhotos] = await Promise.all([
    signPaths('product-photos', allProductPhotos),
    signPaths('artisan-photos', allVisitPhotos),
  ]);

  const productPhotoMap = new Map(allProductPhotos.map((p, i) => [p, signedProductPhotos[i]]));
  const visitPhotoMap = new Map(allVisitPhotos.map((p, i) => [p, signedVisitPhotos[i]]));

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    materials: p.materials,
    price_min: p.price_min,
    price_max: p.price_max,
    photoUrls: (p.photo_paths ?? []).map((path) => productPhotoMap.get(path)).filter(Boolean) as string[],
  }));

  const avatarUrl =
    products.find((p) => p.photoUrls[0])?.photoUrls[0] ??
    verifications
      .flatMap((v) => v.photo_paths ?? [])
      .map((path) => visitPhotoMap.get(path))
      .find(Boolean) ??
    null;

  const idVerified = documents.some((d) => d.doc_type === 'id_proof' && d.status === 'available');

  const detailData: ArtisanDetailData = {
    artisan: {
      id: artisan.id,
      artisan_code: artisan.artisan_code,
      full_name: artisan.full_name,
      phone: artisan.phone,
      alternate_phone: artisan.alternate_phone,
      gender: artisan.gender,
      date_of_birth: artisan.date_of_birth,
      tribe_community: artisan.tribe_community,
      primary_craft: artisan.primary_craft,
      status: artisan.status,
      registration_source: artisan.registration_source as RegistrationSource,
      consent_status: artisan.consent_status as ConsentStatus,
      preferred_language: artisan.preferred_language,
      state: artisan.state,
      district: artisan.district,
      block: artisan.block,
      village: artisan.village,
      priority: artisan.priority,
      data_completeness: artisan.data_completeness,
      duplicate_risk: artisan.duplicate_risk,
      notes: artisan.notes,
      created_at: artisan.created_at,
    },
    craft,
    address,
    products,
    documents,
    verifications: verifications.map((v) => ({
      id: v.id,
      visit_date: v.visit_date,
      decision: v.decision,
      admin_override: v.admin_override,
      notes: v.notes,
      reason: v.reason,
      latitude: v.latitude,
      longitude: v.longitude,
      created_at: v.created_at,
      verifierName: v.verifier?.full_name ?? null,
      photoUrls: (v.photo_paths ?? []).map((path) => visitPhotoMap.get(path)).filter(Boolean) as string[],
    })),
    messages: messages.map((m) => ({ ...m, status: m.status as WhatsappStatus })),
    avatarUrl,
    idVerified,
    latestVerification: latestVerification
      ? {
          id: latestVerification.id,
          admin_override: Boolean(latestVerification.admin_override),
          decision: latestVerification.decision,
          items: latestVerification.verification_items ?? [],
        }
      : null,
    verifiers: verifiers ?? [],
    templates: templates ?? [],
    canAssign: profile?.role === 'admin' || profile?.role === 'district_officer',
    canOverride: profile?.role === 'admin',
  };

  return <ArtisanDetailView data={detailData} />;
}
