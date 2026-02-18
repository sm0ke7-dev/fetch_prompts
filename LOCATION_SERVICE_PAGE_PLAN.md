# Location Service Page Feature — Implementation Plan

## Goal
Add a `service_page` output type to the pipeline that generates location-specific
wildlife removal service pages (vs. the current blog article format).

Works for ANY office — location is derived from the keyword itself.
No hardcoding to a specific city, state, or site.

Example target pages:
- Raccoon Removal Beaumont TX
- Squirrel Removal Beaumont TX
- Bat Removal Beaumont TX
- (same pipeline works for Houston, Dallas, and any other office)

---

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| How is location passed in? | Part of the keyword | e.g. "raccoon removal Houston tx" — no extra param |
| Office-specific CTAs? | No — same CTA for all offices | Simpler, one place to update |

---

## What's Different: Blog vs. Service Page

| | Blog | Service Page |
|---|---|---|
| Outline sections | Informational (signs, tips, comparisons) | Conversion-focused (hero, process, why us, FAQ, CTA) |
| Tone | Conversational/editorial | Local authority + conversion |
| Intent | Inform | Convert (calls, form fills) |
| CTAs | None | Throughout (free inspection, call us) |
| Local signals | Mentioned | Heavy — city/state extracted from keyword |

---

## Step 1 — Create 2 new prompt files in `src/repositories/data/`

### `location_service_outline_prompt.json`
Same structure as `outline_creation_prompt.json` but system prompt instructs GPT to
generate service page sections:
- Hero / intro (service + location pulled from keyword)
- Problem / why act now (local context)
- Our removal process (step-by-step)
- Why choose AAA Wildlife Removal
- Local service area coverage
- Signs you need this service
- FAQ
- Final CTA

### `location_service_loop_prompt.json`
Same structure as `loop_prompt.json` but system prompt instructs GPT to:
- Write in conversion-focused tone (not editorial/blog)
- Weave in local signals from the keyword (city, state)
- Include CTAs naturally within sections
- Reference trust signals (licensed, insured, humane, local experts)

---

## TODO — Fill in before writing prompts

- [ ] CTA text to use (e.g. phone number, "call for free inspection", etc.)
- [ ] Any trust signals to weave in (years in business, licensed/insured, humane, etc.)

---

## Step 2 — Add `pageType` param to API request

Request body changes from:
```json
{ "keyword": "raccoon removal Beaumont tx" }
```
To:
```json
{ "keyword": "raccoon removal Beaumont tx", "pageType": "service_page" }
```

`pageType` defaults to `"blog"` — fully backwards compatible, no breaking change.

---

## Step 3 — Update 2 services + controller to branch on `pageType`

### `src/services/outline_submit_retrieve_output.ts`
- Accept `pageType` in `GenerateOutlineRequest`
- Load `location_service_outline_prompt.json` when `pageType === "service_page"`
- Otherwise load `outline_creation_prompt.json` (existing behavior)

### `src/services/loop_thru_sections/loop_thru_sections.ts`
- Accept `pageType` in its request
- Load `location_service_loop_prompt.json` when `pageType === "service_page"`
- Otherwise load `loop_prompt.json` (existing behavior)

### `src/controllers/text_media_creator.controller.ts`
- Read `pageType` from request body
- Pass it through to Phase 2 and Phase 4 service calls

### `src/models/services/text_media_creator.model.ts`
- Add `pageType?: "blog" | "service_page"` to `TextMediaRequest`

---

## Test keywords (run after implementation)

```
POST /api/v1/text-media
{ "keyword": "raccoon removal Beaumont tx", "pageType": "service_page" }
{ "keyword": "squirrel removal Beaumont tx", "pageType": "service_page" }
{ "keyword": "bat removal Beaumont tx", "pageType": "service_page" }
{ "keyword": "raccoon removal Houston tx", "pageType": "service_page" }
{ "keyword": "raccoon removal Dallas tx", "pageType": "service_page" }
```
