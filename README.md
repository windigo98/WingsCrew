# WingsCrew

Phone-first home for WingsCrew apps, plus WingsCrew Clothing. Live apps from [windigo98](https://github.com/windigo98). WingsCrew Clothing is opening soon.

The site is static files at the repo root (`index.html`, `assets/`, `.nojekyll`). There is no build step.

## Add an app

Edit [`assets/apps.js`](assets/apps.js). Each entry has:

| Field | Role |
| --- | --- |
| `name` | Card title |
| `blurb` | Short description |
| `url` | Link for “Open app” |
| `badge` | Small label above the title |
| `adult` | Optional. Set to `true` to list the app on the 21+ page instead of the homepage. |

Append an object and the card grid picks it up. On a phone the cards stack. Wider screens flow them into as many columns as fit.

## 21+ page

Adult humor and games live at [`/21plus/`](21plus/index.html). The first visit asks “You must be 21 or older to enter.” **Yes** is stored in `localStorage` under `wingscrew-21plus`. **No** returns to the homepage.

Add a card by appending to [`assets/adult-apps.js`](assets/adult-apps.js), or by setting `adult: true` on an entry in `apps.js`. Either way it shows on the 21+ page and stays off the homepage. The homepage header links here. The page sends `noindex`.

The **Tip** button goes to [Cash App $windigo98](https://cash.app/$windigo98). **Feedback** opens an email to [dovewingsbusiness@gmail.com](mailto:dovewingsbusiness@gmail.com).

## Shop

WingsCrew Clothing is on Printify. Checkout is not taking payments yet, so the shop is marked **Opening soon**.

[`assets/merch.js`](assets/merch.js) holds one `status` flag and the two collection links. That flag is the only line to change when payments go live:

| `status` | What people see |
| --- | --- |
| `"coming soon"` | **Opening soon** on the homepage Shop link, the hero line, and each clothing card |
| `"live"` | The Opening soon label comes off. The homepage link reads **Shop**, cards are labeled **Shop**, and the hero says WingsCrew Clothing is open |

The homepage **Shop** link and the homepage Shop card open the [Clean collection](https://wingscrew-clothing.printify.me/collection/clean) in a new tab. The `/21plus/` Shop card opens the [21+ collection](https://wingscrew-clothing.printify.me/collection/21) in a new tab. Its blurb is adult-humor tees and more.

Do not link the 21+ collection, or the store’s full product list (`https://wingscrew-clothing.printify.me` with no collection), from the homepage or any other non-21+ page. The Clean entry uses `audience: "clean"` and renders into `data-merch="clean"`. The 21+ entry uses `audience: "adult"` and renders only into `data-merch="adult"` on `/21plus/`.

## Caught Red-Handed, multi-phone

[`/21plus/caught-red-handed/`](21plus/caught-red-handed/index.html) is the 21+ party game. Pass-the-phone works with no network. Each-phone play uses [PeerJS](https://peerjs.com/) 1.5.5, vendored at `21plus/caught-red-handed/vendor/peerjs.min.js`.

The host's phone is the hub. PeerJS's free public broker at `0.peerjs.com` (port 443, path `/`) only introduces the phones. It does not store names, answers, votes, or scores, and there is no account. Those travel on a direct WebRTC connection to the host and disappear when the page closes.

Phones find each other with Google's public STUN servers (`stun.l.google.com:19302` and `stun1.l.google.com:19302`). Those servers are not a place the game saves data. There is no TURN relay, because a relay is often a paid service. On a strict network the phones may not link. Use **Pass the phone** when that happens.

If `0.peerjs.com` goes away, pass-the-phone still works. To bring each-phone play back, run your own open-source [PeerServer](https://github.com/peers/peerjs-server) and change `peerOpts()` in `21plus/caught-red-handed/multi.js` (`host`, `port`, `path`, and `secure`). Keep the vendored PeerJS file. Do not point the game at a paid service.

QR codes are drawn on the phone with vendored qrcode-generator 1.4.4 (`vendor/qrcode.js`). No QR website is called.

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

## License

Copyright (c) 2026 WingsCrew (windigo98). All rights reserved. The source is published for viewing only. See [LICENSE](LICENSE).
