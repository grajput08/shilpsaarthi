-- =============================================================================
-- ShilpSaarthi — local demo seed
-- Deterministic UUIDs so tests + UI can reference fixed records.
-- All demo users share password: Password123!  (local only)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Demo auth users (the on_auth_user_created trigger creates their profiles).
-- All passwords: Password123!  (local only)
-- -----------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
 ('00000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111'::uuid,'authenticated','authenticated','admin@shilpsaarthi.test',    crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Asha Menon (Admin)","role":"admin"}'::jsonb,              now(), now(), '', '', '', ''),
 ('00000000-0000-0000-0000-000000000000','22222222-2222-2222-2222-222222222222'::uuid,'authenticated','authenticated','operator@shilpsaarthi.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Ravi Kumar (Operator)","role":"operator"}'::jsonb,        now(), now(), '', '', '', ''),
 ('00000000-0000-0000-0000-000000000000','33333333-3333-3333-3333-333333333333'::uuid,'authenticated','authenticated','verifier@shilpsaarthi.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sunita Marko (Verifier)","role":"verifier"}'::jsonb,      now(), now(), '', '', '', ''),
 ('00000000-0000-0000-0000-000000000000','44444444-4444-4444-4444-444444444444'::uuid,'authenticated','authenticated','verifier2@shilpsaarthi.test',crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Mahesh Uikey (Verifier)","role":"verifier"}'::jsonb,      now(), now(), '', '', '', ''),
 ('00000000-0000-0000-0000-000000000000','55555555-5555-5555-5555-555555555555'::uuid,'authenticated','authenticated','officer@shilpsaarthi.test',  crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Priya Nanda (District Officer)","role":"district_officer"}'::jsonb, now(), now(), '', '', '', '');

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
 (gen_random_uuid(),'11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111'::uuid,'{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@shilpsaarthi.test"}'::jsonb,    'email', now(), now(), now()),
 (gen_random_uuid(),'22222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222'::uuid,'{"sub":"22222222-2222-2222-2222-222222222222","email":"operator@shilpsaarthi.test"}'::jsonb, 'email', now(), now(), now()),
 (gen_random_uuid(),'33333333-3333-3333-3333-333333333333','33333333-3333-3333-3333-333333333333'::uuid,'{"sub":"33333333-3333-3333-3333-333333333333","email":"verifier@shilpsaarthi.test"}'::jsonb, 'email', now(), now(), now()),
 (gen_random_uuid(),'44444444-4444-4444-4444-444444444444','44444444-4444-4444-4444-444444444444'::uuid,'{"sub":"44444444-4444-4444-4444-444444444444","email":"verifier2@shilpsaarthi.test"}'::jsonb,'email', now(), now(), now()),
 (gen_random_uuid(),'55555555-5555-5555-5555-555555555555','55555555-5555-5555-5555-555555555555'::uuid,'{"sub":"55555555-5555-5555-5555-555555555555","email":"officer@shilpsaarthi.test"}'::jsonb,  'email', now(), now(), now());

update public.profiles p
   set full_name = v.full_name, role = v.role, phone = v.phone,
       state = v.state, district = v.district, employee_id = v.emp, email = v.email
  from (values
    ('11111111-1111-1111-1111-111111111111'::uuid,'Asha Menon (Admin)',            'admin'::public.app_role,            '9810000001', null::text,        null::text, 'EMP-ADM-01','admin@shilpsaarthi.test'),
    ('22222222-2222-2222-2222-222222222222'::uuid,'Ravi Kumar (Operator)',         'operator'::public.app_role,         '9810000002', null::text,        null::text, 'EMP-OPR-01','operator@shilpsaarthi.test'),
    ('33333333-3333-3333-3333-333333333333'::uuid,'Sunita Marko (Verifier)',       'verifier'::public.app_role,         '9810000003', 'Madhya Pradesh', 'Dindori',   'EMP-VER-01','verifier@shilpsaarthi.test'),
    ('44444444-4444-4444-4444-444444444444'::uuid,'Mahesh Uikey (Verifier)',       'verifier'::public.app_role,         '9810000004', 'Madhya Pradesh', 'Mandla',    'EMP-VER-02','verifier2@shilpsaarthi.test'),
    ('55555555-5555-5555-5555-555555555555'::uuid,'Priya Nanda (District Officer)','district_officer'::public.app_role, '9810000005', 'Madhya Pradesh', 'Dindori',   'EMP-DCO-01','officer@shilpsaarthi.test')
  ) as v(id, full_name, role, phone, state, district, emp, email)
 where p.id = v.id;

-- -----------------------------------------------------------------------------
-- WhatsApp templates
-- -----------------------------------------------------------------------------
insert into public.whatsapp_templates (template_key, name, category, language, body, variables) values
('registration_invite','Registration Invitation','invitation','en',
 'Namaste {{name}}, the Tribal Artisan programme invites you to register. Please open this link to share your craft details: {{form_link}}',
 array['name','form_link']),
('consent_notice','Consent & Information Notice','consent','en',
 'Namaste {{name}}, we collect your craft, location and ID details to build a verified artisan registry. A field officer may visit you. Reply STOP to opt out. Helpline: {{helpline}}',
 array['name','helpline']),
('registration_confirmation','Registration Confirmation','confirmation','en',
 'Namaste {{name}}, your artisan registration has been received. A field verifier may visit {{village}} for confirmation. Please keep your craft samples and documents ready.',
 array['name','village']),
('visit_reminder','Verification Visit Reminder','reminder','en',
 'Namaste {{name}}, your verification visit is scheduled for {{date}}. Verifier: {{verifier_name}}. Please reply if the time is not suitable.',
 array['name','date','verifier_name']),
('missing_document','Missing Document Reminder','reminder','en',
 'Namaste {{name}}, the document {{document}} is still pending for your artisan profile. Please keep it ready for the next visit.',
 array['name','document']),
('correction_request','Correction Request','correction','en',
 'Namaste {{name}}, some details in your artisan profile need correction: {{detail}}. Our team will contact you shortly.',
 array['name','detail']),
('verified_confirmation','Verified Confirmation','confirmation','en',
 'Namaste {{name}}, your artisan profile has been verified. Your Artisan ID is {{artisan_id}}. Please keep this message for future reference.',
 array['name','artisan_id']),
('scheme_update','Scheme / Exhibition Update','update','en',
 'Namaste {{name}}, a new exhibition opportunity is open for {{craft}} artisans in {{district}}. Reply YES to know more.',
 array['name','craft','district']);

-- -----------------------------------------------------------------------------
-- Artisans — one per lifecycle status, across tribal regions
-- ids: a1a1a1a1-0000-0000-0000-0000000000NN
-- -----------------------------------------------------------------------------
insert into public.artisans
  (id, full_name, phone, alternate_phone, gender, date_of_birth, tribe_community, primary_craft,
   status, registration_source, consent_status, preferred_language, assigned_verifier,
   state, district, block, village, priority, data_completeness, notes, created_by)
values
('a1a1a1a1-0000-0000-0000-000000000001','Budhni Bai','9800000001',null,'female','1985-03-12','Gond','textile',
  'lead_created','csv_import','not_captured','hi',null,'Madhya Pradesh','Dindori','Shahpura','Karanjia','normal',15,'From NGO list',null),
('a1a1a1a1-0000-0000-0000-000000000002','Ramlal Dhurve','9800000002',null,'male','1979-07-01','Baiga','cane_bamboo',
  'contacted','call_center','not_captured','hi',null,'Madhya Pradesh','Dindori','Karanjia','Dhaba','normal',25,'Called once, interested',
  '22222222-2222-2222-2222-222222222222'),
('a1a1a1a1-0000-0000-0000-000000000003','Sukhiya Devi','9800000003',null,'female','1990-11-23','Santhal','painting',
  'registration_started','whatsapp_self','granted','or',null,'Odisha','Mayurbhanj','Baripada','Tato','normal',35,null,null),
('a1a1a1a1-0000-0000-0000-000000000004','Mangal Singh','9800000004',null,'male','1982-01-15','Gond','wood_craft',
  'registration_submitted','whatsapp_self','granted','hi',null,'Madhya Pradesh','Mandla','Bichhiya','Sijhora','normal',55,null,null),
('a1a1a1a1-0000-0000-0000-000000000005','Phoolwati Bai','9800000005',null,'female','1995-05-09','Gond','pottery',
  'pending_verification','whatsapp_self','granted','hi',null,'Madhya Pradesh','Dindori','Shahpura','Karanjia','normal',60,null,null),
('a1a1a1a1-0000-0000-0000-000000000006','Jhitku Maran','9800000006',null,'male','1975-09-30','Baiga','metal_craft',
  'assigned','admin_manual','granted','hi','33333333-3333-3333-3333-333333333333','Madhya Pradesh','Dindori','Bajag','Chada','high',60,'Priority cluster',
  '11111111-1111-1111-1111-111111111111'),
('a1a1a1a1-0000-0000-0000-000000000007','Lakshmi Tekam','9800000007',null,'female','1988-02-18','Gond','jewellery',
  'verification_in_progress','call_center','granted','hi','33333333-3333-3333-3333-333333333333','Madhya Pradesh','Dindori','Bajag','Chada','normal',65,null,
  '22222222-2222-2222-2222-222222222222'),
('a1a1a1a1-0000-0000-0000-000000000008','Sukhram Maravi','9800000008','9800000018','male','1970-12-05','Gond','textile',
  'verified','call_center','granted','hi','33333333-3333-3333-3333-333333333333','Madhya Pradesh','Dindori','Shahpura','Karanjia','normal',95,'Strong weaver, ready for catalogue',
  '22222222-2222-2222-2222-222222222222'),
('a1a1a1a1-0000-0000-0000-000000000009','Chunni Bai','9800000009',null,'female','1992-06-21','Gond','natural_products',
  'needs_correction','whatsapp_self','granted','hi','44444444-4444-4444-4444-444444444444','Madhya Pradesh','Mandla','Bichhiya','Sijhora','correction',70,'Address mismatch noted',null),
('a1a1a1a1-0000-0000-0000-000000000010','Birsa Munda','9800000010',null,'male','1980-04-04','Munda','cane_bamboo',
  'revisit_required','whatsapp_self','not_captured','hi','44444444-4444-4444-4444-444444444444','Odisha','Mayurbhanj','Baripada','Tato','revisit',45,'Artisan not at home',null),
('a1a1a1a1-0000-0000-0000-000000000011','Fake Entry','9800000011',null,'male','2000-01-01','Unknown','other',
  'rejected','csv_import','declined','hi',null,'Jharkhand','Khunti','Murhu','Tapkara','normal',20,'Not an artisan',null),
('a1a1a1a1-0000-0000-0000-000000000012','Phoolwati B.','9800000005',null,'female','1995-05-09','Gond','pottery',
  'duplicate','csv_import','not_captured','hi',null,'Madhya Pradesh','Dindori','Shahpura','Karanjia','normal',30,'Likely duplicate of Phoolwati Bai',null),
('a1a1a1a1-0000-0000-0000-000000000013','Sonbai Dhurve','9800000013',null,'female','1968-08-08','Baiga','painting',
  'market_ready','call_center','granted','hi','33333333-3333-3333-3333-333333333333','Madhya Pradesh','Dindori','Bajag','Chada','normal',100,'Baiga Pradhan painter, market ready',
  '22222222-2222-2222-2222-222222222222'),
('a1a1a1a1-0000-0000-0000-000000000014','Geeta Uikey','9800000014',null,'female','1991-10-10','Gond','textile',
  'pending_verification','whatsapp_self','granted','hi',null,'Madhya Pradesh','Dindori','Shahpura','Karanjia','normal',55,null,null),
('a1a1a1a1-0000-0000-0000-000000000015','Hari Singh','9800000015',null,'male','1984-03-03','Gond','wood_craft',
  'contacted','call_center','not_captured','hi',null,'Madhya Pradesh','Mandla','Niwas','Padariya','normal',25,null,
  '22222222-2222-2222-2222-222222222222');

-- -----------------------------------------------------------------------------
-- Craft profiles
-- -----------------------------------------------------------------------------
insert into public.craft_profiles
  (artisan_id, craft_category, sub_category, experience_years, learned_from, works_in_group, group_name, monthly_capacity, seasonal_availability, tools_used, raw_materials, training_needs)
values
('a1a1a1a1-0000-0000-0000-000000000006','metal_craft','Bell metal / Dhokra',20,'Family tradition',true,'Chada Dhokra SHG',15,'All year','Clay mould, furnace','Brass scrap, beeswax','Design & marketing'),
('a1a1a1a1-0000-0000-0000-000000000007','jewellery','Tribal silver',12,'Community training',false,null,30,'All year','Hand tools','Silver, beads','Pricing support'),
('a1a1a1a1-0000-0000-0000-000000000008','textile','Handloom cotton',25,'Family tradition',true,'Karanjia Weavers',40,'Oct-Mar','Pit loom','Cotton yarn, natural dye','None'),
('a1a1a1a1-0000-0000-0000-000000000013','painting','Baiga Pradhan painting',30,'Family tradition',false,null,20,'All year','Natural brushes','Natural pigments, canvas','Exhibition linkage'),
('a1a1a1a1-0000-0000-0000-000000000009','natural_products','Mahua / forest produce',8,'Self-taught',true,'Sijhora VanDhan',50,'Apr-Jun','Baskets','Mahua flower, honey','Packaging'),
('a1a1a1a1-0000-0000-0000-000000000004','wood_craft','Tribal masks',10,'Family tradition',false,null,12,'All year','Chisel, knife','Local wood','Tools upgrade');

-- -----------------------------------------------------------------------------
-- Addresses + GPS (for visited / verified artisans)
-- -----------------------------------------------------------------------------
insert into public.addresses
  (artisan_id, state, district, block, gram_panchayat, village, hamlet, pin_code, address_line, landmark, latitude, longitude, gps_accuracy_m, gps_captured_at, captured_by)
values
('a1a1a1a1-0000-0000-0000-000000000008','Madhya Pradesh','Dindori','Shahpura','Karanjia','Karanjia','Weaver tola','481990','Near community hall, Karanjia','Opp. primary school',22.9412,81.0784,6.0, now() - interval '5 days','33333333-3333-3333-3333-333333333333'),
('a1a1a1a1-0000-0000-0000-000000000013','Madhya Pradesh','Dindori','Bajag','Chada','Chada','Baiga tola','481995','Chada village main road','Near Hanuman temple',22.7531,81.3122,5.0, now() - interval '8 days','33333333-3333-3333-3333-333333333333'),
('a1a1a1a1-0000-0000-0000-000000000007','Madhya Pradesh','Dindori','Bajag','Chada','Chada',null,'481995','Chada bus stop lane',null,22.7540,81.3130,8.0, now() - interval '1 day','33333333-3333-3333-3333-333333333333'),
('a1a1a1a1-0000-0000-0000-000000000009','Madhya Pradesh','Mandla','Bichhiya','Sijhora','Sijhora',null,'481768','Sijhora forest edge',null,22.4150,80.6900,12.0, now() - interval '3 days','44444444-4444-4444-4444-444444444444');

-- -----------------------------------------------------------------------------
-- Products
-- -----------------------------------------------------------------------------
insert into public.products
  (artisan_id, name, category, description, materials, dimensions, price_min, price_max, min_order_qty, monthly_capacity, production_time, buyers, packaging_available, can_ship, quality_notes)
values
('a1a1a1a1-0000-0000-0000-000000000008','Handwoven cotton stole','textile','Natural-dyed handloom stole','Cotton, natural dye','180x70 cm',450,800,5,40,'2 days','{local_market,exhibitions}',true,true,'Even weave, colourfast'),
('a1a1a1a1-0000-0000-0000-000000000008','Tribal motif gamcha','textile','Traditional checked gamcha','Cotton','150x60 cm',150,250,10,60,'1 day','{local_market}',false,true,'Good'),
('a1a1a1a1-0000-0000-0000-000000000013','Baiga Pradhan painting (A3)','painting','Hand-painted natural pigment artwork','Natural pigment, canvas','A3',1200,2500,1,20,'4 days','{exhibitions,online}',true,true,'Museum quality'),
('a1a1a1a1-0000-0000-0000-000000000006','Dhokra elephant figurine','metal_craft','Lost-wax brass figurine','Brass, beeswax','15 cm',600,1500,2,15,'5 days','{middlemen,exhibitions}',true,false,'Fine detailing');

-- -----------------------------------------------------------------------------
-- Documents
-- -----------------------------------------------------------------------------
insert into public.documents (artisan_id, doc_type, status, reference_masked, checked_by) values
('a1a1a1a1-0000-0000-0000-000000000008','id_proof','available','XXXX-XXXX-1234','33333333-3333-3333-3333-333333333333'),
('a1a1a1a1-0000-0000-0000-000000000008','bank_passbook','available','XXXXXX7788','33333333-3333-3333-3333-333333333333'),
('a1a1a1a1-0000-0000-0000-000000000008','caste_tribe_certificate','available',null,'33333333-3333-3333-3333-333333333333'),
('a1a1a1a1-0000-0000-0000-000000000013','id_proof','available','XXXX-XXXX-9911','33333333-3333-3333-3333-333333333333'),
('a1a1a1a1-0000-0000-0000-000000000013','bank_passbook','available',null,'33333333-3333-3333-3333-333333333333'),
('a1a1a1a1-0000-0000-0000-000000000009','id_proof','available',null,'44444444-4444-4444-4444-444444444444'),
('a1a1a1a1-0000-0000-0000-000000000009','address_proof','not_available',null,'44444444-4444-4444-4444-444444444444'),
('a1a1a1a1-0000-0000-0000-000000000007','id_proof','not_asked',null,null);

-- -----------------------------------------------------------------------------
-- Assignments
-- -----------------------------------------------------------------------------
insert into public.assignments (artisan_id, verifier_id, assigned_by, status, priority, due_date, supervisor_note) values
('a1a1a1a1-0000-0000-0000-000000000006','33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','assigned','high', current_date + 2,'Cover Chada Dhokra cluster'),
('a1a1a1a1-0000-0000-0000-000000000007','33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','in_progress','normal', current_date,'Continue from yesterday'),
('a1a1a1a1-0000-0000-0000-000000000008','33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','completed','normal', current_date - 5,null),
('a1a1a1a1-0000-0000-0000-000000000013','33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','completed','normal', current_date - 8,null),
('a1a1a1a1-0000-0000-0000-000000000009','44444444-4444-4444-4444-444444444444','55555555-5555-5555-5555-555555555555','completed','correction', current_date - 3,'Recheck address'),
('a1a1a1a1-0000-0000-0000-000000000010','44444444-4444-4444-4444-444444444444','55555555-5555-5555-5555-555555555555','assigned','revisit', current_date + 1,'Artisan was travelling');

-- -----------------------------------------------------------------------------
-- Verifications
-- -----------------------------------------------------------------------------
insert into public.verifications
  (artisan_id, verifier_id, visit_date, latitude, longitude, gps_accuracy_m,
   consent_captured, consent_mode, consent_timestamp,
   identity_verified, location_verified, craft_verified, products_captured,
   documents_checked, duplicate_checked, market_ready, decision, reason, notes, sync_status)
values
('a1a1a1a1-0000-0000-0000-000000000008','33333333-3333-3333-3333-333333333333', current_date - 5, 22.9412,81.0784,6.0,
  true,'Verifier read aloud', now() - interval '5 days',
  true,true,true,true,true,true,true,'verified',null,'All details confirmed, strong weaver','synced'),
('a1a1a1a1-0000-0000-0000-000000000013','33333333-3333-3333-3333-333333333333', current_date - 8, 22.7531,81.3122,5.0,
  true,'Artisan read themselves', now() - interval '8 days',
  true,true,true,true,true,true,true,'verified',null,'Market ready, exhibition recommended','synced'),
('a1a1a1a1-0000-0000-0000-000000000009','44444444-4444-4444-4444-444444444444', current_date - 3, 22.4150,80.6900,12.0,
  true,'Local language explanation given', now() - interval '3 days',
  true,false,true,false,true,true,false,'needs_correction','location_mismatch','Address does not match GPS, correction needed','synced'),
('a1a1a1a1-0000-0000-0000-000000000010','44444444-4444-4444-4444-444444444444', current_date - 4, null,null,null,
  false,null,null,
  false,false,false,false,false,false,false,'revisit_required','artisan_unavailable','Artisan not at home, neighbour said travelling','synced'),
('a1a1a1a1-0000-0000-0000-000000000011',null, current_date - 6, null,null,null,
  false,null,null,
  false,false,false,false,false,true,false,'rejected','not_an_artisan','Person runs a grocery shop, not an artisan','synced'),
('a1a1a1a1-0000-0000-0000-000000000007','33333333-3333-3333-3333-333333333333', current_date, 22.7540,81.3130,8.0,
  true,'Verifier read aloud', now(),
  true,true,false,false,false,false,false,null,null,'Visit in progress — identity & location done','synced');

-- -----------------------------------------------------------------------------
-- WhatsApp messages (mocked log)
-- -----------------------------------------------------------------------------
insert into public.whatsapp_messages
  (artisan_id, template_key, direction, language, to_phone, body, variables, status, sent_by, sent_at, delivered_at, read_at)
values
('a1a1a1a1-0000-0000-0000-000000000005','registration_confirmation','outbound','hi','9800000005',
  'Namaste Phoolwati Bai, your artisan registration has been received. A field verifier may visit Karanjia for confirmation. Please keep your craft samples and documents ready.',
  '{"name":"Phoolwati Bai","village":"Karanjia"}', 'read','22222222-2222-2222-2222-222222222222', now() - interval '2 days', now() - interval '2 days', now() - interval '47 hours'),
('a1a1a1a1-0000-0000-0000-000000000006','visit_reminder','outbound','hi','9800000006',
  'Namaste Jhitku Maran, your verification visit is scheduled for tomorrow. Verifier: Sunita Marko. Please reply if the time is not suitable.',
  '{"name":"Jhitku Maran","verifier_name":"Sunita Marko"}', 'delivered','11111111-1111-1111-1111-111111111111', now() - interval '1 day', now() - interval '1 day', null),
('a1a1a1a1-0000-0000-0000-000000000008','verified_confirmation','outbound','hi','9800000008',
  'Namaste Sukhram, your artisan profile has been verified. Your Artisan ID is ART-2026-00008. Please keep this message for future reference.',
  '{"name":"Sukhram","artisan_id":"ART-2026-00008"}', 'read','11111111-1111-1111-1111-111111111111', now() - interval '4 days', now() - interval '4 days', now() - interval '4 days'),
('a1a1a1a1-0000-0000-0000-000000000009','correction_request','outbound','hi','9800000009',
  'Namaste Chunni Bai, some details in your artisan profile need correction: address. Our team will contact you shortly.',
  '{"name":"Chunni Bai","detail":"address"}', 'sent','55555555-5555-5555-5555-555555555555', now() - interval '2 days', null, null);

-- Explicit business-event audit entries (data-change triggers cover the rest)
insert into public.audit_logs (entity_type, entity_id, action, actor_id, actor_role, new_value, source, reason) values
('artisan','a1a1a1a1-0000-0000-0000-000000000008','verification_submitted','33333333-3333-3333-3333-333333333333','verifier','{"decision":"verified"}','field_pwa','Field verification completed'),
('whatsapp','a1a1a1a1-0000-0000-0000-000000000008','whatsapp_sent','11111111-1111-1111-1111-111111111111','admin','{"template":"verified_confirmation"}','admin','Verified confirmation sent'),
('artisan','a1a1a1a1-0000-0000-0000-000000000008','approved','11111111-1111-1111-1111-111111111111','admin','{"status":"verified"}','admin',null);
