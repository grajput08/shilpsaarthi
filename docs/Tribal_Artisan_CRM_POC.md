# Tribal Artisan CRM POC

## Designer-Ready Product Brief for PWA + Admin Dashboard

## 1. Product Intent

The Ministry wants to build a POC system to identify, onboard, verify, and manage tribal artisans across regions. The system should support two primary modes:

1. **Assisted onboarding**

   * Call-center or local operators call artisans.
   * Operators collect basic details in CRM.
   * Artisan receives WhatsApp confirmation, consent notice, and optional self-fill link.
   * Field verification team later visits the artisan physically and completes verification using a mobile PWA.

2. **Self-registration via WhatsApp**

   * Artisan receives a WhatsApp link.
   * They fill a simple mobile-first form.
   * Their profile enters CRM as “Registered, Pending Verification.”
   * Field verifier visits and validates the details.

The POC should prove that the government can create a clean, verified artisan registry with photos, craft details, location, documents, products, bank/payment readiness, market readiness, and verification status.

The system has two major products:

* **Field Verifier PWA**

  * Used by people going to villages/clusters to verify artisans.
  * Must work well on low-end Android phones.
  * Must support poor connectivity and offline-first data capture.
  * Must allow photo capture, GPS capture, document upload, checklist verification, and final submit.

* **Admin CRM Dashboard**

  * Used by ministry/admin/state/district teams.
  * Shows all registered artisans.
  * Allows assignment of verification tasks.
  * Tracks verification pipeline.
  * Enables WhatsApp reminders and status messages.
  * Provides analytics, data quality checks, exports, and audit logs.

---

## 2. User Personas

### A. Artisan

The artisan may be from a rural or remote region. They may not be digitally fluent. They may speak a local language. They may be more comfortable with WhatsApp than a web form.

Primary needs:

* Understand why data is being collected.
* Give consent in simple language.
* Share basic personal and craft details.
* Know whether someone will visit them.
* Receive updates through WhatsApp.
* Correct details if something is wrong.

### B. Call-Center Operator / Registration Executive

This user calls artisans and enters details into CRM.

Primary needs:

* Quickly search or create an artisan profile.
* Capture basic details during call.
* Mark call outcome.
* Send WhatsApp registration or confirmation link.
* Schedule verification.
* Add notes for field team.

### C. Field Verifier

This user visits artisans physically.

Primary needs:

* See assigned artisan list.
* Navigate to village/location.
* Open artisan profile.
* Verify identity, craft, location, product, and documents.
* Capture live photos and videos if required.
* Mark artisan as verified, rejected, duplicate, unavailable, or revisit needed.
* Work offline and sync later.

### D. Admin / Ministry Team

This user sees the full picture.

Primary needs:

* Monitor registration and verification progress.
* Filter by state, district, tribe, craft, gender, status, verifier, source.
* Assign field teams.
* Review flagged cases.
* Trigger WhatsApp messages.
* Export reports.
* See audit trail and data completeness.

### E. State / District Nodal Officer

This user manages a geography.

Primary needs:

* See only their assigned state/district.
* Manage verifiers and call-center operators.
* Track pending visits and escalations.
* Approve or reject verification cases.

---

## 3. Recommended POC Strategy

The POC should not depend only on artisans filling forms themselves. That will create low completion, wrong data, duplicate entries, and language friction.

The better model:

* Use **WhatsApp for reach, consent, reminders, and lightweight self-fill**.
* Use **CRM/call-center for assisted data capture**.
* Use **field PWA for ground truth verification**.
* Use **admin dashboard as the single source of truth**.

The POC should prove five things:

1. Can we register artisans at scale?
2. Can we verify them physically with proof?
3. Can we reduce duplicates and bad data?
4. Can admins track the entire pipeline?
5. Can WhatsApp improve completion and verification attendance?

---

## 4. Core Status Lifecycle

Each artisan should have one clear lifecycle status.

### Suggested statuses

1. **Lead Created**

   * Basic phone/name added by admin, call center, uploaded list, NGO, or WhatsApp campaign.

