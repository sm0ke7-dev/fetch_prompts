Generate a location service page using the 5-phase AI content pipeline.

## Instructions

You will help the user generate a location-based service page by calling the local API and reporting the output.

### Step 1: Gather inputs

If the user hasn't already provided them, ask for:
- **keyword** — the target keyword for the page (e.g. "raccoon removal Beaumont tx")
- **pageType** — `location` (default), `service_page`, or `blog`
- **site** — the WordPress site key (e.g. "dallas", "charlotte"). Ask if not provided.

If the user ran this skill with arguments (e.g. `/create-location-page raccoon removal Beaumont tx`), use the argument text as the keyword and default pageType to `location`.

### Step 2: Confirm before running

Display a confirmation summary:
```
Keyword:   <keyword>
Page type: <pageType>
Site:      <site>
Endpoint:  POST http://localhost:3000/api/v1/text-media
```
Ask the user to confirm before proceeding.

### Step 3: Generate article text

Use the Bash tool to call the API:

```bash
curl -s -X POST http://localhost:3000/api/v1/text-media \
  -H "Content-Type: application/json" \
  -d '{"keyword": "<keyword>", "pageType": "<pageType>"}' \
  --max-time 300
```

The pipeline takes ~1–3 minutes. Let the user know it's running.

### Step 4: Report text result

On success, extract and display:
- The output file path (Phase 5 markdown file in `src/repositories/final/`)
- Word count and section count if available in the response
- Any errors or warnings from the response

Then proceed to Step 5 (image generation).

### Step 5: Generate 4 images (1 featured + 3 inline)

1. **Read the generated markdown file** to extract the first 3 H2 headings.

2. **Build 4 image keywords**:
   - Featured: `<keyword>` (just the main keyword)
   - Inline 1: `<keyword> — <H2 heading 1>`
   - Inline 2: `<keyword> — <H2 heading 2>`
   - Inline 3: `<keyword> — <H2 heading 3>`

3. **Call the image-media endpoint 4 times**, once per keyword:

```bash
curl -s -X POST http://localhost:3000/api/v1/image-media \
  -H "Content-Type: application/json" \
  -d '{"keyword": "<image keyword>"}' \
  --max-time 120
```

Let the user know progress (e.g. "Generating image 1/4 (featured)...", "Generating image 2/4 (inline)...").

4. **Collect the saved image paths** from each response (`saved_image_path` field in `data.content_summary`).

### Step 6: Review images

1. **Show all 4 images at once** using the Read tool on each saved image path so the user can visually inspect them.

2. **Display a summary** labeling each image:
   - **Featured**: `<file path>`
   - Inline 1 (H2: `<heading>`): `<file path>`
   - Inline 2 (H2: `<heading>`): `<file path>`
   - Inline 3 (H2: `<heading>`): `<file path>`

3. **Ask the user**: "Do these look good? You can approve all, reject specific ones for regeneration, or skip images entirely."

4. **If the user rejects specific images**: regenerate only those by calling the image-media endpoint again with the same keyword for that image. Show the new image and ask for approval again.

### Step 7: Upload to WordPress

Once the user approves the images (or chooses to skip them):

1. Ask: **"Ready to upload to WordPress as a draft?"** — wait for confirmation.

2. On confirmation, call the upload endpoint with the featured image and inline image paths:

```bash
curl -s -X POST http://localhost:3000/api/v1/wp-upload \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "<keyword>",
    "pageType": "<pageType>",
    "site": "<site>",
    "featuredImagePath": "<featured image path>",
    "inlineImagePaths": ["<inline path 1>", "<inline path 2>", "<inline path 3>"]
  }' \
  --max-time 60
```

If the user skipped images, omit both `featuredImagePath` and `inlineImagePaths` fields.

3. On success, report:
   - **WordPress URL** — the `wordpress_url` from the response
   - **Edit URL** — the `wordpress_edit_url` from the response
   - **Status** — draft (always draft mode)
   - **Content type** — the `content_type` from the response
   - **Inline images injected** — the `inline_image_count` from the response
   - Remind the user: *"Review the draft in WordPress before publishing."*

4. On error, check the HTTP status:
   - **500 or 502**: WordPress credentials may not be configured. Show this message:
     ```
     WordPress upload failed. Make sure these variables are set in .local.env:
       WP_{SITE}_BASE_URL=https://your-site.com
       WP_{SITE}_USERNAME=your_wp_username
       WP_{SITE}_APP_PASSWORD=your_wp_application_password

     Generate an Application Password in WordPress: Users → your profile → Application Passwords.
     ```
   - **404**: The generated article file was not found. Suggest re-running generation first.
   - **Other errors**: Show the error message from the response and suggest checking server logs.

### Notes
- Make sure the dev server is running (`npm run dev` on port 3000) before calling the API
- If the server isn't reachable, remind the user to start it and offer to retry
- The generated article file will be at: `src/repositories/final/phase5_article_<slug>.md`
- Images are saved to: `src/repositories/images/featured/`
- The upload endpoint handles: uploading images to WP media library, scanning H2s for existing images, and injecting into empty H2 sections automatically
