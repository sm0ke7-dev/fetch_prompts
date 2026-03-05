<office>
**Market:** [office-slug]  ← e.g. nashville, austin, charlotte
**Base URL:** `https://[office-slug].aaacwildliferemoval.com/service-area/{location-slug}/{service-slug}/`
**Articles directory:** `C:/Users/Banana/Documents/dan-dev/article-writer/fetch_prompts/src/repositories/final/`
**Data directory:** `C:/Users/Banana/Documents/dan-dev/article-writer/fetch_prompts/src/repositories/data/`
</office>

<locations>
[N] locations. Each has exactly 4 pages: 1 parent (wildlife removal) + 3 children (raccoon, squirrel, bat).

| City | Slug | Lat | Lng |
|------|------|-----|-----|
| [City Name] | [city-slug] | [lat] | [lng] |
| ... | ... | ... | ... |

Tips for finding coordinates:
- Google Maps: right-click any location → "What's here?" → coordinates appear at the bottom
- Format: decimal degrees (e.g., 36.1627, -86.7816 for Nashville)

Tips for slugs:
- Single word cities: just lowercase (nashville, brentwood)
- Multi-word cities: hyphenate (mount-juliet, la-vergne, spring-hill)
</locations>

<services>
- `wildlife_removal` / `wildlife-removal` — parent page
- `raccoon_removal` / `raccoon-removal` — child page
- `squirrel_removal` / `squirrel-removal` — child page
- `bat_removal` / `bat-removal` — child page
</services>

<link_budget>
- Parent pages: 6 outbound links (3 parent-to-child + 3 geographic neighbors)
- Child pages: 5 outbound links (1 child-to-parent + 2 siblings + 2 cross-geographic same service)
- Geographic neighbors: 3 nearest by Haversine distance
- All relationships bidirectional
</link_budget>

<notes>
[Any office-specific notes — e.g. locations that only have partial pages, unusual service offerings, etc.]
</notes>