2. **Contacted**

   * Call placed or WhatsApp sent.

3. **Registration Started**

   * Artisan has opened form or operator has started filling details.

4. **Registration Submitted**

   * Minimum required profile is complete.

5. **Pending Verification**

   * Ready for field visit.

6. **Assigned to Verifier**

   * Field worker has been assigned.

7. **Verification In Progress**

   * Field verifier opened case and began verification.

8. **Verified**

   * Details confirmed.

9. **Needs Correction**

   * Some details require correction.

10. **Revisit Required**

* Artisan unavailable, location issue, document missing, poor network, etc.

11. **Rejected**

* Invalid, duplicate, not an artisan, wrong person, etc.

12. **Duplicate**

* Merged with another record.

13. **Market Ready**

* Verified and has product/catalog information good enough for downstream usage.

---

## 5. Field Verifier PWA

The PWA should be designed like a field checklist app, not like a desktop CRM squeezed into mobile.

### Design principles

* Big tap targets.
* Works on low-end Android.
* Minimal typing.
* Prefer dropdowns, chips, voice notes, photo capture, and checklists.
* Offline-first.
* Clear sync status.
* Local language support.
* One primary action per screen.
* Save draft after every major section.
* Always show artisan status and next action.

---

# Field PWA Screens

## Screen 1: Login

Purpose: Authenticate verifier.

Fields/components:

* Mobile number / email / employee ID.
* OTP login.
* Language selector.
* Role badge after login: Field Verifier, Supervisor, District Officer.
* Offline mode notice if network is weak.

States:

* OTP sent.
* Wrong OTP.
* No assignment found.
* Device registered successfully.

Designer note:

* Keep this extremely simple.
* Most field users should not remember passwords.

---

## Screen 2: Home / Today’s Work

Purpose: Give verifier a clear task list.

Sections:

* Today’s assigned artisans.
* Pending visits.
* Revisit required.
* Drafts not synced.
* Completed today.
* Sync status.

Cards should show:

* Artisan name.
* Village.
* District.
* Craft category.
* Phone number.
* Status.
* Distance from current location if GPS available.
* Priority tag: High / Normal / Revisit / Correction.

Primary actions:

* Start Visit.
* Call Artisan.
* Open WhatsApp.
* Navigate.
* Sync Now.

---

## Screen 3: Assignment List

Purpose: Browse all assigned cases.

Filters:

* Status.
* Village.
* Craft.
* Distance.
* Due date.
* Priority.
* Synced / unsynced.

Each card:

* Name.
* Phone.
* Village.
* Age/gender optional.
* Craft type.
* Last contact.
* Verification due date.
* Action: Start / Continue / Revisit.

Empty state:

* “No assigned artisans for this filter.”

---

## Screen 4: Artisan Profile Summary

Purpose: See all existing information before starting verification.

Sections:

* Basic identity.
* Contact details.
* Address.
* Craft summary.
* Registration source.
* Previous call notes.
* Uploaded documents.
* Past verification attempts.
* Duplicate warnings.
* Admin notes.

Primary CTA:

* Start Verification.

Secondary actions:

* Call.
* WhatsApp.
* Navigate.
* Mark unavailable.
* Flag duplicate.

---

## Screen 5: Consent & Notice

Purpose: Ensure artisan understands and agrees to data collection.

Content should be shown in simple language:

* Why data is being collected.
* What details will be collected.
* How it will be used.
* Who may verify it.
* How they can request correction.
* Consent checkbox.

Capture:

* Consent accepted: Yes/No.
* Consent mode:

  * Artisan read themselves.
  * Verifier read aloud.
  * Local language explanation given.
* Consent timestamp.
* GPS location.
* Verifier ID.
* Optional photo/signature/thumb acknowledgement if required.

Primary CTA:

* Continue.

Important:

* Do not allow verification submission without consent unless admin allows a special exception.

---

## Screen 6: Identity Verification

Purpose: Validate who the artisan is.

Fields:

