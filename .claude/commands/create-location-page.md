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

Then offer to:
1. **Read the file** — show the generated article in the terminal
2. **Upload to WordPress** — (coming soon — Milestone 2)
3. **Do nothing** — the file is saved and ready

### Notes
- Make sure the dev server is running (`npm run dev` on port 3000) before calling the API
- If the server isn't reachable, remind the user to start it and offer to retry
- The generated file will be at: `src/repositories/final/phase5_article_<slug>.md`
