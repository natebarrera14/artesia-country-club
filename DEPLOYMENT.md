# Artesia Country Club deployment

Use Netlify for this Vite static site: it serves the compiled files directly and provides a review URL for each pull request. Vercel is also supported. No site has been published and no DNS change has been made as part of this handoff.

## Local build

Run from `the repository root` with Node.js and npm installed. Use the Node version supported by the locked Vite dependency and select the same version in the host dashboard.

```sh
npm ci
npm run dev
```

For a production build:

```sh
npm run build
```

The deployable output is `dist/`. Commit the source and `package-lock.json`; exclude `node_modules/`, local credentials, and temporary browser artifacts.

## Netlify — recommended

1. Push this project to a dedicated Git repository. In Netlify, add a project by importing that repository. If using an existing repository containing the whole workspace, set the base directory to `Projects/SiteBuilds/artesiacc.com`; a dedicated project repository needs no base-directory override.
2. Confirm build command `npm run build` and publish directory `dist`. Netlify documents these as the Vite defaults. [Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
3. Keep the existing club domain on its current host during review. Open a pull request against the connected production branch and inspect Netlify's Deploy Preview before merging. [Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/)
4. Complete the functional checks below and obtain approval for the reviewed deployment. Add `artesiacc.com` and `www.artesiacc.com` under domain management only when ready for cutover; use `www.artesiacc.com` as the primary domain.

The following two records apply to Netlify's standard network with external DNS. Values were checked against [Netlify's official DNS instructions](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/) on September 16, 2026. The apex A record is Netlify's documented fallback when the DNS provider does not support ALIAS/ANAME flattening.

| Type | Host/Name | Value/Target | Purpose |
| --- | --- | --- | --- |
| A | `@` | `75.2.60.5` | Route the apex domain to Netlify's standard load balancer. |
| CNAME | `www` | `YOUR-SITE.netlify.app` | Route the primary hostname to the assigned Netlify project. |

`YOUR-SITE.netlify.app` is a configuration placeholder, not an assigned hostname. Replace it with the exact default domain shown in the new project's dashboard. Recheck the dashboard's domain instructions at cutover; High-Performance Edge uses different targets. Remove conflicting web records for these hostnames while preserving email and verification records. DNS propagation and SSL issuance take time; verify both hostnames and HTTPS before declaring the migration complete.

## Vercel alternative

Push the project repository, import it in Vercel, select the project directory and the Vite preset, and confirm build command `npm run build` and output directory `dist`. Keep dependencies from the lockfile. These settings can be reviewed under Build and Deployment settings. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Vercel builds](https://vercel.com/docs/builds)

Create a Preview deployment from a non-production branch, review it, then promote or merge only after approval. Add the custom domain after the functional checks pass and use the DNS values assigned by Vercel's project dashboard. [Vercel environments](https://vercel.com/docs/deployments/environments)

## Forms, calendars, and content before cutover

The existing site has a verified built-in Squarespace hostname: `https://sparrow-sheep-7aha.squarespace.com/`. On September 16, 2026 it returned HTTP 200 without a redirect, and the source contained the contact anchor `block-b07dc74da0291665ed71` and newsletter anchor `block-738d935595233a331c35`. Its `X-Frame-Options: SAMEORIGIN` header prevents loading these pages in a cross-origin iframe. Preserve them as normal external links unless their backend is migrated; do not present a blocked iframe as a working form.

The intended preservation strategy is: source-hosted Squarespace forms; the original Google Calendar embed, retaining its six calendars and `America/Denver` timezone; local copies of menus and golf documents with source provenance; and the existing external member billing service. The content manifest and the implementation's retention notes record the audited destinations. A copied form layout does not migrate its delivery service. Before changing the club's DNS:

- Verify every retained form and calendar in the staging site. Confirm its actual provider and destination, including embedded views, downloads, and external links. Preserve field labels, required fields, validation, consent wording, and submission behavior.
- If a form is migrated, the club owner must supply either a working Web3Forms access key or an actual Formspree endpoint and confirm the recipient. Configure that provider before enabling submission; never use invented credentials or claim a successful delivery from a mock test.
- Use the built-in Squarespace hostname for retained original forms and keep that Squarespace site/subscription active. Recheck its availability after changing the primary domain. Links to old pages at `www.artesiacc.com` must instead resolve to preserved local paths, migrated content, or the verified built-in hostname, because the club domain will point at the new site after cutover.
- Check menus, downloadable applications, golf rules, scorecards, event dates, calendar recurrence, and any reservations against the live source immediately before launch. An exported calendar snapshot needs an owner and an update process if it is not connected to the live calendar.

## Staging and post-deploy smoke check

Check the production build at 375px and 1280px widths and on a real phone. Verify navigation, keyboard focus, reduced-motion behavior, scroll animation, image loading, and absence of horizontal overflow. Inspect console and failed requests. Open every menu, rule document, form, calendar, and key action; verify their destinations after domain cutover as well as in staging.

Test forms with synthetic input and intercepted requests to verify validation, POST destination, and payload. A real delivery test requires the club's permission and an expected recipient. Check HTTPS on apex and `www`, primary-domain redirects, page titles, canonical URLs, and the 404 page. Retain the previous production deployment for rollback.
