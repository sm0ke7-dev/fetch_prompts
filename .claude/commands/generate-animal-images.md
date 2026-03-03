Generate animal images using the fast bypass pipeline (skips 4-step AI prompt engineering).

## Instructions

You will help the user generate animal images by calling the image-media API endpoint directly. This uses the animal bypass path which picks a random prompt variant + random style reference images for variety.

### Step 1: Gather inputs

If the user hasn't already provided them, ask for:
- **animal** — one of: `bat`, `raccoon`, `squirrel`
- **location** — city and state (e.g. "addison tx", "beaumont tx")
- **count** — how many images to generate (default: 4 — 1 featured + 3 inline)

If the user ran this skill with arguments (e.g. `/generate-animal-images raccoon addison tx`), parse the animal and location from the argument text. Default count to 4.

### Step 2: Build image keywords

Create varied keywords that will produce visually distinct images. The bypass pipeline strips filler words (removal, service, control, pest, wildlife, tx, ca, etc.) and appends whatever remains to the base prompt — so include **visual scene words** that survive stripping.

**Keyword format:**
- **Featured**: `<animal> removal <city> <state>` — clean portrait, no scene
- **Inline 1-N**: `<animal> <action> <scene> <city> <state>` — each with a unique action + scene combo

**Scene + action reference by animal:**
- **Raccoon**: rummaging through trash can | climbing wooden fence | running across roof | crouching in yard at night | pawing at house foundation | on driveway | in backyard garden
- **Bat**: swooping from roof eave | hanging from attic rafter | clinging to exterior brick wall | roosting under porch overhang
- **Squirrel**: running on roof | jumping wooden fence | climbing tree branch | leaping between branches | alert on deck railing | scrambling near attic vent

Pick scene+action combos that are all **visually different** from each other. No two images should share the same scene or action.

### Step 3: Confirm before running

Display a summary:
```
Animal:    <animal>
Location:  <city, state>
Count:     <count>
Keywords:
  1. (featured) <keyword>
  2. (inline)   <keyword>
  3. (inline)   <keyword>
  4. (inline)   <keyword>
```
Ask the user to confirm before proceeding.

### Step 4: Generate images

Call the image-media endpoint for each keyword:

```bash
curl -s -X POST http://localhost:3000/api/v1/image-media \
  -H "Content-Type: application/json" \
  -d '{"keyword": "<image keyword>"}' \
  --max-time 120
```

Report progress: "Generating image 1/4 (featured)...", "Generating image 2/4 (inline)...", etc.

Collect the `saved_image_path` from each response (`data.content_summary.saved_image_path`).

### Step 5: Review images

1. **Show all images at once** using the Read tool on each saved image path so the user can visually inspect them.

2. **Display a summary**:
   - **Featured**: `<file path>`
   - Inline 1 (`<scene>`): `<file path>`
   - Inline 2 (`<scene>`): `<file path>`
   - Inline 3 (`<scene>`): `<file path>`

3. **Ask the user**: "Do these look good? You can approve all, reject specific ones for regeneration, or generate more."

4. **If the user rejects specific images**: regenerate only those by calling the endpoint again with the same keyword. Show the new image and ask for approval again.

### Notes
- Make sure the dev server is running (`npm run dev` on port 3000) before calling the API
- If the server isn't reachable, remind the user to start it and offer to retry
- Images are saved to: `src/repositories/images/featured/`
- The bypass skips the 4-step AI pipeline — each image takes ~9 seconds instead of ~50 seconds
- Prompt variants and reference images are selected randomly by the server, so re-running the same keyword will produce different results