* Full name.
* Father/spouse/guardian name.
* Gender.
* Age / date of birth.
* Mobile number.
* Alternate mobile number.
* Tribe/community.
* ID document type.
* ID document last four digits or masked reference.
* Document photo upload if allowed.
* Self photo/live photo.

Verification checklist:

* Name matches existing record.
* Person available in location.
* Artisan confirms details.
* Mobile number verified.
* ID checked.
* Duplicate check done.

Possible flags:

* Name mismatch.
* Wrong phone number.
* Duplicate profile suspected.
* Artisan not available.
* Identity not confirmed.

---

## Screen 7: Address & Location Verification

Purpose: Capture accurate field location.

Fields:

* State.
* District.
* Block/Taluka.
* Gram Panchayat.
* Village.
* Hamlet/locality.
* Pin code.
* Full address notes.
* GPS coordinates.
* Landmark.
* Distance from road/market optional.

Actions:

* Capture current GPS.
* Retake GPS.
* Add landmark photo.
* Open map.

Verification checklist:

* Artisan resides/works at this location.
* GPS captured at actual visit location.
* Address confirmed by artisan.
* Village/cluster confirmed.

Offline requirement:

* GPS and location should be saved locally if network is unavailable.
* Sync later with timestamp.

---

## Screen 8: Craft & Skill Details

Purpose: Understand the artisan’s actual craft capability.

Fields:

* Primary craft category.

  * Textile.
  * Painting.
  * Jewellery.
  * Metal craft.
  * Cane/bamboo.
  * Pottery.
  * Wood craft.
  * Natural products.
  * Tribal food products.
  * Other.
* Sub-category.
* Years of experience.
* Learned from:

  * Family tradition.
  * Community training.
  * Government training.
  * NGO.
  * Self-taught.
* Works individually or in group.
* Group/SHG/cooperative name.
* Monthly production capacity.
* Seasonal availability.
* Tools/machinery used.
* Raw materials used.
* Training needs.

Checklist:

* Artisan demonstrated craft knowledge.
* Artisan has produced/sold items before.
* Craft matches listed category.
* Photos captured.

---

## Screen 9: Product Catalogue Capture

Purpose: Capture products that may later be used for marketplace, exhibitions, procurement, or schemes.

Each product entry:

* Product name.
* Category.
* Description.
* Materials used.
* Size/dimensions.
* Weight optional.
* Price range.
* Minimum order quantity.
* Monthly production capacity.
* Time to produce one unit/batch.
* Current buyers:

  * Local market.
  * Middlemen.
  * Exhibitions.
  * Online.
  * Government outlets.
  * No buyers.
* Product photos:

  * Front.
  * Side.
  * Close-up/detail.
  * Artisan holding product optional.
* Packaging available: Yes/No.
* Can ship: Yes/No.
* Quality notes.

Actions:

* Add product.
* Duplicate previous product.
* Save product draft.
* Mark “No product available today.”

Designer note:

* This should feel like adding items to a simple catalogue.
* Allow 1–5 products in POC.
* Avoid making this too heavy for first version.

---

## Screen 10: Documents & Eligibility

Purpose: Capture documents and program readiness.

Fields:

* ID proof checked.
* Address proof checked.
* Caste/tribe certificate available.
* Bank account available.
* UPI available.
* PAN available optional.
* GST optional.
* SHG/cooperative membership.
* Existing government scheme participation.
* Training certificate optional.
* Artisan card if any.

Document upload:

* Capture photo.
* Upload file.
* Mark unavailable.
* Add reason unavailable.

Important design:

* Use “Available / Not Available / Not Asked / Not Required” instead of forcing binary Yes/No everywhere.

---

## Screen 11: Bank & Payment Readiness

Purpose: Understand whether artisan can receive payment directly.

Fields:

* Bank account available: Yes/No.
* Account holder name.
* Bank name.
* Branch optional.
* IFSC optional.
* UPI ID optional.
* Payment preference.
* Has received digital payment before: Yes/No.
* Needs help opening bank/UPI: Yes/No.

