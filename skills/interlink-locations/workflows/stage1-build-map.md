# Workflow: Stage 1 — Build Link Map

<required_reading>
The office context file has already been loaded from SKILL.md routing. Use it for all office-specific values (locations, coords, URL pattern, file paths).
</required_reading>

<process>
Use the Agent tool with subagent_type=general-purpose and this prompt (fill in {office} and {data_dir} from the office context file):

---

You are a geographic data architect. Build a complete internal link map for a wildlife removal company's location pages.

**Office context** (already loaded — use these values):
- Market slug, base URL pattern, data directory path, locations list with lat/lng, services list, link budget

**Compute distances** using the Haversine formula for all city pairs. For each city, find its 3 nearest neighbors by straight-line miles.

**Build all page entries** (N locations × 4 services). For each page, populate `links_needed` per the link budget.

**Anchor text — vary these, don't repeat the same phrasing:**
- parent_to_child: "raccoon removal in {city}", "our {city} raccoon removal team", "professional raccoon control in {city}"
- child_to_parent: "wildlife removal services in {city}", "our {city} wildlife removal experts", "full-service wildlife removal in {city}"
- sibling: "squirrel removal in {city}", "bat removal services in {city}"
- geographic_parent: "wildlife removal in nearby {neighbor}", "{neighbor} wildlife removal services"
- cross_geographic: "raccoon removal in {neighbor}", "raccoon control serving {neighbor}"

**Save** to `{data_dir}/link_map_{office}.json` as valid JSON.

JSON structure:
```json
{
  "generated": "ISO timestamp",
  "office": "{office}",
  "market": "{market}",
  "url_pattern": "...",
  "total_locations": N,
  "total_pages": N,
  "services": [...],
  "locations": {
    "{city_key}": { "city": "...", "state": "...", "city_slug": "...", "lat": ..., "lng": ..., "nearest_neighbors": [...] }
  },
  "pages": {
    "{page_key}": {
      "file": "phase5_article_{page_key}.md",
      "service": "...", "service_slug": "...",
      "location_key": "...", "city": "...", "city_slug": "...", "state": "...",
      "page_type": "parent|child",
      "parent_page": "...",
      "published_url": "...",
      "links_needed": [
        { "target_page": "...", "link_type": "...", "anchor_text_suggestion": "...", "target_url": "...", "priority": "high|medium" }
      ]
    }
  }
}
```

Confirm the file was written and report total pages and link relationships created.

---

After agent completes, report the summary to the user and ask for review before Stage 2.
</process>

<success_criteria>
- [ ] `link_map_{office}.json` saved to the data directory
- [ ] Every page has correct link budget (parent=6, child=5)
- [ ] All relationships bidirectional
- [ ] Distances plausible for the office's metro area
- [ ] User reviewed and approved before Stage 2
</success_criteria>
