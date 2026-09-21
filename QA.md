# Verification record — September 16, 2026

The local redesign is built and reviewable. It has not been published or connected to the club’s domain.

## Memberships dark styling — September 16, 2026

Memberships now uses the existing dark raised surface, ivory headings and sage text/links. Styles are scoped to `.membership-page` and screen media, preserving other resource pages and print styling. Content data, downloads and form destinations are unchanged. Build and preservation audit passed. Browser screenshots at 1280 × 900 and 375 × 812 confirmed readable content/application links, no horizontal overflow and no warning/error console entries.


## Latest change — restored water and clubhouse film

Restored at user request on September 16, 2026: original `/video/course-drone.mp4`, mobile portrait encode and matching posters. Later fairway films remain archived. Build and preservation audit passed. Browser checks at 1280 × 900 and 375 × 812 loaded the intended source (readyState 4), sought to 15.040667 seconds and showed the clubhouse ending without horizontal overflow or console warnings/errors. Original full-height mobile framing is restored. Homepage hero and other club content are unchanged. Revision 3 entries below are historical.


## Fairway revision 3 — September 16, 2026

- One approved 15-second 1080p generation was integrated in `public/video/fairway-v3/`; prior media is retained. Original is 1920 × 1080 HEVC; desktop is 1920 × 1080 H.264 and mobile is 1280 × 720 H.264. Both web files are CRF 18, 24 fps, 15.041667 s, six-frame keyframe spacing, no B frames/audio and fast-start metadata.
- Motion/visual evidence: browser playback reached the endpoint without decoder errors; full-size opening/middle/end frames plus 30 half-second cart/flag detail samples were reviewed. Cart remains on the path with attached bag, driver retains blue, flag persists, and course landmarks progress coherently. Tiny wheel/clothing details and unsampled frames are not certified. The film is a generated interpretation, not surveyed geography.
- Desktop production preview at 1280 × 900: readyState 4, forward scroll 4.155398 s, reverse 1.368266 s, keyboard End 15.040667 s. Pause held 11.791256 s through subsequent scrolling. Overlays remain readable with cart and flag visible.
- Mobile production preview at 375 × 812: selected the landscape mobile source, readyState 4, forward 7.786565 s, reverse 4.770816 s, End 15.040667 s. Pause held 10.839393 s. The entire image displays at 375 × 210.9375 with headings/controls outside. Skip tour reached `#after-flight` at approximately 100 px below the viewport top.
- No horizontal overflow or warning/error console entries in either checked viewport. Matching posters load. Both MP4s return HTTP 206 with valid 1,024-byte ranges; posters and compiled entry CSS/JS return HTTP 200. See `evidence/fairway-v3-http-check.json`.
- `npm run build` and `npm run check` pass: 23 pages, 18 source routes, two calendar embeds, six source-matched downloads and retained form/billing destinations. A separate 21-check SHA-256 comparison proves the hero asset, prior videos/posters, content data, controller, navigation/calendar JS, layout, inventory, documents and homepage outside the film section are unchanged.
- No controller/API changes. Reduced-motion opt-in and error fallback retain the existing implementation; no new real-device/OS-preference test is claimed. The calendar, form-delivery, geographic and deployment limitations below still apply. No public deployment or live form submission occurred.

Earlier sections below document previous revisions; their active-media paths are historical.


## Passed

- `npm run build`: 23 HTML outputs, including all 18 audited source routes and supporting aliases.
- `npm run check`: internal destinations and anchors, unique IDs, ARIA control targets, retained billing/form links, both exact six-source Google Calendar embeds, and six source-matched download hashes.
- HTTP checks: all 50 production files returned successful responses from the preview server, with byte lengths matching `dist/`.
- Visual review in the Codex in-app browser at 375 × 812 and 1280 × 900: homepage, course tour, menu, and representative resource/event layouts. No horizontal overflow in measured views or broken loaded images.
- Mobile navigation opens, closes on selection, and closes with Escape. All 13 menu categories remain in the document and their native disclosure controls open/close correctly.
- The revised course tour uses the 15.041667-second generated video. Desktop selected the 1920 × 1080 file; mobile selected the 720 × 1280 file and matching portrait poster. Both rendered with `readyState=4` and stayed paused while scrolling changed `currentTime`.
- Desktop: forward scrolling reached 3.978 seconds; End reached 15.040667; reverse scrolling returned to 9.552702. Pause held 6.305472 while scrolling, and Home manually returned to 0 while paused.
- Mobile: End reached 15.040667; reverse scrolling returned to 8.059635. Rapid Home/PageUp inputs reached the fountain at approximately 40%, with the correct water caption. Pause held 1.855102 while scrolling; manual end-frame seeking remained available.
- Both video routes return HTTP 206 for byte-range requests, with `video/mp4`, correct Content-Range, and the requested 1,024-byte response. `ffprobe` confirmed H.264, 24 fps, keyframes every six frames, no B frames, no audio, and fast-start metadata.
- Desktop and mobile film compositions were visually reviewed at the fairway/pond and clubhouse positions. The portrait crop intentionally loses lateral context. Sampled generated frames resemble the supplied photographs, but are not evidence of exact physical continuity.
- No application errors appeared in the checked local-page console logs. The original Squarespace site logged its own vendor warnings during source verification; those scripts are not included in this build.
- Original contact form loads with required first name, last name, email, and message fields. Original newsletter loads with first name, last name, and email fields. Both destinations are preserved as external links.
- Google Calendar loads live events both at its direct URL and embedded on the existing HTTPS Squarespace site. Month and agenda URLs were checked; the six feed IDs and Mountain Time setting match the audit.

