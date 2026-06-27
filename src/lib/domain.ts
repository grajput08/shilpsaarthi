import type { Database } from './supabase/database.types';

export type Enums = Database['public']['Enums'];
export type ArtisanStatus = Enums['artisan_status'];
export type AppRole = Enums['app_role'];
export type CraftCategory = Enums['craft_category'];
export type RegistrationSource = Enums['registration_source'];
export type Gender = Enums['gender_type'];
export type DocumentType = Enums['document_type'];
export type DocStatus = Enums['doc_status'];
export type VerificationDecision = Enums['verification_decision'];
export type ConsentStatus = Enums['consent_status'];
export type AssignmentStatus = Enums['assignment_status'];
export type WhatsappStatus = Enums['whatsapp_status'];
export type PriorityLevel = Enums['priority_level'];

type ChipTone = 'gray' | 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'teal';

export const ARTISAN_STATUS: Record<ArtisanStatus, { label: string; tone: ChipTone }> = {
  lead_created: { label: 'Lead Created', tone: 'gray' },
  contacted: { label: 'Contacted', tone: 'gray' },
  registration_started: { label: 'Registration Started', tone: 'blue' },
  registration_submitted: { label: 'Registration Submitted', tone: 'blue' },
  pending_verification: { label: 'Pending Verification', tone: 'amber' },
  assigned: { label: 'Assigned to Verifier', tone: 'amber' },
  verification_in_progress: { label: 'Verification In Progress', tone: 'teal' },
  verified: { label: 'Verified', tone: 'green' },
  needs_correction: { label: 'Needs Correction', tone: 'amber' },
  revisit_required: { label: 'Revisit Required', tone: 'amber' },
  rejected: { label: 'Rejected', tone: 'red' },
  duplicate: { label: 'Duplicate', tone: 'purple' },
  market_ready: { label: 'Market Ready', tone: 'green' },
};

/** Display order used by the pipeline funnel + status filters. */
export const ARTISAN_STATUS_ORDER: ArtisanStatus[] = [
  'lead_created',
  'contacted',
  'registration_started',
  'registration_submitted',
  'pending_verification',
  'assigned',
  'verification_in_progress',
  'verified',
  'needs_correction',
  'revisit_required',
  'rejected',
  'duplicate',
  'market_ready',
];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: 'Administrator',
  operator: 'Call-Center Operator',
  verifier: 'Field Verifier',
  district_officer: 'District Officer',
};

export const CRAFT_CATEGORY: Record<CraftCategory, string> = {
  textile: 'Textile',
  painting: 'Painting',
  jewellery: 'Jewellery',
  metal_craft: 'Metal Craft',
  cane_bamboo: 'Cane / Bamboo',
  pottery: 'Pottery',
  wood_craft: 'Wood Craft',
  natural_products: 'Natural Products',
  tribal_food: 'Tribal Food Products',
  other: 'Other',
};

export const REGISTRATION_SOURCE: Record<RegistrationSource, string> = {
  public_link: 'Public Link',
  whatsapp_self: 'WhatsApp Self-Registration',
  call_center: 'Call Center',
  admin_manual: 'Admin (manual)',
  csv_import: 'CSV Import',
  ngo: 'NGO',
  campaign: 'Campaign',
};

export const GENDER: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  undisclosed: 'Prefer not to say',
};

export const DOCUMENT_TYPE: Record<DocumentType, string> = {
  id_proof: 'ID Proof',
  address_proof: 'Address Proof',
  caste_tribe_certificate: 'Caste / Tribe Certificate',
  bank_passbook: 'Bank Passbook',
  pan: 'PAN',
  gst: 'GST',
  shg_membership: 'SHG / Cooperative Membership',
  training_certificate: 'Training Certificate',
  artisan_card: 'Artisan Card',
  other: 'Other',
};

export const DOC_STATUS: Record<DocStatus, { label: string; tone: ChipTone }> = {
  available: { label: 'Available', tone: 'green' },
  not_available: { label: 'Not Available', tone: 'red' },
  not_asked: { label: 'Not Asked', tone: 'gray' },
  not_required: { label: 'Not Required', tone: 'blue' },
};

export const VERIFICATION_DECISION: Record<VerificationDecision, { label: string; tone: ChipTone }> = {
  verified: { label: 'Verified', tone: 'green' },
  needs_correction: { label: 'Needs Correction', tone: 'amber' },
  revisit_required: { label: 'Revisit Required', tone: 'amber' },
  rejected: { label: 'Rejected', tone: 'red' },
  duplicate: { label: 'Duplicate', tone: 'purple' },
};

export const CONSENT_STATUS: Record<ConsentStatus, string> = {
  not_captured: 'Not Captured',
  granted: 'Granted',
  declined: 'Declined',
};

export const PRIORITY: Record<PriorityLevel, { label: string; tone: ChipTone }> = {
  high: { label: 'High', tone: 'red' },
  normal: { label: 'Normal', tone: 'gray' },
  revisit: { label: 'Revisit', tone: 'amber' },
  correction: { label: 'Correction', tone: 'amber' },
};

export const WHATSAPP_STATUS: Record<WhatsappStatus, { label: string; tone: ChipTone }> = {
  queued: { label: 'Queued', tone: 'gray' },
  sent: { label: 'Sent', tone: 'blue' },
  delivered: { label: 'Delivered', tone: 'teal' },
  read: { label: 'Read', tone: 'green' },
  failed: { label: 'Failed', tone: 'red' },
  replied: { label: 'Replied', tone: 'purple' },
};

export const WHATSAPP_TEMPLATE_LABEL: Record<string, string> = {
  registration_invite: 'Registration invitation',
  consent_notice: 'Consent & information notice',
  registration_confirmation: 'Registration confirmation',
  visit_reminder: 'Verification visit reminder',
  missing_document: 'Missing document reminder',
  correction_request: 'Correction request',
  verified_confirmation: 'Verified confirmation',
  scheme_update: 'Scheme / exhibition update',
};

export const LANGUAGES: { code: string; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'sat', label: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
];

export const REVISIT_REASONS = [
  'Artisan not at home/workplace',
  'Wrong location',
  'Documents not available',
  'Product not available for photo',
  'Consent not given',
  'Network issue',
  'Language issue',
  'Needs supervisor',
];

export const DECISION_REASONS = [
  'artisan_unavailable',
  'document_missing',
  'location_mismatch',
  'identity_mismatch',
  'duplicate_found',
  'not_an_artisan',
  'wrong_phone',
  'incomplete_product_details',
  'other',
];

export const CALL_OUTCOMES = [
  'Connected',
  'Not reachable',
  'Wrong number',
  'Call back later',
  'Interested',
  'Not interested',
  'Already registered',
  'Language barrier',
  'Deceased/migrated/not available',
  'Other',
];

/** Statuses considered "open" in the verification queue. */
export const OPEN_VERIFICATION_STATUSES: ArtisanStatus[] = [
  'pending_verification',
  'assigned',
  'verification_in_progress',
  'needs_correction',
  'revisit_required',
];

export function enumOptions<T extends string>(map: Record<T, unknown>): T[] {
  return Object.keys(map) as T[];
}
