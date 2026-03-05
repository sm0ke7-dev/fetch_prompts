<office>
**Market:** dallas
**Articles directory:** `C:/Users/Banana/Documents/dan-dev/article-writer/fetch_prompts/src/repositories/final/`
**Data directory:** `C:/Users/Banana/Documents/dan-dev/article-writer/fetch_prompts/src/repositories/data/`

**URL pattern — parent pages** (wildlife removal hub, no service slug):
`https://dallas.aaacwildliferemoval.com/service-area/{location-slug}/`
e.g. `https://dallas.aaacwildliferemoval.com/service-area/addison/`
Upload slug = city slug only (e.g. `addison`, `cedar-hill`)

**URL pattern — child pages** (animal services):
`https://dallas.aaacwildliferemoval.com/service-area/{location-slug}/{service-slug}/`
e.g. `https://dallas.aaacwildliferemoval.com/service-area/addison/raccoon-removal/`
Upload slug = `{service-slug}-{location-slug}` (e.g. `raccoon-removal-addison`)
</office>

<locations>
20 Dallas-area cities. Each has exactly 4 pages: 1 parent (wildlife removal) + 3 children (raccoon, squirrel, bat).

| City | Slug | Lat | Lng |
|------|------|-----|-----|
| Sunnyvale | sunnyvale | 32.7957 | -96.5588 |
| Mesquite | mesquite | 32.7665 | -96.5991 |
| Cedar Hill | cedar-hill | 32.5885 | -96.9561 |
| University Park | university-park | 32.8501 | -96.7979 |
| Highland Park | highland-park | 32.8318 | -96.8009 |
| Sachse | sachse | 32.9757 | -96.5891 |
| Rowlett | rowlett | 32.9029 | -96.5638 |
| Rockwall | rockwall | 32.9318 | -96.4597 |
| Richardson | richardson | 32.9483 | -96.7299 |
| Lancaster | lancaster | 32.5921 | -96.7561 |
| Irving | irving | 32.8140 | -96.9490 |
| Grand Prairie | grand-prairie | 32.7459 | -96.9978 |
| Garland | garland | 32.9126 | -96.6389 |
| Fate | fate | 32.9418 | -96.3833 |
| Farmers Branch | farmers-branch | 32.9260 | -96.8799 |
| Duncanville | duncanville | 32.6518 | -96.9083 |
| DeSoto | desoto | 32.5996 | -96.8570 |
| Coppell | coppell | 32.9543 | -97.0146 |
| Carrollton | carrollton | 32.9537 | -96.8903 |
| Addison | addison | 32.9612 | -96.8292 |
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
- Irving only has bat removal currently — sibling links will be added once raccoon/squirrel pages are generated
- Pages in `final/` from other offices (Beaumont, Houston, NC) should be ignored — use the location list above as source of truth
</notes>
