> Historical development notes. Both the site and launch work remain in progress. See the [portfolio README](../README.md) for current scope.

# Artesia Country Club

A static Vite + Tailwind website with a scroll-controlled, AI-generated course film. Source content was audited on September 16, 2026. The production bundle is generated into `dist/`; publishing and DNS changes remain separate steps.

## Run and verify

Install the locked dependencies with `npm ci`, then use:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Serve the generated site locally; use the URL printed by Vite. |
| `npm run build` | Regenerate all HTML pages, then compile the production bundle to `dist/`. |
| `npm run preview` | Preview the latest production bundle locally. |
| `npm run check` | Audit generated source and `dist/` for migrated routes, local targets, anchors, IDs, retained destinations, calendar sources, and download hashes. Run after building. |

Run the build and migration audit after edits. The revised course film passed desktop/mobile loading, bidirectional seeking, pause, and framing checks; see `QA.md`. Remote calendar availability and form delivery remain separate checks. The static audit sends no submissions.

## Edit the source

- `src/home.html`: homepage content and sections.
- `src/resource-data.js`: full menus, policies, contacts, memberships, event records, and the club-calendar page.
- `scripts/layout.mjs`: shared header, footer, metadata, and original form/billing links.
- `src/style.css`, `tailwind.config.js`: visual styling.
- `src/main.js`, `src/drone-tour.js`: navigation, calendar controls, and forward/reverse video seeking tied to scroll position.
- `public/video/`: active desktop/mobile course films and matching posters; reproduce them with `scripts/prepare-drone-media.sh` as documented in `DRONE-FOOTAGE.md`.
- `public/images/`, `public/documents/`: photographs, retained geographic assets, and original downloadable forms.

The earlier `src/flyover.js` Three.js renderer and its aerial/elevation assets remain as a research archive. The active page no longer loads that module. The current course-tour JavaScript chunk is approximately 6.2 KB, replacing the approximately 483 KB Three.js tour chunk; the video files have separate transfer costs.

`scripts/build-pages.mjs` generates the root and route `index.html` files, the 404 page, aliases, and sitemap. Edit the files above rather than generated HTML. After changing page content or shared layout, run `node scripts/build-pages.mjs` for the development preview, or `npm run build` for production. Keep `source-evidence/` and `functional-inventory.json` as the migration record.

## Preserved features and dependencies

The site retains all 18 audited source routes, complete menu and rule text, dress code, bylaws, board and management contacts, membership information, event details and archives, six downloadable resources, and the external member-billing destination. The live Google Calendar keeps all six original calendar sources and the `America/Denver` timezone. Dated offers and past events are identified as archives; the source’s ambiguous Wednesday `$1400` feature price carries a confirmation note.

Contact and newsletter actions open the original forms at `https://sparrow-sheep-7aha.squarespace.com/`. Keep that Squarespace site and subscription active: its delivery backend remains responsible for these forms, and its `SAMEORIGIN` response policy prevents embedding them here. No new form-provider key was supplied, and no live submission or delivery is claimed. The private-cart license agreement was listed as “Coming Soon” on the source and remains unavailable.

The active film is the restored 15-second Seedance 2.5 flight along the fairways, over the fountain pond and toward the clubhouse. Desktop uses the original 1080p encode; mobile uses its original portrait crop and full-height framing. Later fairway-only films remain archived. The route and unseen geometry are generated, not survey-accurate. A visible AI-generation label links to `/course-map/`, which explains this limitation and separately displays the real May 19, 2022 USDA aerial image. Reduced-motion users initially see the film poster and can opt into the tour; loading/decoding failures retain the poster.

## Project documentation

- [QA.md](../QA.md): completed checks and remaining calendar, form-delivery, and launch checks.
- [DESIGN.md](../DESIGN.md): Stitch-derived visual system and interaction rules.
- [content-manifest.md](../content-manifest.md): sourced content, assets, form audit, and discrepancies.
- [DRONE-FOOTAGE.md](../DRONE-FOOTAGE.md): generated film, references, encoding, and accuracy limits.
- [COURSE-GEOGRAPHY.md](../COURSE-GEOGRAPHY.md): archived aerial/terrain research and the factual course-map reference.
- [DEPLOYMENT.md](../DEPLOYMENT.md): Netlify/Vercel setup, verified DNS guidance, and launch dependencies.

The homepage hero uses `public/images/course-clubhouse-graded-v2.jpg`, edited from the original photograph with the built-in image tool. Its composition and landmarks were visually compared; fine details may be reconstructed. The unchanged source is retained. See `evidence/hero-grade-v2.md` for the exact prompt and provenance.
