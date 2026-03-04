# Meta-Prompt: Location Page Interlinking Pipeline

## Purpose
Orchestrate strategic internal linking across a network of wildlife removal location pages. Build a geographic link graph, identify organic insertion points, and iteratively weave links into existing content — producing a tightly interlinked location page network that signals topical authority and geographic relevance to search engines.

## Context
This system generates location service pages for AAAC Wildlife Removal. Pages follow a parent-child hierarchy:
- **Parent**: `{location} Wildlife Removal` (e.g., "Richardson Wildlife Removal")
- **Children**: `{animal} Removal {location}` (e.g., "Raccoon Removal Richardson TX")

URL pattern: `https://[market].aaacwildliferemoval.com/service-area/[location]/[service]/`

Pages are stored locally as markdown in `src/repositories/final/phase5_article_*.md` and published to WordPress via the `/api/v1/wp-upload` endpoint.

---

## Stage 1: Build the Link Map

### Prompt for Stage 1 (Research Agent)

```xml
<role>You are a geographic data architect building an internal link graph for a network of wildlife removal location pages.</role>

<task>
Build a complete link map as a JSON data structure containing:

1. **Inventory all location pages** — Scan `src/repositories/final/` for all `phase5_article_*.md` files. For each file, extract:
   - Filename / slug
   - Service type (raccoon, bat, squirrel, wildlife, etc.)
   - Location (city, state)
   - Page type: "parent" (general wildlife removal) or "child" (specific animal service)

2. **Resolve geocoordinates** — For each unique location (city), look up approximate lat/lng coordinates. Use well-known coordinates for Texas cities (e.g., Richardson TX: 32.9483, -96.7299; Addison TX: 32.9612, -96.8292).

3. **Build the hierarchy** — Map parent-child relationships:
   - Each location's general "wildlife removal" page is the parent
   - Each animal-specific page for that location is a child
   - If no general wildlife page exists for a location, note it as an orphan

4. **Calculate geographic proximity** — For each location, identify the 2-4 nearest other locations by straight-line distance. Store as adjacency list with distances in miles.

5. **Generate the link matrix** — For each page, produce a list of pages it SHOULD link to:
   - **Vertical links (parent ↔ child)**: Parent links down to all its children. Each child links up to its parent.
   - **Horizontal links (sibling ↔ sibling)**: Child pages of the same location link to each other (e.g., Richardson Raccoon ↔ Richardson Squirrel).
   - **Geographic links (neighbor ↔ neighbor)**: Parent pages link to the nearest 2-3 neighboring location parent pages.
   - **Cross-geographic child links**: A child page links to the same-service child page in neighboring locations (e.g., Richardson Raccoon Removal ↔ Addison Raccoon Removal).
</task>

<output-format>
Save the link map to `src/repositories/data/link_map.json` with this structure:

```json
{
  "generated": "ISO-8601 timestamp",
  "locations": {
    "richardson_tx": {
      "city": "Richardson",
      "state": "TX",
      "lat": 32.9483,
      "lng": -96.7299,
      "nearest_neighbors": [
        { "location": "addison_tx", "distance_miles": 3.2 }
      ]
    }
  },
  "pages": {
    "raccoon_removal_richardson_tx": {
      "file": "phase5_article_raccoon_removal_richardson_tx.md",
      "service": "raccoon_removal",
      "location": "richardson_tx",
      "page_type": "child",
      "parent_page": "wildlife_removal_richardson_tx",
      "published_url": null,
      "links_needed": [
        {
          "target_page": "wildlife_removal_richardson_tx",
          "link_type": "child_to_parent",
          "anchor_text_suggestion": "Richardson wildlife removal services",
          "priority": "high"
        },
        {
          "target_page": "raccoon_removal_addison_tx",
          "link_type": "cross_geographic_same_service",
          "anchor_text_suggestion": "raccoon removal in nearby Addison",
          "priority": "medium"
        }
      ]
    }
  }
}
```
</output-format>

<rules>
- Every link relationship must be bidirectional — if Page A links to Page B, Page B must also link to Page A
- Limit outbound links per page to 6-8 maximum to avoid over-optimization
- Prioritize links: vertical (parent/child) > horizontal (siblings) > geographic > cross-geographic
- Only create link entries for pages that actually exist in the repository
- Flag any locations that have children but no parent page
</rules>
```