Security:

* For POC, avoid collecting full bank account number unless absolutely required.
* If collected, mask it in UI.
* Show access only to authorized roles.

---

## Screen 12: Verification Checklist

Purpose: Final structured review before submission.

Checklist sections:

* Identity verified.
* Location verified.
* Craft verified.
* Product photos captured.
* Consent captured.
* Documents checked.
* Duplicate checked.
* Market readiness assessed.

Final decision:

* Verified.
* Needs Correction.
* Revisit Required.
* Rejected.
* Duplicate.

Reason dropdown:

* Artisan unavailable.
* Document missing.
* Location mismatch.
* Identity mismatch.
* Duplicate found.
* Not an artisan.
* Wrong phone.
* Incomplete product details.
* Other.

Verifier notes:

* Free text.
* Voice note optional.
* Photo evidence optional.

Primary CTA:

* Submit Verification.

---

## Screen 13: Sync Queue

Purpose: Give confidence when network is poor.

Show:

* Synced records.
* Pending sync.
* Failed sync.
* Photos pending upload.
* Retry button.
* Last sync time.
* Storage warning.

Each unsynced item:

* Artisan name.
* Data captured.
* Photos pending.
* Retry status.

Critical rule:

* Never lose a field record because of network failure.

---

## Screen 14: Revisit Flow

Purpose: Handle incomplete visits.

Revisit reasons:

* Artisan not at home/workplace.
* Wrong location.
* Documents not available.
* Product not available for photo.
* Consent not given.
* Network issue.
* Language issue.
* Needs supervisor.

Fields:

* Revisit date.
* Notes.
* Call reminder.
* WhatsApp reminder.

---

# Admin CRM Dashboard

The admin dashboard should be web-first, table-heavy, filter-heavy, and analytics-heavy. It should not try to mimic the field PWA.

---

## Admin Screen 1: Dashboard Overview

Purpose: Show the health of the program.

Top metrics:

* Total leads.
* Registered artisans.
* Pending verification.
* Assigned to verifiers.
* Verified artisans.
* Rejected artisans.
* Duplicate profiles.
* Market-ready artisans.
* WhatsApp messages sent.
* Form completion rate.
* Verification completion rate.

Charts:

* Registration trend.
* Verification trend.
* State/district distribution.
* Craft category distribution.
* Gender distribution.
* Source-wise registration.
* Verifier productivity.

Map view:

* Artisan clusters.
* Pending verification heatmap.
* Verified cluster map.

Action cards:

* Assign pending cases.
* Review flagged records.
* Send WhatsApp reminders.
* Export report.

---

## Admin Screen 2: Artisan Registry

Purpose: Master list of all artisans.

Table columns:

* Artisan ID.
* Name.
* Phone.
* State.
* District.
* Village.
* Tribe/community.
* Craft.
* Source.
* Status.
* Assigned verifier.
* Last updated.
* Data completeness score.
* Duplicate risk.
* Actions.

Filters:

* Status.
* State.
* District.
* Block.
* Village.
* Tribe.
* Craft.
* Gender.
* Source.
* Assigned verifier.
* Date range.
* Data completeness.
* Duplicate risk.
* WhatsApp status.

Bulk actions:

* Assign verifier.
* Send WhatsApp.
* Export selected.
* Mark priority.
* Change status.
* Merge duplicates.

---

## Admin Screen 3: Artisan Detail Page

Purpose: Full profile of one artisan.

Sections:

1. Header

   * Name.
   * Status.
   * Artisan ID.
   * Phone.
   * Location.
   * Craft.
   * Verification badge.

2. Basic details

   * Identity.
   * Contact.
   * Tribe/community.
   * Demographics.

3. Address & GPS

   * Address.
   * Map.
   * Captured GPS.
   * Verification timestamp.

4. Craft profile

   * Category.
   * Experience.
   * Production capacity.
   * Training needs.

5. Product catalogue

   * Product cards with photos.
   * Price.
   * Capacity.
   * Market readiness.

