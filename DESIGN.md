# Artesia Country Club — Design system

## Provenance and direction
Generated with Google Stitch on 2026-09-16. Project `13498805080345895681`, design system `17765108444370646929`, homepage screen `8c8e0f4ce5df42599583b0db7b6c7512`. Exported design reference is `.stitch/designs/home.html` and screenshot `.stitch/designs/home.png`.

The implementation retains the generated editorial scale, dark surfaces, sage actions and open layout. The original white club logo wins over Stitch's generated emblem. Site photography uses actual club images, with one clearly labeled AI-generated course film based on the supplied photographs. Stitch's generated reference photography, invented viewpoint names/elevations and pool imagery are excluded. Original brand evidence is separately recorded in `content-manifest.md`.

## Typography
- Display: Newsreader, Georgia, serif. Regular 400 and italic 400; 500 for small editorial headings when needed.
- Body and labels: DM Sans, Arial, sans-serif. 400, 500, 600.
- Hero: clamp(56px, 7.7vw, 112px), line-height 0.98, tracking -0.045em.
- Section titles: clamp(40px, 4.5vw, 68px), line-height 1.06, tracking -0.035em.
- Subhead: 28–36px; body 16px/1.7; lead 18px/1.65; small 14px/1.6.
- Eyebrows: 11px/1.5, 600, uppercase, 0.16em tracking. Never use these for paragraph text.

## Color roles
| Role | Hex | Use |
|---|---|---|
| Forest | #111D18 | Main background, CTA text |
| Deep forest | #0A1611 | Footer and flyover stage |
| Raised surface | #1C2C23 | Quiet alternate sections |
| Warm ivory | #F3F0E7 | Main text |
| Muted sage | #BAC3B7 | Secondary text |
| Sage | #B6C79A | Primary CTA background, small accents |
| Brass | #C4AA76 | Editorial markers, decorative details |
| Hairline | #35483C | Separators and borders |
| Paper | #ECE9E0 | Reading surfaces for rules and menus |
| Ink | #1B2C21 | Text on paper |

Normal text uses ivory or muted sage on forest; primary buttons use forest on sage. Text overlays sit on darkened photo regions. Verify both normal and button contrast to WCAG AA. Hairline borders are decorative; active controls use visible text and clear focus outlines.

## Layout and spacing
- Content max-width 1320px; reading content max-width 820px.
- Side gutters: clamp(22px, 4.6vw, 72px). Header desktop 40px, mobile 22px.
- Base rhythm 8px; micro-space 4px. Grid gaps 24–64px.
- Section spacing 112–128px desktop, 64–80px mobile.
- Hero fills the first viewport; photo, headline and bottom story markers form one composition.
- Alternate generous editorial sections and compact utility bars. Avoid repeated card grids.

## Components
- Memberships uses the existing dark raised surface (#1C2C23), ivory headings, muted sage body text and sage links. Its sidebar, separators and focus states follow the dark palette; other reference pages keep their existing paper treatment.
- Buttons 48–52px tall, 2px radius; text links minimum 44px touch area.
- Photos and resource rows: 0–2px radius, no unnecessary shadow.
- Inputs and select: 2px radius, 1px visible boundary, 48px minimum height.
- Header: transparent over hero then opaque forest after scroll; mobile disclosure with focus management and Escape close.
- Menus, rules and governance pages: simple paper reading surface, full source content, section index when useful.
- Google Calendar retains all six source IDs and America/Denver timezone; agenda mode is available on narrow screens.
- Existing forms open on the club's stable Squarespace hostname because its SAMEORIGIN policy prevents embedding. No nonfunctional form fields are shown locally.

## Motion and accessibility
- Native scroll; never intercept wheel, touch or keyboard navigation.
- Hero uses a subtle scroll parallax, disabled under reduced motion.
- Course film: the restored low flight along fairways, over the fountain pond and toward the clubhouse, based on supplied club photographs. Native scrolling seeks a paused video forward and backward; there is no automatic playback or audio.
- `src/drone-tour.js` loads the appropriate H.264 media near the section, serializes seeks, and keeps the latest requested position. Its built chunk is approximately 6.2 KB. The earlier approximately 483 KB Three.js tour bundle is no longer loaded; `src/flyover.js` remains archived.
- Desktop media is 1920 × 1080; mobile uses the original 720 × 1280 portrait crop and full-height presentation. Both run at 24 fps with six-frame keyframes, no B frames and fast-start metadata.
- Reduced-motion users initially see the matching film poster, with deliberate opt-in through the start control or position slider. A loading/decoding failure retains the poster and an accessible status message.
- Provide accessible flight progress slider, pause-motion button, and skip-flyover link; all course information remains available without animation.
- Keep the visible “AI-generated course film / Based on club photographs” credit linked to `/course-map/`. That page explains the generated route and unseen geometry, then separately presents the unchanged, dated USDA aerial reference. Do not describe the film as recorded drone footage or a surveyed walkthrough.
- Transitions: 180–300ms, transform/opacity only when possible. Focus 2px sage outline with 5px offset. Respect prefers-reduced-motion throughout.

The media and interaction are integrated. Desktop/mobile loading, bidirectional seeking, pause, and framing checks passed. See `QA.md` for measured results and remaining device checks, and `DRONE-FOOTAGE.md` for technical inspection and accuracy limits.

## Media color
- Warm natural cinematic grading: richer believable greens, subtly warm daylight, clean blue sky and balanced shadows. Retain dry tan rough characteristic of the actual location.
- Homepage hero uses the versioned image edit `course-clubhouse-graded-v2.jpg`; original course photo remains intact. Avoid an extra CSS brightness boost over the already graded asset.
- The active film and posters live in `public/video/`. The later fairway-only versions remain archived in their versioned subdirectories.

## Rationale
An established private club needs a welcoming sense of place and effortless access to daily essentials. The natural palette, serif editorial rhythm and photographic course story express that identity, while visible phone, calendar, menu, application and member-billing links keep the site useful.
