import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VerifyFlow from './VerifyFlow';

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: artisan } = await supabase
    .from('artisans')
    .select('id, full_name, phone, village, district, primary_craft, status')
    .eq('id', params.id)
    .maybeSingle();

  if (!artisan) notFound();

  return (
    <VerifyFlow
      artisan={{
        id: artisan.id,
        full_name: artisan.full_name,
        village: artisan.village,
      }}
    />
  );
}
