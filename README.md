# Artesia Country Club — work in progress

**Status: currently being built. This is an in-progress portfolio snapshot, not a completed or launched website.**

A multi-page country-club website build using HTML, Tailwind CSS, JavaScript, and Vite. The current source includes golf, dining, memberships, events, club policies, and member resources.

## Included in this build

- Homepage and generated resource pages for club information, menus, memberships, and events.
- A scroll-controlled course film with desktop/mobile video files and poster fallbacks.
- Retained links to the source site's contact, newsletter, and member-billing services.
- Google Calendar embed markup and downloadable club documents.
- Page-generation scripts and a migration audit for routes, links, calendar sources, and document hashes.

**The course film is AI-generated.** It is not recorded drone footage or a survey-accurate course walkthrough. The site discloses this distinction and includes a separate course-map page.

## Run locally

Use Node.js 20+ and npm from the repository root:

Large media files use Git LFS. Install Git LFS, clone this repository, then run the following from the repository root to retrieve the original assets before building:

```bash
git lfs install
git lfs pull
npm ci
npm run build
npm run check
npm run dev
```

`npm run build` generates the pages and compiles the site. `npm run check` checks local migration details; it does not verify form delivery or third-party service availability. Use `npm run preview` to inspect the compiled build.

## Still in progress

- Verify embedded calendars on HTTPS staging.
- Verify form delivery; current links depend on the existing Squarespace forms.
- Review current club content, dated events, hours, and ambiguous source pricing.
- Complete device and motion-fallback checks and the deployment checklist.

Uploading this repository does not deploy the site or change the club's domain. No completed client engagement, membership growth, or measured business result is claimed here.

## Source and assets

Content and club resources were collected from the [existing Artesia Country Club site](https://www.artesiacc.com). Club photography, branding, and documents retain their respective ownership. AI-generated media is identified in the site and development records. No blanket reuse license for third-party assets is granted.

## Documentation and snapshot scope

- [Design notes](DESIGN.md)
- [Content manifest](content-manifest.md)
- [Historical QA record and open launch checks](QA.md)
- [Deployment checklist](DEPLOYMENT.md)
- [Development notes](docs/development-notes.md)
- [Portfolio verification](PORTFOLIO-STATUS.md)

This snapshot includes the active course videos, required site assets, and source-evidence files used by the build/audit. Large local review recordings and superseded `fairway-v2` / `fairway-v3` videos are omitted. Historical media and QA documents may refer to those local archives; they do not imply the omitted files are available here or that the website is finished.