### Verification Criteria
- [ ] All pages in `src/repositories/final/` are inventoried
- [ ] Every page has at least 2 link targets
- [ ] No page exceeds 8 outbound link targets
- [ ] All links are bidirectional
- [ ] Geographic distances are plausible (Texas cities)
- [ ] `link_map.json` is valid JSON and saved to `src/repositories/data/`

---

## Stage 2: Find Organic Insertion Points

### Prompt for Stage 2 (Planning Agent)

```xml
<role>You are an SEO content strategist who specializes in making internal links feel natural and editorial — never forced or spammy.</role>

<context>
Read the link map from `src/repositories/data/link_map.json`.
For each page that has `links_needed` entries, read the full markdown content from the corresponding file in `src/repositories/final/`.
</context>

<task>
For each page, analyze the existing content and identify the best organic insertion points for each required link. Produce a detailed linking plan.

For each link to insert, specify:

1. **Insertion location** — The specific paragraph or sentence where the link fits most naturally. Quote the surrounding text (2-3 sentences of context).

2. **Integration strategy** — How to weave the link in. Choose one:
   - **Extend**: Add a new sentence that naturally mentions the linked topic/location
   - **Rewrite**: Modify an existing sentence to incorporate the link
   - **Append**: Add a brief transitional sentence at the end of a paragraph
   - **List item**: Add to an existing bulleted/numbered list

3. **Anchor text** — The exact clickable text. Must be:
   - Keyword-rich but conversational (e.g., "raccoon removal services in Addison" not "click here")
   - Varied across the page (no two anchors should use identical phrasing)
   - 3-7 words long

4. **Link URL** — The target URL using the pattern: `https://[market].aaacwildliferemoval.com/service-area/[location]/[service]/`
   - If the published URL is known from the link map, use it
   - Otherwise, construct the expected URL from the slug

5. **Insertion order** — Number each link 1-N in the order they should be inserted. Spread links across the full page — never cluster more than 2 links in a single section.
</task>

<output-format>
Save the linking plan to `src/repositories/data/linking_plan.json`:

```json
{
  "generated": "ISO-8601 timestamp",
  "pages": {
    "raccoon_removal_richardson_tx": {
      "file": "phase5_article_raccoon_removal_richardson_tx.md",
      "total_links": 4,
      "insertions": [
        {
          "order": 1,
          "target_page": "wildlife_removal_richardson_tx",
          "link_type": "child_to_parent",
          "strategy": "rewrite",
          "section": "Hero / Intro",
          "context_quote": "Our professional wildlife removal services in Richardson, TX, are here to help.",
          "anchor_text": "professional wildlife removal services in Richardson",
          "target_url": "https://dallas.aaacwildliferemoval.com/service-area/richardson/wildlife-removal/",
          "modified_text": "Our [professional wildlife removal services in Richardson](https://dallas.aaacwildliferemoval.com/service-area/richardson/wildlife-removal/), TX, are here to help."
        }
      ]
    }
  }
}
```
</output-format>

<rules>
- Maximum 1 link per section (8 sections per page, 6-8 links max — so most sections get 1 link, a couple get 0)
- Never place a link in the first sentence of the first section (H1 area)
- Never place a link inside a CTA sentence
- Anchor text must read naturally in context — read the full sentence aloud
- Space links at least 2 paragraphs apart within the same section
- Vary the integration strategy — don't use "extend" for every link
- If a page's content doesn't have a natural spot for a link, note it as "deferred" rather than forcing it
- Geographic links should reference the neighboring city naturally (e.g., "homeowners in nearby Addison" not "Addison wildlife removal page")
</rules>
```

### Verification Criteria
- [ ] Every `links_needed` entry from the link map has a corresponding insertion plan (or is marked "deferred")
- [ ] No section has more than 1 link
- [ ] Links are spread across at least 3 different sections per page
- [ ] All anchor texts read naturally in their surrounding context
- [ ] No two anchor texts on the same page are identical
- [ ] `linking_plan.json` is valid JSON and saved to `src/repositories/data/`

---

## Stage 3: Iterative Link Insertion

### Prompt for Stage 3 (Execution Agent)

```xml
<role>You are a meticulous content editor inserting internal links into existing wildlife removal location pages. You work one link at a time, preserving the original voice and quality of the content.</role>

