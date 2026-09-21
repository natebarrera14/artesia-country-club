# Active film — restored water and clubhouse version

Restored at the user’s request on September 16, 2026. Active media is `public/video/course-drone.mp4` and `course-drone-mobile.mp4`, with their matching posters and original mobile portrait presentation. This is job `6c0bc01b-0f54-4cfa-979d-f191ad4ad40a`, described under retained revision 1 below. The user identified this version by its water and clubhouse sequence. Newer fairway-only assets remain archived. Homepage photo and other club content remain unchanged.

All active-media statements in the older revision entries below describe their historical state.

# Archived fairway revision 3

Approved and integrated September 16, 2026. One continuous forward approach toward the green, with warm afternoon color, maintained turf, a red flag and a small beige cart on the left-side path. The driver wears blue; the dark roof and rear black bag remain visible. The approved route and reference stills are retained in `evidence/fairway-v3-review/`.

- Higgsfield Seedance 2.5, 15 seconds requested, 1080p, high bitrate, silent, opening and closing image conditioning. One generation submitted, job `e379f165-7f92-4931-879c-951009ddf46f`. Preflight estimate: 135 credits, not a reconciled charge.
- Exact prompt, confirmed reference IDs, result URL, encoding and review limitations: `evidence/fairway-v3-generation.json`.
- Original: `evidence/fairway-v3-original.mp4`, HEVC 1920 × 1080, 24 fps, 15.041667 s, 77,340,536 bytes. No external upscale or additional color filter was applied.
- Active desktop: `public/video/fairway-v3/course-drone.mp4`, H.264 1920 × 1080, 31,291,647 bytes.
- Active mobile: `public/video/fairway-v3/course-drone-mobile.mp4`, H.264 1280 × 720, 16,277,627 bytes. This is a downscaled full composition, displayed at 16:9 with headings and controls outside the film.
- Both derivatives use CRF 18 (revision 2 used 23), 24 fps, a six-frame GOP, no B frames or audio, and fast-start metadata. Higher detail retention increases transfer sizes. Loading still starts near the section, with a matching poster.
- All previous films, the hero photo, content and controller are preserved. The visible AI-generation disclosure remains and its linked explanation now describes the generated references and aerial context.

Reproduce into a new empty directory:

```sh
bash scripts/prepare-fairway-v3-media.sh evidence/fairway-v3-original.mp4 /tmp/artesia-fairway-v3-reencode
```

## Revision 3 review and accuracy

Reviewed the 15-frame overview, 30 half-second cart/flag detail samples, full-size opening/middle/closing frames, and browser playback through the 15.041667-second endpoint without a decoder error. The cart remains on the path with a consistent rear bag and blue-clad driver, briefly occluded by a foreground tree. The red flag persists. No visible cut, off-path movement, detached bag or obvious landmark morph appeared in the reviewed samples. Small wheels and clothing details limit precise motion/anatomy certification; not every one of 361 frames was individually inspected. The result follows the reference direction but is not an exact reproduction of the closing still.

This remains a generated interpretation. The dated aerial informed the proposed route; tree heights, pin position, maintained turf and unseen detail are reconstructed. Requested camera heights and travel are shot direction, not measurements of the result. No hole number is displayed.

Desktop/mobile scroll, pause, end seeking, framing, loading, console, overflow and byte-range checks passed, along with build and preservation audit. See `QA.md`, `evidence/fairway-v3-media-check.json` and `evidence/fairway-v3-http-check.json`. Physical-device and HTTPS third-party checks remain launch work.

# Previous film — retained fairway revision 2

Latest direction, September 16, 2026: one low, smooth forward glide with a gentle curve along the fairway, with warm natural cinematic color. No water or clubhouse sequence. Scroll controls both directions.

- Provider: Higgsfield; Seedance 2.5, omni-reference mode, 15 seconds, 1080p, silent.
- Job: `ba1b3c1a-3fab-4fbe-8ced-f88bb6fa03a8`; preflight estimate 135 credits, not a reconciled charge.
- Reference: actual course fairway photograph, confirmed media `cfc23e21-79cf-41a8-9d77-0051b5db487b`.
- Exact prompt and generation record: `evidence/fairway-generation-v2.json`.
- Active web assets: `public/video/fairway-v2/`; the original film below is retained but no longer used on the homepage.
- Warm natural grading was requested in the generation prompt. The result then received a restrained FFmpeg grade: lifted midtones and exposure, modest saturation and contrast, subtly warmer highlights. Characteristic tan rough remains. The exact filter is recorded in the generation JSON.
- Original: `evidence/fairway-v2-original.mp4`, HEVC 1920 × 1080, 24 fps, 15.041667 seconds, no audio.
- Reproduce both graded web encodes and posters:

```sh
bash scripts/prepare-drone-media.sh evidence/fairway-v2-original.mp4 /tmp/artesia-fairway-v2-reencode \
  'eq=brightness=0.025:contrast=1.04:gamma=1.12:saturation=1.10,colorbalance=rm=0.01:rh=0.022:bh=-0.014:pl=1'
```
- Accuracy: course appearance is guided by a real photograph; the flight route and unseen geography are generated. Visible AI credit and course-map explanation remain.
- Hero image grading: `evidence/hero-grade-v2.md`; original photo is preserved.

## Revision 2 verification