6. Documents

   * Document status.
   * Uploaded images.
   * Missing documents.

7. Verification history

   * Verifier name.
   * Visit date.
   * Decision.
   * Notes.
   * Photos.
   * GPS.
   * Audit trail.

8. WhatsApp timeline

   * Messages sent.
   * Delivered/read status if available.
   * Replies.
   * Form link opened/submitted.

9. Admin actions

   * Approve.
   * Request correction.
   * Assign/reassign verifier.
   * Send WhatsApp.
   * Merge duplicate.
   * Export profile.
   * Add internal note.

---

## Admin Screen 4: Verification Queue

Purpose: Manage field verification operations.

Tabs:

* Unassigned.
* Assigned.
* In progress.
* Revisit required.
* Needs correction.
* Completed.
* Flagged.

Each row:

* Artisan.
* Location.
* Craft.
* Priority.
* Assigned verifier.
* Due date.
* Last contact.
* Distance from verifier optional.
* Status.

Actions:

* Assign to verifier.
* Bulk assign by district/block.
* Set due date.
* Add supervisor note.
* Send visit reminder.
* Mark urgent.

---

## Admin Screen 5: Assignment & Field Team Management

Purpose: Manage who visits whom.

Features:

* List of verifiers.
* Verifier location/coverage.
* Daily capacity.
* Assigned cases.
* Completed cases.
* Pending sync count.
* Productivity.
* Quality score.
* Rejection/flag rate.

Assignment modes:

* Manual assignment.
* Bulk assignment by district/block/village.
* Auto-assignment by geography.
* Reassignment when verifier is unavailable.

Verifier profile:

* Name.
* Phone.
* Role.
* State/district.
* Active/inactive.
* Assigned villages.
* Device last sync.
* Last active time.

---

## Admin Screen 6: WhatsApp Messaging Console

Purpose: Trigger messages and track communication.

Message types:

1. Registration invitation

   * Sent to leads.
   * Contains short intro and self-registration link.

2. Consent and information notice

   * Explains data collection purpose.

3. Registration confirmation

   * Sent after form submission.

4. Verification visit reminder

   * Sent before field visit.

5. Missing document reminder

   * Sent when verifier marks documents missing.

6. Correction request

   * Sent when admin needs updated details.

7. Verified confirmation

   * Sent after successful verification.

8. Scheme/exhibition/marketplace update

   * Later-stage communication.

Messaging screen components:

* Select audience.
* Choose approved template.
* Preview message.
* Personalization variables.
* Language selector.
* Send now / schedule.
* Test send.
* Approval status.
* Delivery analytics.

Template variables:

* Artisan name.
* Village.
* Verification date.
* Verifier name.
* Helpline number.
* Form link.
* Missing document name.
* Status.

Example WhatsApp templates:

* “Namaste {{name}}, your artisan registration has been received. A field verifier may visit your location for confirmation. Please keep your craft samples and documents ready.”
* “Namaste {{name}}, your verification visit is scheduled for {{date}}. Verifier: {{verifier_name}}. Please reply if the time is not suitable.”
* “Namaste {{name}}, your artisan profile has been verified. Your Artisan ID is {{artisan_id}}. Please keep this message for future reference.”

---

## Admin Screen 7: Registration Form Builder / Form Settings

Purpose: Allow admins to configure form fields for POC without engineering changes.

Features:

* Enable/disable optional fields.
* Mark fields mandatory.
* Configure craft categories.
* Configure document types.
* Configure languages.
* Configure consent text.
* Configure product catalogue limits.
* Configure state/district/block lists.

For POC:

* Keep form builder simple.
* Admin should not be able to break data structure.
* Use controlled dropdowns wherever possible.

---

## Admin Screen 8: Data Quality & Duplicate Management

Purpose: Clean the registry.

Duplicate signals:

* Same phone number.
* Same name + same village.
* Same ID reference.
* Same GPS + similar name.
* Same product photos optional later.
* Same family/SHG/group.

Duplicate screen:

