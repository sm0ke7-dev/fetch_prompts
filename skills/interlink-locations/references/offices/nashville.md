<office>
**Market:** nashville
**Articles directory:** `C:/Users/Banana/Documents/dan-dev/article-writer/fetch_prompts/src/repositories/final/`
**Data directory:** `C:/Users/Banana/Documents/dan-dev/article-writer/fetch_prompts/src/repositories/data/`

**URL pattern — parent pages** (wildlife removal hub, no service slug):
`https://nashville.aaacwildliferemoval.com/service-area/{location-slug}/`
e.g. `https://nashville.aaacwildliferemoval.com/service-area/brentwood/`
Upload slug = city slug only (e.g. `brentwood`, `mount-juliet`)

**URL pattern — child pages** (animal services):
`https://nashville.aaacwildliferemoval.com/service-area/{location-slug}/{service-slug}/`
e.g. `https://nashville.aaacwildliferemoval.com/service-area/brentwood/raccoon-removal/`
Upload slug = `{service-slug}-{location-slug}` (e.g. `raccoon-removal-brentwood`)
</office>

<locations>
35 Nashville-area cities. Each has exactly 4 pages: 1 parent (wildlife removal) + 3 children (raccoon, squirrel, bat).

| City | Slug | Lat | Lng |
|------|------|-----|-----|
| Adams | adams | 36.5822 | -87.0656 |
| Ashland City | ashland-city | 36.2742 | -87.0639 |
| Belle Meade | belle-meade | 36.0959 | -86.8569 |
| Bellevue | bellevue | 36.0727 | -86.9624 |
| Brentwood | brentwood | 36.0331 | -86.7828 |
| Cedar Hill | cedar-hill | 36.5514 | -86.9992 |
| Clarksville | clarksville | 36.5298 | -87.3595 |
| Coopertown | coopertown | 36.4375 | -86.9672 |
| Donelson | donelson | 36.1679 | -86.6605 |
| Fairview | fairview | 35.9820 | -87.1214 |
| Forest Hills | forest-hills | 36.0684 | -86.8442 |
| Franklin | franklin | 35.9251 | -86.8689 |
| Gallatin | gallatin | 36.3884 | -86.4467 |
| Georgetown | georgetown | 36.1900 | -86.2200 |
| Germantown | germantown | 36.1771 | -86.7893 |
| Goodlettsville | goodlettsville | 36.3231 | -86.7133 |
| Greenbrier | greenbrier | 36.4275 | -86.8047 |
| Greenville | greenville | 36.2970 | -86.8880 |
| Hendersonville | hendersonville | 36.3050 | -86.6200 |
| Hermitage | hermitage | 36.1962 | -86.6225 |
| La Vergne | la-vergne | 36.0156 | -86.5819 |
| Lakewood | lakewood | 36.2430 | -86.6360 |
| Lebanon | lebanon | 36.2081 | -86.2911 |
| Madison | madison | 36.2537 | -86.7083 |
| Millersville | millersville | 36.3712 | -86.7100 |
| Mount Juliet | mount-juliet | 36.2009 | -86.5197 |
| Murfreesboro | murfreesboro | 35.8461 | -86.3921 |
| Nashville | nashville | 36.1627 | -86.7816 |
| Oak Hill | oak-hill | 36.0878 | -86.7831 |
| Oakland | oakland | 36.5002 | -86.8298 |
| Pleasant View | pleasant-view | 36.3942 | -87.0367 |
| Portland | portland | 36.5817 | -86.5164 |
| Smyrna | smyrna | 35.9828 | -86.5186 |
| Springfield | springfield | 36.5092 | -86.8850 |
| White House | white-house | 36.4703 | -86.6514 |

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
- Communities within Nashville-Davidson County: Madison, Hermitage, Donelson, Bellevue, Lakewood, Belle Meade, Oak Hill, Forest Hills, Germantown
- Pages in `final/` from other offices should be ignored — use the location list above as source of truth
</notes>
