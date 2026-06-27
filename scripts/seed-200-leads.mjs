#!/usr/bin/env node
/**
 * Clears artisan-related data and seeds demo leads with weighted-random distribution
 * so dashboard charts (state, language, craft, channel, monthly trend) look realistic.
 *
 * Usage: node scripts/seed-200-leads.mjs
 *        SEED_COUNT=600 node scripts/seed-200-leads.mjs
 * Requires: local Supabase running, SUPABASE_SERVICE_ROLE_KEY in .env or .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(ROOT, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY — set it in .env or .env.local');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TOTAL = Number(process.env.SEED_COUNT) || 500;

/** Deterministic-ish RNG — different run each time, charts vary on re-seed. */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(Date.now() ^ 0x9e3779b9);

function weightedPick(items, getWeight = (x) => x.weight ?? 1) {
  const total = items.reduce((s, x) => s + getWeight(x), 0);
  let r = rng() * total;
  for (const item of items) {
    r -= getWeight(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Hotspot states dominate the bar chart; others appear as long tail. */
const STATE_WEIGHT = {
  'Madhya Pradesh': 5,
  Odisha: 4.5,
  Gujarat: 4,
  Rajasthan: 3.5,
  Maharashtra: 3.5,
  Karnataka: 3,
  'West Bengal': 2.8,
  Jharkhand: 2.5,
  'Andhra Pradesh': 2.2,
  Telangana: 2,
  Assam: 1.8,
  'Tamil Nadu': 1.8,
};

const LANGUAGE_WEIGHTS = [
  { code: 'hi', weight: 36 },
  { code: 'te', weight: 12 },
  { code: 'bn', weight: 10 },
  { code: 'mr', weight: 9 },
  { code: 'or', weight: 8 },
  { code: 'gu', weight: 7 },
  { code: 'kn', weight: 6 },
  { code: 'ta', weight: 6 },
  { code: 'en', weight: 5 },
  { code: 'ml', weight: 4 },
  { code: 'pa', weight: 4 },
  { code: 'sat', weight: 4 },
  { code: 'as', weight: 3 },
  { code: 'ur', weight: 3 },
];

const CRAFT_WEIGHTS = {
  textile: 24,
  pottery: 16,
  cane_bamboo: 13,
  painting: 11,
  wood_craft: 10,
  jewellery: 9,
  metal_craft: 7,
  natural_products: 6,
  tribal_food: 3,
  other: 1,
};

const SOURCE_WEIGHTS = {
  whatsapp_self: 34,
  call_center: 26,
  public_link: 16,
  admin_manual: 9,
  ngo: 8,
  campaign: 5,
  csv_import: 2,
};

const STATUS_WEIGHTS = {
  lead_created: 18,
  contacted: 15,
  registration_started: 13,
  registration_submitted: 11,
  pending_verification: 9,
  assigned: 8,
  verification_in_progress: 7,
  verified: 6,
  needs_correction: 4,
  revisit_required: 3,
  rejected: 3,
  duplicate: 2,
  market_ready: 2,
};

/** Uneven monthly onboarding — rising trend toward current month. */
const MONTH_WEIGHTS = [10, 14, 22, 30, 42, 58];

function pickLocation() {
  return weightedPick(
    LOCATIONS.map((loc) => ({ ...loc, weight: STATE_WEIGHT[loc.state] ?? 1 + rng() * 0.5 })),
  );
}

function pickLanguage(loc) {
  if (rng() < 0.68) return loc.lang;
  return weightedPick(LANGUAGE_WEIGHTS.map((l) => ({ value: l.code, weight: l.weight }))).value;
}

function pickCraft() {
  return weightedPick(CRAFTS.map((c) => ({ value: c, weight: CRAFT_WEIGHTS[c] ?? 5 }))).value;
}

function pickSource() {
  return weightedPick(SOURCES.map((s) => ({ value: s, weight: SOURCE_WEIGHTS[s] ?? 5 }))).value;
}

function buildStatusList(total) {
  const list = [...STATUSES];
  while (list.length < total) {
    list.push(
      weightedPick(STATUSES.map((s) => ({ value: s, weight: STATUS_WEIGHTS[s] ?? 5 }))).value,
    );
  }
  return shuffle(list);
}

function randomCreatedAt() {
  const now = new Date();
  const monthIdx = weightedPick(MONTH_WEIGHTS.map((w, i) => ({ value: i, weight: w }))).value;
  const monthsAgo = 5 - monthIdx;
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  d.setDate(1 + Math.floor(rng() * 27));
  d.setHours(8 + Math.floor(rng() * 10), Math.floor(rng() * 60), 0, 0);
  return d.toISOString();
}

const USERS = {
  admin: '11111111-1111-1111-1111-111111111111',
  operator: '22222222-2222-2222-2222-222222222222',
  verifier1: '33333333-3333-3333-3333-333333333333',
  verifier2: '44444444-4444-4444-4444-444444444444',
  officer: '55555555-5555-5555-5555-555555555555',
};

const STATUSES = [
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

const CRAFTS = [
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
];

const SOURCES = [
  'csv_import',
  'call_center',
  'whatsapp_self',
  'admin_manual',
  'ngo',
  'campaign',
  'public_link',
];

const TRIBES = [
  'Gond', 'Baiga', 'Santhal', 'Munda', 'Bhil', 'Kol', 'Oraon', 'Bharia',
  'Warli', 'Toda', 'Irula', 'Khasi', 'Garhwali', 'Bodo', 'Rabha', 'Mishing',
];
const FIRST = [
  'Budhni',
  'Ramlal',
  'Sukhiya',
  'Mangal',
  'Phoolwati',
  'Jhitku',
  'Lakshmi',
  'Sukhram',
  'Chunni',
  'Birsa',
  'Sonbai',
  'Geeta',
  'Hari',
  'Kamla',
  'Devki',
  'Ramu',
  'Sita',
  'Motilal',
  'Parvati',
  'Shankar',
];
const LAST = [
  'Bai',
  'Dhurve',
  'Devi',
  'Singh',
  'Maran',
  'Tekam',
  'Maravi',
  'Munda',
  'Uikey',
  'Marko',
  'Pradhan',
  'Kumar',
  'Yadav',
  'Nag',
  'Porte',
];

/** Pan-India demo locations — states, districts, and preferred language per region. */
const LOCATIONS = [
  // North
  { state: 'Jammu & Kashmir', district: 'Anantnag', block: 'Kokernag', village: 'Wangam', lat: 33.72, lng: 75.12, pin: '192202', lang: 'ur' },
  { state: 'Himachal Pradesh', district: 'Kinnaur', block: 'Pooh', village: 'Khab', lat: 31.93, lng: 78.53, pin: '172114', lang: 'hi' },
  { state: 'Punjab', district: 'Amritsar', block: 'Ajnala', village: 'Dhanoe Kalan', lat: 31.63, lng: 74.87, pin: '143601', lang: 'pa' },
  { state: 'Uttarakhand', district: 'Uttarkashi', block: 'Mori', village: 'Netwar', lat: 30.73, lng: 78.03, pin: '249128', lang: 'hi' },
  { state: 'Rajasthan', district: 'Udaipur', block: 'Girwa', village: 'Delwara', lat: 24.57, lng: 73.7, pin: '313011', lang: 'hi' },
  // East
  { state: 'West Bengal', district: 'Bankura', block: 'Sankrail', village: 'Panchmura', lat: 23.08, lng: 87.2, pin: '722150', lang: 'bn' },
  { state: 'Assam', district: 'Kamrup', block: 'Chaygaon', village: 'Sualkuchi', lat: 26.17, lng: 91.57, pin: '781103', lang: 'as' },
  { state: 'Odisha', district: 'Mayurbhanj', block: 'Baripada', village: 'Tato', lat: 21.93, lng: 86.72, pin: '757049', lang: 'or' },
  { state: 'Jharkhand', district: 'Khunti', block: 'Murhu', village: 'Tapkara', lat: 23.08, lng: 85.28, pin: '835214', lang: 'sat' },
  { state: 'Bihar', district: 'Madhubani', block: 'Rajnagar', village: 'Ranti', lat: 26.35, lng: 86.07, pin: '847211', lang: 'hi' },
  // Central
  { state: 'Madhya Pradesh', district: 'Dindori', block: 'Shahpura', village: 'Karanjia', lat: 22.94, lng: 81.08, pin: '481990', lang: 'hi' },
  { state: 'Madhya Pradesh', district: 'Mandla', block: 'Bichhiya', village: 'Sijhora', lat: 22.42, lng: 80.69, pin: '481669', lang: 'hi' },
  { state: 'Chhattisgarh', district: 'Bastar', block: 'Tokapal', village: 'Dilmili', lat: 19.07, lng: 81.95, pin: '494442', lang: 'hi' },
  // West
  { state: 'Gujarat', district: 'Kutch', block: 'Bhuj', village: 'Nirona', lat: 23.25, lng: 69.67, pin: '370030', lang: 'gu' },
  { state: 'Maharashtra', district: 'Chandrapur', block: 'Gadchiroli', village: 'Wadgaon', lat: 20.3, lng: 79.43, pin: '442707', lang: 'mr' },
  { state: 'Goa', district: 'South Goa', block: 'Sanguem', village: 'Cotigao', lat: 15.07, lng: 74.23, pin: '403704', lang: 'en' },
  // South
  { state: 'Karnataka', district: 'Uttara Kannada', block: 'Sirsi', village: 'Banavasi', lat: 14.53, lng: 74.72, pin: '581318', lang: 'kn' },
  { state: 'Kerala', district: 'Thrissur', block: 'Kodungallur', village: 'Chennamangalam', lat: 10.2, lng: 76.22, pin: '680312', lang: 'ml' },
  { state: 'Tamil Nadu', district: 'Dindigul', block: 'Palani', village: 'Kodaikanal foothills', lat: 10.24, lng: 77.52, pin: '624613', lang: 'ta' },
  { state: 'Andhra Pradesh', district: 'Visakhapatnam', block: 'Araku', village: 'Chaparai', lat: 18.35, lng: 83.1, pin: '531149', lang: 'te' },
  { state: 'Telangana', district: 'Bhadradri Kothagudem', block: 'Dummugudem', village: 'Cherla', lat: 17.62, lng: 81.1, pin: '507133', lang: 'te' },
  // North-East
  { state: 'Manipur', district: 'Imphal East', block: 'Sawombung', village: 'Andro', lat: 24.78, lng: 94.08, pin: '795132', lang: 'hi' },
  { state: 'Tripura', district: 'West Tripura', block: 'Belonia', village: 'Jolaibari', lat: 23.17, lng: 91.45, pin: '799155', lang: 'bn' },
  { state: 'Nagaland', district: 'Kohima', block: 'Khonoma', village: 'Khonoma', lat: 25.67, lng: 94.02, pin: '797002', lang: 'en' },
  { state: 'Meghalaya', district: 'East Khasi Hills', block: 'Mawphlang', village: 'Mawlynnong', lat: 25.2, lng: 91.72, pin: '793110', lang: 'en' },
  { state: 'Sikkim', district: 'East Sikkim', block: 'Rongli', village: 'Lingtam', lat: 27.13, lng: 88.61, pin: '737131', lang: 'hi' },
];


const imageCache = new Map();

/** Tiny fallback if a remote fetch fails (offline seed). */
const FALLBACK_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
  'base64',
);

function lockSeed(kind, craft, index) {
  let h = 0;
  for (const c of `${kind}-${craft}-${index}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Free photo URL — Picsum (real photos, free, always available). */
function freeImageUrl(kind, craft, index) {
  const lock = lockSeed(kind, craft, index);
  return `https://picsum.photos/seed/shilpsaarthi-${kind}-${craft}-${index}-${lock}/640/480.jpg`;
}

async function fetchFreeImage(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'ShilpSaarthi-Seed/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 2000) throw new Error(`Image too small from ${url}`);
  const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg';
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const data = { buffer, contentType, ext };
  imageCache.set(url, data);
  return data;
}

async function uploadImage(bucket, artisanId, folder, index, craft, kind) {
  if (process.env.SKIP_IMAGES === '1') {
    return `${artisanId}/${folder}/placeholder-${index}.jpg`;
  }
  const url = freeImageUrl(kind, craft, index);
  let image;
  try {
    image = await fetchFreeImage(url);
  } catch (err) {
    console.warn(`  image fallback (${kind}): ${err.message}`);
    image = { buffer: FALLBACK_JPEG, contentType: 'image/jpeg', ext: 'jpg' };
  }
  const path = `${artisanId}/${folder}/${Date.now()}-${index}.${image.ext}`;
  const { error } = await admin.storage.from(bucket).upload(path, image.buffer, {
    contentType: image.contentType,
    upsert: true,
  });
  if (error) throw new Error(`upload ${bucket}/${path}: ${error.message}`);
  return path;
}

function artisanId(n) {
  return `b2b2b2b2-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

function phone(n) {
  return String(9100000000 + n).slice(0, 10);
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function completenessForStatus(status) {
  const map = {
    lead_created: 15,
    contacted: 25,
    registration_started: 35,
    registration_submitted: 50,
    pending_verification: 60,
    assigned: 65,
    verification_in_progress: 72,
    verified: 95,
    needs_correction: 75,
    revisit_required: 48,
    rejected: 22,
    duplicate: 30,
    market_ready: 100,
  };
  return map[status] ?? 40;
}

function buildArtisans(total) {
  const statusSlots = buildStatusList(total);
  const artisans = [];

  for (let i = 1; i <= total; i++) {
    const status = statusSlots[i - 1];
    const loc = pickLocation();
    const craft = pickCraft();
    const verifier =
      ['assigned', 'verification_in_progress', 'verified', 'needs_correction', 'revisit_required', 'market_ready'].includes(status)
        ? rng() < 0.5
          ? USERS.verifier1
          : USERS.verifier2
        : null;

    artisans.push({
      id: artisanId(i),
      full_name: `${pick(FIRST, i)} ${pick(LAST, i + 7)}`,
      phone: phone(i),
      alternate_phone: rng() < 0.14 ? phone(i + 500) : null,
      gender: rng() < 0.48 ? 'female' : 'male',
      date_of_birth: `${1970 + Math.floor(rng() * 30)}-${String(Math.floor(rng() * 12) + 1).padStart(2, '0')}-${String(Math.floor(rng() * 28) + 1).padStart(2, '0')}`,
      tribe_community: pick(TRIBES, Math.floor(rng() * TRIBES.length)),
      primary_craft: craft,
      status,
      registration_source: pickSource(),
      consent_status: ['lead_created', 'contacted', 'rejected'].includes(status)
        ? 'not_captured'
        : status === 'rejected'
          ? 'declined'
          : 'granted',
      preferred_language: pickLanguage(loc),
      assigned_verifier: verifier,
      state: loc.state,
      district: loc.district,
      block: loc.block,
      village: loc.village,
      priority:
        status === 'needs_correction'
          ? 'correction'
          : status === 'revisit_required'
            ? 'revisit'
            : rng() < 0.08
              ? 'high'
              : 'normal',
      data_completeness: Math.min(100, Math.max(0, completenessForStatus(status) + Math.floor(rng() * 8) - 4)),
      notes: status === 'duplicate' ? `Likely duplicate of lead #${i - 1}` : rng() < 0.22 ? 'Demo seed note' : null,
      created_by: rng() < 0.35 ? USERS.operator : rng() < 0.2 ? USERS.admin : null,
      created_at: randomCreatedAt(),
      _loc: loc,
      _craft: craft,
    });
  }

  // Make a few explicit duplicate pairs (same phone)
  for (let d = 0; d < 5; d++) {
    const idx = total - 5 + d;
    artisans[idx].phone = artisans[idx - 1].phone;
    artisans[idx].status = 'duplicate';
    artisans[idx].data_completeness = 30;
  }

  return artisans;
}

async function clearArtisanData() {
  console.log('Clearing existing artisan data…');

  await admin.from('audit_logs').delete().in('entity_type', ['artisan', 'whatsapp', 'verification', 'verification_item']);
  await admin.from('registration_tokens').delete().neq('token', '');

  const { error: delErr } = await admin.from('artisans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) throw new Error(`clear artisans: ${delErr.message}`);

  for (const bucket of ['artisan-photos', 'product-photos', 'document-images']) {
    try {
      const { data: top } = await admin.storage.from(bucket).list('', { limit: 1000 });
      for (const folder of top ?? []) {
        const { data: files } = await admin.storage.from(bucket).list(folder.name, { limit: 1000 });
        if (files?.length) {
          await admin.storage.from(bucket).remove(files.map((f) => `${folder.name}/${f.name}`));
        }
      }
    } catch {
      // Remote storage listing can fail during bulk re-seed — artisan rows are still cleared below.
    }
  }
}

async function seedRelated(artisan) {
  const { id, status, _loc, _craft } = artisan;
  const verifier = artisan.assigned_verifier ?? USERS.verifier1;

  const needsProfile = !['lead_created', 'contacted'].includes(status);
  if (needsProfile) {
    await admin.from('craft_profiles').insert({
      artisan_id: id,
      craft_category: _craft,
      sub_category: `${_craft} traditional work`,
      experience_years: 5 + (parseInt(id.slice(-2), 16) % 25),
      learned_from: 'Family tradition',
      works_in_group: parseInt(id.slice(-1), 16) % 2 === 0,
      group_name: parseInt(id.slice(-1), 16) % 2 === 0 ? `${_loc.village} SHG` : null,
      monthly_capacity: 10 + (parseInt(id.slice(-2), 16) % 40),
      seasonal_availability: 'All year',
      tools_used: 'Hand tools, local materials',
      raw_materials: 'Locally sourced',
      training_needs: status === 'market_ready' ? 'None' : 'Design & marketing',
    });
  }

  const needsAddress = [
    'registration_submitted',
    'pending_verification',
    'assigned',
    'verification_in_progress',
    'verified',
    'needs_correction',
    'revisit_required',
    'market_ready',
  ].includes(status);

  if (needsAddress) {
    await admin.from('addresses').insert({
      artisan_id: id,
      state: _loc.state,
      district: _loc.district,
      block: _loc.block,
      gram_panchayat: _loc.block,
      village: _loc.village,
      pin_code: _loc.pin,
      address_line: `Near main road, ${_loc.village}`,
      landmark: 'Community hall',
      latitude: _loc.lat + (Math.random() - 0.5) * 0.01,
      longitude: _loc.lng + (Math.random() - 0.5) * 0.01,
      gps_accuracy_m: 5 + (parseInt(id.slice(-1), 16) % 8),
      gps_captured_at: new Date().toISOString(),
      captured_by: verifier,
    });
  }

  const needsProducts = ['verified', 'market_ready', 'verification_in_progress', 'needs_correction'].includes(status);
  if (needsProducts) {
    const photo1 = await uploadImage('product-photos', id, 'catalog', 1, _craft, 'product');
    const photo2 = await uploadImage('product-photos', id, 'catalog', 2, _craft, 'product');
    await admin.from('products').insert({
      artisan_id: id,
      name: `${_craft.replace('_', ' ')} sample product`,
      category: _craft,
      description: `Handcrafted ${_craft} item from ${_loc.village}`,
      materials: 'Natural / local materials',
      dimensions: 'Medium',
      price_min: 200 + (parseInt(id.slice(-2), 16) % 500),
      price_max: 800 + (parseInt(id.slice(-2), 16) % 1200),
      min_order_qty: 1,
      monthly_capacity: 20,
      production_time: '3 days',
      buyers: ['local_market', 'exhibitions'],
      packaging_available: true,
      can_ship: status === 'market_ready',
      quality_notes: 'Good quality demo product',
      photo_paths: [photo1, photo2],
    });
  }

  const needsDocs = ['verified', 'market_ready', 'verification_in_progress', 'needs_correction', 'pending_verification', 'assigned'].includes(status);
  if (needsDocs) {
    const docPhoto = await uploadImage('document-images', id, 'id', 1, _craft, 'document');
    await admin.from('documents').insert([
      {
        artisan_id: id,
        doc_type: 'id_proof',
        status: 'available',
        reference_masked: 'XXXX-XXXX-' + String(parseInt(id.slice(-4), 16) % 10000).padStart(4, '0'),
        file_path: docPhoto,
        checked_by: verifier,
      },
      {
        artisan_id: id,
        doc_type: 'bank_passbook',
        status: status === 'verified' || status === 'market_ready' ? 'available' : 'not_asked',
        checked_by: verifier,
      },
      {
        artisan_id: id,
        doc_type: 'caste_tribe_certificate',
        status: status === 'market_ready' ? 'available' : 'not_asked',
        checked_by: verifier,
      },
    ]);
  }

  const needsAssignment = ['assigned', 'verification_in_progress', 'verified', 'needs_correction', 'revisit_required', 'market_ready'].includes(status);
  if (needsAssignment) {
    const assignmentStatus =
      status === 'verified' || status === 'market_ready'
        ? 'completed'
        : status === 'verification_in_progress'
          ? 'in_progress'
          : 'assigned';
    await admin.from('assignments').insert({
      artisan_id: id,
      verifier_id: verifier,
      assigned_by: USERS.admin,
      status: assignmentStatus,
      priority: artisan.priority,
      due_date: new Date(Date.now() + (assignmentStatus === 'completed' ? -5 : 2) * 86400000).toISOString().slice(0, 10),
      supervisor_note: assignmentStatus === 'completed' ? null : 'Demo assignment',
    });
  }

  const needsVerification = [
    'verification_in_progress',
    'verified',
    'needs_correction',
    'revisit_required',
    'rejected',
    'market_ready',
  ].includes(status);

  if (needsVerification) {
    const visitPhoto = await uploadImage('artisan-photos', id, 'visit', 1, _craft, 'visit');
    const productPhoto = await uploadImage('artisan-photos', id, 'product', 2, _craft, 'product');

    const decisionMap = {
      verified: 'verified',
      market_ready: 'verified',
      needs_correction: 'needs_correction',
      revisit_required: 'revisit_required',
      rejected: 'rejected',
      verification_in_progress: null,
    };

    const decision = decisionMap[status] ?? null;
    const { data: verification, error: vErr } = await admin
      .from('verifications')
      .insert({
        artisan_id: id,
        verifier_id: verifier,
        visit_date: new Date().toISOString().slice(0, 10),
        latitude: _loc.lat,
        longitude: _loc.lng,
        gps_accuracy_m: 6,
        consent_captured: status !== 'rejected',
        consent_mode: 'Verifier read aloud',
        consent_timestamp: new Date().toISOString(),
        identity_verified: !['revisit_required', 'rejected'].includes(status),
        location_verified: status === 'needs_correction' ? false : !['revisit_required', 'rejected'].includes(status),
        craft_verified: ['verified', 'market_ready', 'needs_correction'].includes(status),
        products_captured: ['verified', 'market_ready', 'needs_correction'].includes(status),
        documents_checked: ['verified', 'market_ready'].includes(status),
        duplicate_checked: true,
        market_ready: status === 'market_ready',
        decision,
        reason: status === 'needs_correction' ? 'location_mismatch' : status === 'revisit_required' ? 'artisan_unavailable' : status === 'rejected' ? 'not_an_artisan' : null,
        notes: `Demo verification for ${status}`,
        photo_paths: [visitPhoto, productPhoto],
        sync_status: 'synced',
      })
      .select('id')
      .single();
    if (vErr) throw new Error(`verification ${id}: ${vErr.message}`);

    if (['verified', 'market_ready', 'needs_correction'].includes(status)) {
      const items =
        status === 'needs_correction'
          ? [
              ['identity', 'Identity', 'verified'],
              ['address', 'Address & GPS', 'rejected'],
              ['craft', 'Craft', 'verified'],
            ]
          : [
              ['identity', 'Identity', 'verified'],
              ['contact', 'Contact / phone', 'verified'],
              ['address', 'Address & GPS', 'verified'],
              ['craft', 'Craft', 'verified'],
              ['products', 'Products', 'verified'],
              ['documents', 'Documents', 'verified'],
            ];
      await admin.from('verification_items').insert(
        items.map(([item_key, item_label, st]) => ({
          verification_id: verification.id,
          artisan_id: id,
          item_key,
          item_label,
          status: st,
          note: st === 'rejected' ? 'Address does not match GPS' : null,
          verified_by: verifier,
        })),
      );
    }
  }
}

async function seedDuplicates(artisans) {
  const dupes = artisans.filter((a) => a.status === 'duplicate').slice(0, 5);
  for (const d of dupes) {
    const master = artisans.find((a) => a.phone === d.phone && a.id !== d.id);
    if (!master) continue;
    await admin.from('duplicate_candidates').insert({
      artisan_id: d.id,
      match_artisan_id: master.id,
      signal: 'same_phone',
      score: 0.92,
      status: 'open',
      notes: 'Auto-detected same phone number',
    });
  }
}

async function main() {
  console.log(`ShilpSaarthi — seed ${TOTAL} leads (weighted random)\n`);

  await clearArtisanData();

  const artisans = buildArtisans(TOTAL);
  const rows = artisans.map(({ _loc, _craft, ...row }) => row);

  console.log(`Inserting ${TOTAL} artisans…`);
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await admin.from('artisans').insert(rows.slice(i, i + BATCH));
    if (error) throw new Error(`artisans batch ${i}: ${error.message}`);
  }

  console.log('Adding craft profiles, addresses, products, documents, images…');
  console.log('Downloading free photos (Picsum)…');
  for (let i = 0; i < artisans.length; i++) {
    await seedRelated(artisans[i]);
    if ((i + 1) % 50 === 0) console.log(`  …${i + 1}/${TOTAL}`);
  }

  await seedDuplicates(artisans);

  // Restore demo registration tokens
  await admin.from('registration_tokens').insert([
    { token: 'demo-token-active-0001', status: 'active', prefill: {}, created_by: USERS.admin },
    { token: 'demo-token-prefill-0002', status: 'active', prefill: { state: 'Madhya Pradesh', district: 'Dindori' }, created_by: USERS.operator },
  ]);

  const { count } = await admin.from('artisans').select('*', { count: 'exact', head: true });
  const statusCounts = {};
  for (const s of STATUSES) {
    const { count: c } = await admin.from('artisans').select('*', { count: 'exact', head: true }).eq('status', s);
    statusCounts[s] = c;
  }

  console.log('\nDone.');
  console.log(`Total artisans: ${count}`);
  console.log('By status:', statusCounts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