* Side-by-side comparison.
* Highlight matching fields.
* Choose master record.
* Merge data.
* Keep audit trail.
* Mark as not duplicate.

Data quality score:

* Basic profile complete.
* Address complete.
* GPS captured.
* Consent captured.
* Craft details complete.
* Product photos present.
* Documents checked.
* Verification decision present.

---

## Admin Screen 9: Reports & Exports

Purpose: Help ministry/state teams report progress.

Reports:

* State-wise registrations.
* District-wise verification.
* Craft-wise artisan count.
* Gender-wise distribution.
* Tribe/community-wise distribution.
* Product category distribution.
* Pending verification aging.
* Field verifier productivity.
* WhatsApp campaign performance.
* Market-ready artisans.
* Missing document report.

Export formats:

* CSV.
* Excel.
* PDF summary.
* Photo/document export should be permission-controlled.

---

## Admin Screen 10: Audit Log & Compliance

Purpose: Track who changed what.

Audit log should capture:

* Profile created.
* Form submitted.
* Consent captured.
* Field edited.
* Status changed.
* Verifier assigned.
* WhatsApp sent.
* Verification submitted.
* Admin approved/rejected.
* Duplicate merged.
* Export downloaded.

Each log entry:

* Actor.
* Role.
* Timestamp.
* Old value.
* New value.
* Source.
* IP/device optional.
* Reason if status changed.

---

## 6. Public / WhatsApp Registration Flow

### Flow A: WhatsApp Self-Registration

1. Admin uploads lead list or creates campaign.
2. Artisan receives WhatsApp message with registration link.
3. Artisan opens mobile form.
4. Artisan selects language.
5. Consent notice shown.
6. Artisan fills:

   * Name.
   * Phone.
   * State/district/village.
   * Tribe/community.
   * Craft type.
   * Product details.
   * Photos optional.
7. Artisan submits form.
8. CRM creates profile as “Registration Submitted.”
9. Admin sees new entry.
10. Field verification task is created.
11. Artisan receives confirmation on WhatsApp.

Design requirement:

* The public form must be simpler than the verifier PWA.
* Do not ask everything in the self-form.
* Self-form should take under 5 minutes.

---

### Flow B: Assisted Registration by Call Center

1. Operator calls artisan.
2. Operator creates/opens profile.
3. Operator explains purpose.
4. Operator captures minimum details.
5. Operator sends WhatsApp confirmation/self-completion link.
6. Profile is marked “Contacted” or “Registration Submitted.”
7. Admin assigns field verifier.

Call outcome values:

* Connected.
* Not reachable.
* Wrong number.
* Call back later.
* Interested.
* Not interested.
* Already registered.
* Language barrier.
* Deceased/migrated/not available.
* Other.

---

### Flow C: Field Verification

1. Verifier logs into PWA.
2. Verifier sees assigned artisans.
3. Verifier opens case.
4. Verifier confirms consent.
5. Verifier verifies identity.
6. Verifier captures address/GPS.
7. Verifier captures craft details.
8. Verifier captures product photos.
9. Verifier checks documents.
10. Verifier chooses final decision.
11. Record syncs to CRM.
12. Admin reviews if required.
13. Artisan receives WhatsApp status update.

---

## 7. Minimum Data Model for POC

### Artisan

* Artisan ID.
* Full name.
* Phone.
* Alternate phone.
* Gender.
* Age/DOB.
* Tribe/community.
* State.
* District.
* Block/Taluka.
* Village.
* Address.
* GPS.
* Primary craft.
* Status.
* Registration source.
* Consent status.
* Assigned verifier.
* Created date.
* Last updated.

### Craft Profile

* Artisan ID.
* Craft category.
* Sub-category.
* Experience.
* Production capacity.
* Raw materials.
* Tools.
* Group/SHG association.
* Training needs.

### Product

* Product ID.
* Artisan ID.
* Product name.
* Category.
* Description.
* Price range.
* Capacity.
* Photos.
* Packaging available.
* Shipping readiness.

### Verification