<context>
Read the linking plan from `src/repositories/data/linking_plan.json`.
Process pages one at a time. Within each page, insert links in the specified order (1, 2, 3...).
</context>

<task>
For each page in the linking plan:

1. **Read the current markdown** from `src/repositories/final/{file}`
2. **Insert link #1** according to the plan:
   - Find the `context_quote` in the content
   - Apply the specified `strategy` (extend/rewrite/append/list item)
   - Insert the markdown link: `[anchor text](url)`
   - Re-read the surrounding paragraph to verify it reads naturally
3. **Save the file** back to `src/repositories/final/{file}`
4. **Insert link #2** — Read the file again (it now has link #1), find the next insertion point, apply, save
5. **Repeat** for all links in order
6. **Final review** — After all links are inserted for a page, read the entire file and verify:
   - All links render correctly in markdown
   - No broken formatting
   - Links are well-distributed across sections
   - Content still reads naturally and professionally
   - No link appears in a CTA sentence

After completing a page, log the results before moving to the next page.
</task>

<output-format>
After all pages are processed, save a summary to `src/repositories/data/linking_report.json`:

```json
{
  "generated": "ISO-8601 timestamp",
  "summary": {
    "pages_processed": 12,
    "total_links_inserted": 48,
    "deferred_links": 3,
    "errors": 0
  },
  "pages": {
    "raccoon_removal_richardson_tx": {
      "links_inserted": 4,
      "links_deferred": 0,
      "sections_with_links": ["Hero / Intro", "Why Act Now", "Our Removal Process", "Local Service Area"],
      "status": "complete"
    }
  },
  "deferred": [
    {
      "page": "bat_removal_addison_tx",
      "target": "bat_removal_irving_tx",
      "reason": "No natural insertion point found in current content"
    }
  ]
}
```
</output-format>

<rules>
- NEVER batch-insert multiple links at once — always one at a time with a file save between each
- After inserting a link, re-read the paragraph to catch formatting issues before proceeding
- If the `context_quote` from the plan doesn't match the current file content (perhaps it was already modified by a previous link), find the closest matching text and adapt
- Preserve all existing formatting: HTML tags, markdown headers, lists, emphasis
- Link format: `[anchor text](url)` — standard markdown, no HTML anchor tags
- If a link insertion would break the flow of a CTA, skip it and mark as deferred
- Keep a running count of links per page to ensure you don't exceed the plan
- Do NOT modify any content beyond the specific insertion — no "improving" or "fixing" surrounding text
</rules>
```

### Verification Criteria
- [ ] All planned links are inserted (or explicitly deferred with reason)
- [ ] Every inserted link is valid markdown and renders correctly
- [ ] No CTA sentences contain links
- [ ] No section has more than 1 internal link
- [ ] Content reads naturally — no awkward link placement
- [ ] `linking_report.json` is saved with accurate counts
- [ ] Original content outside of link insertions is unchanged

---

## Execution Order

1. **Run Stage 1** (Research) → Produces `link_map.json`
2. **Human review** of link map — verify locations, distances, and link targets make sense
3. **Run Stage 2** (Planning) → Produces `linking_plan.json`
4. **Human review** of linking plan — verify anchor texts and insertion points
5. **Run Stage 3** (Execution) → Modifies markdown files, produces `linking_report.json`
6. **Human review** of modified pages — spot-check 2-3 pages for quality
7. **Publish** — Re-upload modified pages to WordPress via `/api/v1/wp-upload`

## Dependencies

- All `phase5_article_*.md` files must exist in `src/repositories/final/`
- Published URLs should be populated in `link_map.json` after initial WordPress upload (Stage 1 can use constructed URLs as fallback)
- The WordPress site's permalink structure must match the URL pattern: `/service-area/[location]/[service]/`

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_outbound_links` | 8 | Maximum outbound internal links per page |
| `max_links_per_section` | 1 | Maximum links within a single H2 section |
| `min_neighbor_count` | 2 | Minimum geographic neighbors to link to |
| `max_neighbor_count` | 4 | Maximum geographic neighbors to link to |
| `market` | `dallas` | WordPress multisite market identifier for URL construction |
| `link_priority_order` | `["parent_child", "sibling", "geographic", "cross_geographic"]` | Priority order for link allocation when page approaches max |
