import { z } from 'zod';

export const PHONE_REGEX = /^[6-9][0-9]{9}$/;

const craftEnum = z.enum([
  'textile',
  'painting',
  'jewellery',
  'metal_craft',
  'cane_bamboo',
  'pottery',
  'wood_craft',
  'natural_products',
  'tribal_food',
  'other',
]);

const genderEnum = z.enum(['male', 'female', 'other', 'undisclosed']);

/** Public WhatsApp-link self-registration payload (kept intentionally light). */
export const publicRegistrationSchema = z.object({
  preferred_language: z.string().min(2).max(8).default('en'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to register.' }),
  }),
  full_name: z.string().trim().min(2, 'Please enter the full name').max(120),
  phone: z.string().regex(PHONE_REGEX, 'Enter a valid 10-digit mobile number'),
  gender: genderEnum.optional(),
  tribe_community: z.string().trim().max(80).optional().or(z.literal('')),
  state: z.string().trim().min(2, 'State is required').max(80),
  district: z.string().trim().min(2, 'District is required').max(80),
  block: z.string().trim().max(80).optional().or(z.literal('')),
  village: z.string().trim().min(1, 'Village is required').max(80),
  primary_craft: craftEnum,
  product_name: z.string().trim().max(120).optional().or(z.literal('')),
  product_description: z.string().trim().max(500).optional().or(z.literal('')),
  /** data: URLs or storage paths for optional photos uploaded client-side. */
  photo_paths: z.array(z.string()).max(5).optional(),
});

export type PublicRegistrationInput = z.infer<typeof publicRegistrationSchema>;

/** Final field-verification decision submitted from the PWA. */
export const verificationSubmitSchema = z.object({
  artisan_id: z.string().uuid(),
  client_generated_id: z.string().min(1).max(120),
  decision: z.enum(['verified', 'needs_correction', 'revisit_required', 'rejected', 'duplicate']),
  reason: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  visit_date: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  gps_accuracy_m: z.number().min(0).optional().nullable(),
  consent_captured: z.boolean(),
  consent_mode: z.string().max(80).optional().nullable(),
  identity_verified: z.boolean(),
  location_verified: z.boolean(),
  craft_verified: z.boolean(),
  products_captured: z.boolean(),
  documents_checked: z.boolean(),
  duplicate_checked: z.boolean(),
  market_ready: z.boolean(),
  photo_paths: z.array(z.string()).max(10).optional(),
});

export type VerificationSubmitInput = z.infer<typeof verificationSubmitSchema>;