* Verification ID.
* Artisan ID.
* Verifier ID.
* Visit date.
* GPS.
* Identity verified.
* Location verified.
* Craft verified.
* Documents checked.
* Decision.
* Rejection/revisit reason.
* Notes.
* Photos.
* Sync status.

### WhatsApp Message

* Message ID.
* Artisan ID.
* Template name.
* Language.
* Sent by.
* Sent timestamp.
* Delivery status.
* Reply received.
* Campaign ID.

### Audit Log

* Entity type.
* Entity ID.
* Action.
* Actor.
* Role.
* Timestamp.
* Old value.
* New value.

---

## 8. POC Scope

### Must-have for POC

* Admin login.
* Role-based access.
* Artisan registry.
* Create/edit artisan.
* Import leads CSV.
* WhatsApp registration link trigger.
* Public registration form.
* Field verifier PWA.
* Offline draft save.
* Photo capture.
* GPS capture.
* Verification checklist.
* Assignment queue.
* Status lifecycle.
* Admin dashboard metrics.
* Basic duplicate detection.
* Export CSV.
* Audit log.

### Should-have for POC

* Multi-language UI.
* WhatsApp message timeline.
* Bulk assignment.
* Map view.
* Data completeness score.
* Revisit scheduling.
* Product catalogue capture.
* Supervisor review queue.

### Later phase

* AI duplicate detection.
* OCR for documents.
* Voice-based form filling.
* Local language voice prompts.
* Marketplace integration.
* Payment/bank validation.
* Training recommendation engine.
* Exhibition/procurement pipeline.
* Artisan digital profile page.
* Integration with existing government databases where permitted.
* Advanced analytics by scheme, cluster, craft, and demand.

---

## 9. Designer Notes

The PWA should feel like a “field mission app.” The admin dashboard should feel like an “operations control room.”

### PWA visual direction

* Mobile-first.
* Large cards.
* Clear status chips.
* Low visual clutter.
* Strong offline/sync indicators.
* Step-by-step flow.
* Use icons for call, WhatsApp, location, camera, sync.
* Use progress bar: Identity → Address → Craft → Products → Documents → Submit.

### Admin dashboard visual direction

* Dense but clean.
* Strong tables and filters.
* State/district/craft/status filters always visible.
* Use color-coded status chips.
* Map + metrics + pipeline funnel.
* Every row should have a clear next action.

### Important UX rule

Never make the field verifier think. The app should tell them:

* Who to visit.
* What to verify.
* What is missing.
* What to do next.
* Whether data is saved or synced.

---

## 10. Success Metrics for POC

Operational metrics:

* Number of artisans registered.
* Percentage registration completed.
* Percentage assigned for verification.
* Percentage verified.
* Average time from registration to verification.
* Average field visits per verifier per day.
* Revisit rate.
* Rejection rate.
* Duplicate rate.

Data quality metrics:

* Profiles with GPS.
* Profiles with consent.
* Profiles with product photos.
* Profiles with craft details.
* Profiles with complete address.
* Profiles with document status.

WhatsApp metrics:

* Messages sent.
* Delivered.
* Read.
* Link opened.
* Form started.
* Form submitted.
* Reminder response rate.

Program metrics:

* Verified artisans by craft.
* Verified artisans by district.
* Market-ready artisans.
* Artisans needing training.
* Artisans needing bank/payment support.
* Product categories with high supply.

---

## 11. Opinionated Recommendation

For the POC, do not build a generic CRM first. Build a vertical “Artisan Verification OS.”

The key difference:

* A generic CRM tracks contacts.
* This system should create verified artisan identities, craft profiles, product catalogues, field evidence, and operational workflows.

The first version should be designed around the physical verification journey. If that works, everything else becomes easier: WhatsApp onboarding, dashboards, reports, scheme linkage, marketplace linkage, and future procurement.

The best POC flow is:

Lead → WhatsApp/call registration → pending verification → field PWA visit → verified artisan profile → admin review → WhatsApp confirmation → export/report/market-ready list.

That is the cleanest, most defensible flow for a government-grade rollout.
