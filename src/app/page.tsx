import { redirect } from 'next/navigation';

// Root is the CRM by default. /admin enforces auth (and bounces verifiers to /verifier).
export default function HomePage() {
  redirect('/admin');
}
