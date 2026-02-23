Generate a location service page using the 5-phase AI content pipeline.

## Instructions

You will help the user generate a location-based service page by calling the local API and reporting the output.

### Step 1: Gather inputs

If the user hasn't already provided them, ask for:
- **keyword** — the target keyword for the page (e.g. "raccoon removal Beaumont tx")
- **pageType** — `service_page` (default) or `blog`

If the user ran this skill with arguments (e.g. `/create-location-page raccoon removal Beaumont tx`), use the argument text as the keyword and default pageType to `service_page`.

### Step 2: Confirm before running

Display a confirmation summary:
```
Keyword:   <keyword>
Page type: <pageType>
Endpoint:  POST http://localhost:3000/api/v1/text-media
```
Ask the user to confirm before proceeding.

### Step 3: Call the API

Use the Bash tool to call the API:

```bash
curl -s -X POST http://localhost:3000/api/v1/text-media \
  -H "Content-Type: application/json" \
  -d '{"keyword": "<keyword>", "pageType": "<pageType>"}' \
  --max-time 300
```

The pipeline takes ~1–3 minutes. Let the user know it's running.

### Step 4: Report the result

On success, extract and display:
- The output file path (Phase 5 markdown file in `src/repositories/final/`)
- Word count and section count if available in the response
- Any errors or warnings from the response

Then offer follow-up actions:
1. **Read the file** — show the generated article in the terminal
2. **Upload to WordPress** — upload as a draft via the WordPress REST API (see Step 5)
3. **Do nothing** — the file is saved and ready

### Step 5: WordPress upload (if requested)

If the user chooses "Upload to WordPress":

1. Ask: **"Would you like to upload this to WordPress as a draft?"** — wait for confirmation.

2. On confirmation, call the upload endpoint:

```bash
curl -s -X POST http://localhost:3000/api/v1/wp-upload \
  -H "Content-Type: application/json" \
  -d '{"keyword": "<keyword>", "pageType": "<pageType>"}' \
  --max-time 30
```

3. On success, report:
   - **WordPress URL** — the `wordpress_url` from the response
   - **Edit URL** — the `wordpress_edit_url` from the response
   - **Status** — draft (always draft mode)
   - **Content type** — page (for `service_page`) or post (for `blog`)
   - Remind the user: *"Review the draft in WordPress before publishing."*

4. On error, check the HTTP status:
   - **500 or 502**: WordPress credentials may not be configured. Show this message:
     ```
     WordPress upload failed. Make sure these variables are set in .local.env:
       WP_BASE_URL=https://your-site.com
       WP_USERNAME=your_wp_username
       WP_APP_PASSWORD=your_wp_application_password

     Generate an Application Password in WordPress: Users → your profile → Application Passwords.
     ```
   - **404**: The generated article file was not found. Suggest re-running generation first.
   - **Other errors**: Show the error message from the response and suggest checking server logs.

### Notes
- Make sure the dev server is running (`npm run dev` on port 3000) before calling the API
- If the server isn't reachable, remind the user to start it and offer to retry
- The generated file will be at: `src/repositories/final/phase5_article_<slug>.md`
