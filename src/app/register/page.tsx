import { redirect } from 'next/navigation';

// Tokenless public registration is retired. Public sign-up now requires a link:
// /a/form?id=<token>. Anything hitting /register goes to the CRM.
export default function RegisterRedirect() {
  redirect('/admin');
}
