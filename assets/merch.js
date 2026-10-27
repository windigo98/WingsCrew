// WingsCrew Clothing. One card per item, rendered into [data-merch="<audience>"].
//
// status is the only switch for the "Opening soon" label.
//   "coming soon" — checkout is not taking payments. The homepage Shop link,
//                   the hero line, and every clothing card say "Opening soon".
//   "live"        — Printify is taking payments. That label comes off.
// Change this one line when payments go live. Leave the collection URLs alone.
//
// audience "clean" is the family-friendly Clean collection. It is the only
// store link allowed on the homepage and any other non-21+ page.
// audience "adult" is the 21+ collection. site.js renders it only on /21plus/.
//
// Never point a non-21+ page at the 21+ collection, or at the store root
// (the full product list). Do not put the 21+ URL in index.html.
//
// name      Card title
// blurb     Short line under the title
// url       Collection link (https). The card opens it in a new tab.
// audience  "clean" or "adult"
window.WINGS_MERCH = {
  status: "coming soon",
  items: [
    {
      name: "WingsCrew Clothing",
      blurb: "Tees and more",
      url: "https://wingscrew-clothing.printify.me/collection/clean",
      audience: "clean",
    },
    {
      name: "WingsCrew Clothing",
      blurb: "Adult-humor tees and more",
      url: "https://wingscrew-clothing.printify.me/collection/21",
      audience: "adult",
    },
  ],
};
