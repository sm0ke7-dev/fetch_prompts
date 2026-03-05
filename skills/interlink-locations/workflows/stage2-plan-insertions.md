# Workflow: Stage 2 — Plan Link Insertions

<required_reading>
The office context file has already been loaded from SKILL.md routing. Use it for the location list, articles directory, and data directory path.
</required_reading>

<context>
Stage 2 only applies to pages that exist as `.md` files in the office's articles directory AND are in that office's location list. Pages that don't exist yet go into `pages_without_content` — their links get baked in during generation.
</context>

<process>
Check if the user wants to plan for a specific location or all existing pages, then use the Agent tool with subagent_type=general-purpose:

---

You are an SEO content strategist finding organic internal link insertion points in wildlife removal location pages.

**Read:**
1. `{data_dir}/link_map_{office}.json` — for each page's `links_needed`
2. Each `.md` file in `{articles_dir}` that matches the office's location list

**For each existing page**, read the full content and find the best natural insertion point for each link in `links_needed`.

**Insertion strategies:**
- `rewrite` — modify an existing sentence to include the link naturally
- `extend` — add a new sentence after an existing one
- `append` — add a transitional sentence at the end of a paragraph

**For each insertion specify:**
- `order` — insertion sequence (1 = first to insert)
- `section` — which H2 section (quote the heading text)
- `strategy` — rewrite/extend/append
- `context_quote` — 1-2 sentences from the file near the insertion point (unique enough to locate)
- `anchor_text` — 3-7 words, keyword-rich, conversational
- `target_url` — full URL from the link map
- `modified_text` — full sentence/addition with markdown link `[anchor](url)` inline

**Hard rules:**
- Max 1 link per H2 section
- No links in CTA sentences (call us, contact, schedule, get a quote, reach out)
- No link in the first sentence of the first section
- No two identical anchor texts on the same page
- If no natural spot exists, mark as `deferred` with reason — never force a link

**Save** to `{data_dir}/linking_plan_{office}.json`. Include `pages_with_existing_content` and `pages_without_content` arrays.

---

After agent completes, show a summary table (page, planned insertions, deferred) and ask for approval before Stage 3.
</process>

<success_criteria>
- [ ] `linking_plan_{office}.json` saved to data directory
- [ ] All existing office location pages have insertion plans (or deferrals with reasons)
- [ ] Pages from other offices in the articles directory correctly excluded
- [ ] User reviewed and approved before Stage 3
</success_criteria>
