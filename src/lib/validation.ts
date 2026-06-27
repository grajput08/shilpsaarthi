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
  token: z.string().min(6).max(128).optional(),
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

export const VERIFICATION_ITEM_STATUSES = [
  'pending',
  'verified',
  'corrected',
  'rejected',
  'cancelled',
  'not_applicable',
] as const;

export const verificationItemSchema = z.object({
  item_key: z.string().min(1).max(40),
  item_label: z.string().min(1).max(80),
  status: z.enum(VERIFICATION_ITEM_STATUSES),
  note: z.string().max(2000).optional().nullable(),
  evidence_path: z.string().max(400).optional().nullable(),
});

/** Editable artisan fields a verifier may correct in the field. */
export const artisanEditSchema = z
  .object({
    full_name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().regex(PHONE_REGEX).optional().or(z.literal('')),
    gender: genderEnum.optional(),
    tribe_community: z.string().max(80).optional(),
    state: z.string().max(80).optional(),
    district: z.string().max(80).optional(),
    block: z.string().max(80).optional(),
    village: z.string().max(80).optional(),
    primary_craft: craftEnum.optional(),
  })
  .default({});

/** Final field-verification submission from the verifier PWA. */
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
  market_ready: z.boolean().default(false),
  fields: artisanEditSchema,
  items: z.array(verificationItemSchema).max(24).default([]),
  photo_paths: z.array(z.string()).max(10).optional(),
});

export type VerificationItemInput = z.infer<typeof verificationItemSchema>;
export type VerificationSubmitInput = z.infer<typeof verificationSubmitSchema>;
