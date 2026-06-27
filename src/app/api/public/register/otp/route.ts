import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PHONE_REGEX } from '@/lib/validation';
import { sendRegistrationOtp, verifyRegistrationOtp } from '@/lib/adapters/registration-otp';

export const runtime = 'nodejs';

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('send'),
    phone: z.string().regex(PHONE_REGEX, 'Enter a valid 10-digit mobile number.'),
  }),
  z.object({
    action: z.literal('verify'),
    phone: z.string().regex(PHONE_REGEX, 'Enter a valid 10-digit mobile number.'),
    code: z.string().trim().min(4).max(8),
  }),
]);

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  if (parsed.data.action === 'send') {
    const result = sendRegistrationOtp(parsed.data.phone);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }
    return NextResponse.json({ ok: true, devCode: result.devCode });
  }

  const result = verifyRegistrationOtp(parsed.data.phone, parsed.data.code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ ok: true, verified: true });
}