## Remaining launch checks and dependencies

1. **Calendar frame on HTTPS staging.** The same embed remains blank in the local in-app browser on HTTP loopback, at both desktop and mobile widths. Eager loading did not resolve it. Inspection found no malformed URL, parent CSP, sandbox, or hidden frame; the precise browser/loading cause is unconfirmed. Direct calendar links work and are visible above both frames. Verify the embedded views on HTTPS staging before launch.
2. **Form delivery.** No live form was submitted. No new Web3Forms access key or Formspree endpoint was supplied. Delivery remains with the existing Squarespace forms; keep that site and subscription active. A new inline form requires the owner’s chosen provider credential and recipient, then a non-delivering payload test. An authorized real delivery test is separate.
3. **Motion fallbacks and devices.** The new controller’s reduced-motion opt-in, error/poster fallback, coalesced seeks, and cleanup passed isolated event tests. A real OS preference switch, induced video decoder failure, and physical phone were not exercised; check these before deployment. WebGL is no longer used by the active tour. Chrome DevTools MCP was unavailable; browser checks used the in-app browser’s equivalent DOM, viewport, screenshot, and console APIs.
4. **Content freshness.** This is a September 16, 2026 source snapshot. Refresh dated menus/promotions, events, contacts, and hours before launch. The source’s conflicting Sunday golf hours and ambiguous Wednesday price are disclosed rather than silently guessed. The unavailable private-cart agreement remains unavailable.
5. **Geographic limits.** The scroll experience is an AI-generated film based on the supplied fairway photograph. Its unseen route and geometry are generated, not surveyed or recorded by a drone. The original dated satellite research remains separate. See `DRONE-FOOTAGE.md` and `COURSE-GEOGRAPHY.md`.
6. **Deployment.** No hosting project or custom DNS was changed. Assign the actual hosting hostname, verify HTTPS, redirects, 404 behavior, forms and calendars on staging, then approve cutover. See `DEPLOYMENT.md`.

The browser inspection tools did not expose a full network waterfall. The checks above combine browser console/image review with an HTTP sweep of every local production asset; they do not claim an exhaustive third-party network audit.


## Fairway-only revision and warm image grade — September 16, 2026

- Active media is now `public/video/fairway-v2/`. Earlier pond/clubhouse measurements above describe revision 1 and are retained as history.
- New original and graded mobile contact sheets were visually inspected: continuous fairway progression, gentle bend, mature trees and dry tan rough, with no pond or clubhouse sequence. Sampled stills do not certify every intermediate generated frame or surveyed accuracy.
- Hero image edit was visually compared with its source and inspected at 1280 × 900 and 375 × 812. Composition and major landmarks remain recognizable, color/exposure are improved, and overlaid text remains readable. AI editing may reconstruct fine details. Source photograph is preserved.
- Production browser at 1280 × 900 loaded the 1920 × 1080 H.264 file with readyState 4. Forward scrolling sought to 5.199467 s; reverse scrolling to 2.412334 s; keyboard End reached 15.040667 s. Pause held 11.791256 s through further scrolling.
- Production browser at 375 × 812 loaded the separate 720 × 1280 H.264 file with readyState 4. End reached 15.040667 s; reverse scrolling reached 8.540502 s. Pause held 4.338229 s through further scrolling. Portrait route remains visible.
- Both viewports had no horizontal overflow and no warning/error console entries during the production tour checks. Videos stayed paused while seeking, with no autoplay or audio.
- `npm run build` and `npm run check` passed: 23 HTML pages, 18 source routes, two live calendar embeds with original feeds, six byte-matched downloads, retained form/billing destinations, anchors and local assets.
- Both new video routes returned HTTP 206 with 1,024-byte responses and correct Content-Range. Desktop is 12,022,528 bytes; mobile is 3,162,708 bytes. Both are 24 fps, 15.041667 s, H.264, no B frames or audio. See `evidence/fairway-v2-media-check.json`.
- Existing third-party calendar/form delivery and physical-device launch limitations above remain; this revision did not submit live forms or publish the site.