Desktop/mobile visual and scroll checks passed at 1280 × 900 and 375 × 812. Forward/reverse seeking, keyboard endpoints, pause, responsive source selection, console and overflow checks passed. Both video routes support HTTP 206 byte ranges. Desktop is 12,022,528 bytes and mobile is 3,162,708 bytes; both are H.264 at 24 fps with no audio. See `QA.md` and `evidence/fairway-v2-media-check.json`. The original and portrait contact sheets show a fairway throughout, without a pond/clubhouse sequence. They do not verify unseen geographic accuracy or every intermediate generated frame.

# Previous film — retained revision 1

User direction, September 16, 2026: replace the overhead map animation with a smooth, low drone-style flight along the fairways, over water, and toward the clubhouse. Scrolling must move the footage forward and backward.

## Generation record

- Provider: Higgsfield; model: Seedance 2.5, omni-reference mode.
- Job: `6c0bc01b-0f54-4cfa-979d-f191ad4ad40a`.
- Requested output: one silent, continuous 15-second shot, 16:9, 1080p.
- Preflight estimate: 135 credits. This is the estimate returned before submission, not a reconciled account charge.
- Fairway reference: user attachment `codex-clipboard-6272f8a2-41b8-4447-966c-a7404f3ec246.png`; confirmed media `cfc23e21-79cf-41a8-9d77-0051b5db487b`.
- Clubhouse/fountain reference: user attachment `codex-clipboard-1dc7efbb-3475-4284-ac88-80a92c6d18b5.png`; confirmed media `0ccf23bd-f1ed-4bdf-9981-0faee8a863dd`.
- Completed result, exact submitted prompt, settings, and deliverable record: `evidence/drone-generation.json`.

The satellite imagery was researched for landscape context. It is not used as the video’s opening view. The requested camera travels through the scene at low height, with tree parallax and a forward-facing horizon.

## Accuracy boundary

This is AI-generated footage based on real course photographs, not a drone recording or a surveyed reconstruction. The supplied photographs anchor the appearance of the clubhouse, water, trees, and turf; the route between those viewpoints and unseen geometry are generated. Do not describe it as an exact course walkthrough. Keep a short visible AI-generation credit linked to the course-information page. For exact physical continuity, replace the media files with approved on-location footage.

The visible credit reads “AI-generated course film / Based on club photographs” and links to `/course-map/`. That page separates the generated-film explanation from the unchanged USDA aerial reference acquired May 19, 2022. Retain both labels and dates. The earlier `src/flyover.js` terrain renderer and its geographic assets remain a research archive, documented in `COURSE-GEOGRAPHY.md`, and are not loaded by the active experience.

## Finished media

Generation completed and the files below are integrated. `ffprobe` confirms a duration of **15.041667 seconds**, **24 fps**, and no audio stream in all three video files.

| File | Codec and dimensions | Bytes | Use |
| --- | --- | --- | --- |
| `evidence/course-drone-original.mp4` | HEVC, 1920 × 1080 | 61,318,291 | Retained original generation. |
| `public/video/course-drone.mp4` | H.264, 1920 × 1080 | 14,269,422 | Desktop scroll media. |
| `public/video/course-drone-mobile.mp4` | H.264, 720 × 1280 | 5,158,420 | Portrait center crop. |

The optimized videos use a closed keyframe every six frames, no B frames, `yuv420p`, and fast-start metadata for efficient seeking. Posters sit beside them as `course-drone-poster.jpg` and `course-drone-poster-mobile.jpg`.

Reproduce the encodes with installed `ffmpeg`, from the project root:

```sh
bash scripts/prepare-drone-media.sh evidence/course-drone-original.mp4 /tmp/artesia-drone-reencode
```

Use a new empty output directory: the script intentionally refuses to overwrite existing deliverables. It emits both videos and both posters. Check the resulting crops before replacing published assets.

## Scroll integration

`src/drone-tour.js` maps scroll progress and the accessible position slider to `video.currentTime`. The muted video remains paused, so forward and reverse movement come from seeking rather than automatic playback. Loading begins near the section. The controls provide pause/resume, reduced-motion opt-in, and a poster fallback for loading or decoding failures.

The revised build contains an approximately **6.2 KB** course-tour JavaScript chunk in place of the approximately **483 KB** Three.js tour chunk. The desktop and mobile video transfers are separate from that JavaScript size. The mobile source is selected for widths at or below 600 px.

## Inspection and remaining verification

- The eight-frame contact sheet at `evidence/drone-contact-sheet.jpg` samples 0, 2, 4, 6, 8, 10, 12, and 14 seconds. It shows a low, forward-facing flight with the horizon visible, progressing through trees, across the fountain pond, and toward a long tan clubhouse resembling the supplied photograph.
- No unmistakable melting or hard cut appeared in those sampled stills. They do not establish continuous motion quality or exact geometry; the pond-to-fairway passage around 4–8 seconds particularly needs playback inspection.
- Portrait cropping removes lateral course context and can trim the clubhouse near the pond approach. The separate mobile contact sheet is `evidence/drone-mobile-contact-sheet.jpg`; evaluate the actual mobile experience as part of browser QA.
- Production-browser checks at 375 × 812 and 1280 × 900 passed for video loading, forward/reverse seeking, pause, manual keyboard scrubbing, and representative compositions, with no local console errors or horizontal overflow. Both video routes support HTTP byte ranges. See `QA.md` for measured times.
- Reduced-motion and error handling passed isolated controller tests; a real OS preference change, induced decoder failure, and physical phone remain launch checks. The sampled-frame inspection does not certify exact geography or every intermediate generated frame.
