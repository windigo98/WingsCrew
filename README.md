# WingsCrew

Phone-first home for WingsCrew apps, plus a shop placeholder. Live apps from [windigo98](https://github.com/windigo98). The shop opens when the merch is ready.

The site is static files at the repo root (`index.html`, `assets/`, `.nojekyll`). There is no build step.

## Add an app

Edit [`assets/apps.js`](assets/apps.js). Each entry has:

| Field | Role |
| --- | --- |
| `name` | Card title |
| `blurb` | Short description |
| `url` | Link for “Open app” |
| `badge` | Small label above the title |

Append an object and the card grid picks it up. On a phone the cards stack. Wider screens flow them into as many columns as fit.

The **Tip** button goes to [Cash App $windigo98](https://cash.app/$windigo98). **Feedback** opens an email to [dovewingsbusiness@gmail.com](mailto:dovewingsbusiness@gmail.com). **Shop** is a coming-soon placeholder. Nothing there is for sale.

## GitHub Pages

The project site will be [https://windigo98.github.io/WingsCrew/](https://windigo98.github.io/WingsCrew/) after Pages is turned on. Until then, that URL 404s.

1. Open this repo on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Set **Branch** to `main` and the folder to **`/ (root)`**. Save.
4. Wait for the Pages deploy to finish, then open [https://windigo98.github.io/WingsCrew/](https://windigo98.github.io/WingsCrew/).

`.nojekyll` is in the root so GitHub Pages serves the files as-is.

## wingscrew.com on IONOS

Point DNS at GitHub Pages, then set the custom domain in the Pages settings above. Do this after the `github.io` site is already deploying.

Keep any MX or mail TXT records. Remove parking or website-forwarding records, and any old A, AAAA, or CNAME records on `@` and `www` that are not listed here.

### Apex — A records

In IONOS, open the domain’s DNS settings and add one A record per address. Use `@` as the host (IONOS also accepts a blank host for the apex).

| Host | Type | Value |
| --- | --- | --- |
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |

These are the [GitHub Pages apex addresses](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

### www — CNAME

| Host | Type | Value |
| --- | --- | --- |
| `www` | CNAME | `windigo98.github.io` |

No `https://` and no path. IONOS may store it as `windigo98.github.io.`.

### After DNS

1. In **Settings → Pages**, under **Custom domain**, enter `wingscrew.com` and save.
2. Wait until GitHub reports the DNS check as good. Certificate issuance can take up to an hour after DNS is correct.
3. Turn on **Enforce HTTPS**.

GitHub then serves this project on `wingscrew.com` and redirects `www.wingscrew.com` to the apex. Saving the custom domain adds a `CNAME` file on `main`. Leave that file out until you are ready for the redirect. The `github.io` URL above keeps working until that custom domain is saved.
