# Store carts

WingsCrew Cooks builds a shopping list on the phone. It does not check out, and it does not send the list to a store. There are no affiliate links and no API keys in the app.

The buttons live in `stores.js`. A future store is a new object in that list.

## H-E-B

What the site allows without an account or a key: a public search page.

```
https://www.heb.com/search?q=cheddar
```

The app opens one of those tabs for each item still on the list. The query is the item name, URL-encoded. Nothing else is added to the link.

H-E-B does not offer a cart-fill API we can call from this static page. The search page is the hand-off.

## Walmart

Same idea. Public search, no account, no key:

```
https://www.walmart.com/search?q=cheddar
```

One new tab per item still to buy. No affiliate tag, no extra parameters.

## Instacart

Not hooked up.

Instacart's Developer Platform can build a cart, but it needs a secret API key and the request has to come from a server. This site is plain files on GitHub Pages. The key would be visible to anyone if it were put in `stores.js`, so there is no key and no call.

The spot for it later is marked in `stores.js`. A cart adapter would have `kind: "cart"` and a `fill` function that posts the item names to a server you control. The server would be the only place that talks to Instacart.

## Adding another store

1. Open `cooks/stores.js`.
2. For a store that only has a search page, copy the H-E-B entry. Set `id`, `label`, and the search URL. Keep the item name as the only query value.
3. For a one-tap cart, add a `kind: "cart"` entry whose `fill` function calls your server. Do not put a key, token, or private URL in this repo.
4. Skip affiliate tags until a program is actually joined. Then add them in one place, in `stores.js`, on purpose.

## Brand picks

`cooks/data/brand_picks.json` is optional. If the file is missing, the list still works and just has no brand lines.

When the file is there, it is a JSON array. One object per ingredient:

| Field | Meaning |
| --- | --- |
| `ingredient` | Name to match, such as `cheddar` or `sharp cheddar` |
| `aisle` | Optional. One of the list aisles, if you want to override the guess |
| `heb` / `walmart` | `product`, `size`, `price`, `unitPrice`, `stars`, `ratingCount`, `url` |
| `bestBuy` | `store`, `product`, `why` |
| `checkedAt` | Day the prices were checked, `YYYY-MM-DD` |

The list shows the best-buy product and store under the item, and a "Prices as of …" note from `checkedAt`. Product links are the `url` on that store's object only. No affiliate parameters are added.
