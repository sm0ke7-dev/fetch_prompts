---
name: interlink-locations
description: Builds and executes a strategic internal linking plan across AAAC Wildlife Removal location pages. Supports all offices (dallas, nashville, austin, charlotte, etc.). Use when adding new locations, retrofitting links into existing pages, or running the full 3-stage interlinking pipeline.
---

<essential_principles>
## How This Skill Works

This skill runs a 3-stage pipeline to build and insert internal links across location service pages:

- **Stage 1** — Builds a geographic link map (all pages, distances, link targets) → `link_map_{office}.json`
- **Stage 2** — Analyzes existing page content to find organic insertion points → `linking_plan_{office}.json`
- **Stage 3** — Iteratively inserts links one at a time into markdown files → updated `.md` files + report

**Before running any workflow**, load the office context file:
`references/offices/{office}.md`

This file contains the authoritative location list, geocoordinates, URL pattern, services, and file paths for that office. Never hardcode office-specific data — always read it from the office file.

**Output files are namespaced by office:**
- `link_map_dallas.json`, `link_map_nashville.json`, etc.
- `linking_plan_dallas.json`, `linking_plan_nashville.json`, etc.
- `linking_report_dallas_{scope}.json`, etc.

All files saved to the `data/` directory specified in the office file.
</essential_principles>

<intake>
Two quick questions before we start:

1. **Which office?** (e.g., dallas, nashville, austin, charlotte — or type the name)
2. **Which stage?**
   - Stage 1 — Build (or rebuild) the link map
   - Stage 2 — Generate the linking plan from existing content
   - Stage 3 — Insert links into pages (you'll specify which location)
   - Full pipeline — All 3 stages end-to-end

**Wait for response before proceeding.**
</intake>

<routing>
Once office and stage are known:

1. Load `references/offices/{office}.md`
2. Route to the appropriate workflow:

| Stage | Workflow |
|-------|----------|
| 1, "build map", "rebuild" | `workflows/stage1-build-map.md` |
| 2, "plan", "insertion points" | `workflows/stage2-plan-insertions.md` |
| 3, "insert", "execute" | `workflows/stage3-insert-links.md` |
| "all", "full", "pipeline" | Run all 3 workflows in sequence with review gates |

If the office has no file in `references/offices/`, tell the user to copy `_template.md`, fill it in for their office, and save it as `{office}.md` before proceeding.

**After reading the workflow, follow it exactly.**
</routing>

<reference_index>
`references/offices/dallas.md` — Dallas office (20 locations, DFW metro)
`references/offices/_template.md` — Blank template for adding new offices
</reference_index>

<workflows_index>
| Workflow | Purpose |
|----------|---------|
| stage1-build-map.md | Build geographic link map for all pages in the office |
| stage2-plan-insertions.md | Find organic link insertion points in existing content |
| stage3-insert-links.md | Iteratively insert links into markdown files |
</workflows_index>
