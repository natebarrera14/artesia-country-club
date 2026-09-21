# Course geography research archive

Geographic research verified on September 16, 2026. This document preserves the evidence and geometry contract for the earlier aerial-map renderer. `src/flyover.js`, the original aerial photographs, and the elevation grids remain archived; the current site no longer loads that Three.js tour.

The active scroll experience now uses an AI-generated low-flight video controlled by `src/drone-tour.js`. Its route and unseen geometry are not established by the geographic research below. See [DRONE-FOOTAGE.md](./DRONE-FOOTAGE.md) for the references, finished media, and accuracy boundary.

The public `/course-map/` page keeps the schematic supplied by the user, an explicit AI-film explanation, and the real May 19, 2022 USDA aerial photograph as a separate reference. The film's visible AI-generation credit links to that page. Attribute the actual aerial image to USDA/USGS; do not attribute generated film frames to those agencies.

## Location and orientation

- Artesia Country Club is at **2701 W Richey Ave, Artesia, New Mexico 88210**. This matches the [club's published contact details](https://www.artesiacc.com/events) and the visible clubhouse/parking complex in the USDA aerial image.
- The playing grounds are approximately **west −104.4386°, south 32.8498°, east −104.4299°, north 32.8570°**. These are visual bounds, not a surveyed property line. The course is roughly 800 meters across.
- The clubhouse and parking are on the **north** edge, immediately south of W Richey Avenue. A north–south road borders the east side. The supplied illustrated course map broadly aligns north-up; the map itself does not provide a north arrow or georeferencing.
- Both delivered aerial textures are north-up, centered at **−104.4342°, 32.8534°**. In a Three.js horizontal scene, east is +X, south is +Z, north is −Z.
- In the 2,000-meter local scene, the clubhouse is approximately **X +115 m, Z −345 m**. The playing grounds occupy roughly X −400 to +400 m and Z −355 to +385 m. These are visual camera-composition guides, not surveyed feature coordinates.

## Landscape supported by imagery

The actual setting is gently sloping, dry southeastern New Mexico terrain. Narrow green fairways, tree rows, ponds, bunkers, and tan rough sit within a nearly square course. Directly north across Richey Avenue is a large irrigated semicircular field and an apartment complex. Housing lies northeast and in scattered plots west; the more developed city grid is east and south. Dry scrub, empty plots, and agricultural land continue west and north. These observations come from visual inspection of the downloaded USDA orthophotography.

The supplied map's large east-side blue pond does not match a large open-water feature in the May 2022 aerial; northwest and central water features are visible. Preserve the supplied map as a schematic reference and the aerial unchanged as a dated reference image. Later course/landscape changes are unverified. The active generated film does not resolve this discrepancy.

## Retained research assets

| Local asset | Dimensions | Ground coverage | Notes |
| --- | --- | --- | --- |
| `public/images/course-aerial.jpg` | 3072 × 3072 | 2,000 × 2,000 m | Main course and close surroundings, 1.26 MB |
| `public/images/course-context.jpg` | 4000 × 4000 | 4,000 × 4,000 m | Wider landscape for camera views, 2.61 MB |
| `public/images/course-elevation.json` | 65 × 65 values | Same extent as course-aerial | Real USGS bare-earth elevations, 1040.438–1061.747 m |
| `public/images/context-elevation.json` | 65 × 65 values | Same extent as course-context | Real USGS bare-earth elevations, 1033.907–1070.508 m |

The JPGs are direct natural-color USGS image-service exports, with bilinear resampling. No generative editing, replacement landscaping, color regrading, invented trees, or invented structures was applied. The site may optimize encodings without changing the geography.

Exact projected extents and reproducible download URLs are in `evidence/aerial-extents.json`. Both image and elevation exports use EPSG:3857 (Web Mercator). Approximate WGS84 texture extents:

| Texture | West | South | East | North |
| --- | --- | --- | --- | --- |
| Course | −104.4448934484 | 32.8444163924 | −104.4235065516 | 32.8623826981 |
| Context | −104.4555868968 | 32.8354318754 | −104.4128131032 | 32.8713644865 |

## Archived renderer elevation contract

Each JSON contains `width`, `height`, `heightsMeters`, `groundSizeMeters`, `bbox3857`, and `baseElevationMeters` (1050). Heights are in meters and stored in row-major order: **north-to-south rows, west-to-east columns**. Values are actual elevations, not normalized grays or invented displacements. Samples represent pixel centers; their spacing is 30.769 m for the course grid and 61.538 m for the context grid. This is deliberately coarse for browser performance.

For a ground mesh, subtract the common base elevation of 1050 m and retain 1:1 vertical scale. Reprojected map widths were adjusted by cos(latitude) so `groundSizeMeters` approximates true local ground distance. Keep elevations in ground meters rather than multiplying them by the Web Mercator scale. Use bilinear interpolation when sampling these grids, with pixel-center coordinates `u * width - 0.5` and `v * height - 0.5`, clamped at the edges. Computing geometry vertices this way avoids stretching center samples to the image's outer corners.

The DEM describes bare earth. In the archived renderer, trees, rooflines, flags, ponds, cars, and shadows remain features in the photograph rather than volumetric objects. If that renderer is restored, use an elevated, downward-looking camera and avoid views that imply full photogrammetry. Do not exaggerate relief or extend/repeat the ground texture beyond its known bounds. These constraints describe the archived terrain renderer, not the generated film.

## Provenance and permission

**Aerial photograph:** USDA National Agriculture Imagery Program, delivered through [USGS NAIP Imagery ImageServer](https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer). The intersecting source tiles are `m_3210413_ne_13_060_20220519` and `m_3210413_nw_13_060_20220519`, both acquired **19 May 2022**, both **0.6-meter** source resolution, agency USDA, vendor USDA-FSA-APFO. Tile catalog attributes are saved in `evidence/aerial-catalog.json`. USGS describes NAIP as public-domain orthoimagery in its [service metadata](https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer?f=pjson), and explains its orthorectification and accuracy in the [NAIP archive documentation](https://www.usgs.gov/centers/eros/science/usgs-eros-archive-aerial-photography-national-agriculture-imagery-program-naip).

**Elevation:** [USGS 3DEP Bare Earth DEM Dynamic ImageServer](https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer). Exported with the `None` raster function and F32 pixel type into georeferenced TIFF, then serialized without changing numeric values except rounding to 0.001 m. Source catalog at the course includes the 1-meter `NM_SouthEast_2018_D19` project and 1/3-arc-second and 1-arc-second `n33w105` products. Catalog acquisition-date field is 5 April 2019; the service uses its default best-available mosaic. Vertical datum is **NAVD 88**. The service was current through 24 August 2026 when accessed; that service update date is not a new site survey. Original exports and catalog evidence are saved under `evidence/`.

USGS states that [all 3DEP products are free and without use restrictions](https://www.usgs.gov/3d-elevation-program). A suitable nearby attribution is **“Aerial imagery: USDA / USGS, May 2022 · Terrain: USGS 3DEP.”** Link to the two services. Public-domain source availability permits these local derivatives; retain their factual attribution and dates.

## Archived validation and remaining limits

- Archived `src/flyover.js` implements a scroll-driven Three.js camera over a single measured terrain mesh. The course and context photographs blend across their matching extents; no independent overlay plane or repeated map texture is used. The module is no longer imported by the active site.
- The archived camera geometry was checked at 101 progress positions across nine aspect ratios from 0.35 to 5.0, testing all screen corners/edge midpoints at ground heights −25 m and +25 m relative to the 1050 m datum. All 16,362 sampled intersections stayed inside the 4-kilometer photograph, with the farthest horizontal coordinate 1,688.8 m from center against a 2,000 m limit. These measurements do not validate the new generated film or its route.
- The earlier implementation had a real-photo fallback for reduced motion and WebGL failures. The active video implementation instead uses matching generated-film posters and media-loading safeguards; its browser verification is separate.
- Both JPGs were opened and visually inspected: they cover the same real course and surrounding landscape, north-up, without blank tiles.
- Both original elevation TIFFs decode as 65 × 65 Float32 rasters with valid, finite height ranges. Their pixel sizes and tiepoints match the requested image extents.
- JSONs contain 4,225 finite numeric elevation values each. Source imagery dates and resolution were verified for both intersecting NAIP tiles.
- The geographic sources do not establish today's vegetation, water level, construction, greens condition, precise hole yardages, property boundary, or building/tree heights. They also cannot certify the generated film's spatial continuity.
- The original user photographs remain evidence for the course's ground-level visual character. They are retained on the site and served as the film's appearance references.
