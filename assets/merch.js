// WingsCrew merch. One card per entry, rendered into [data-merch="<audience>"].
//
// Adult entries render only in the Shop section on /21plus/.
// They stay off the homepage. Do not point a family-page mount at "adult".
//
// Kids entries are a separate audience. To add that section later, append an
// entry with audience: "kids" and mount it on the homepage:
//   <div class="apps-grid" data-merch="kids"></div>
// Include this script on that page, before site.js. Leave the adult Shop
// section on /21plus/ as it is.
//
// name      Card title
// blurb     Short line under the title
// url       Store link (https). The card opens it in a new tab.
// audience  "adult" or "kids"
// status    "coming soon" or "live"
//           "coming soon" labels the card "Coming soon" (store has no products).
//           Set status to "live" when that store has products for sale.
//           The label then becomes "Shop" unless badge is set.
// badge     Optional label used only while status is "live".
window.WINGS_MERCH = [
  {
    name: "WingsCrew Clothing",
    blurb: "T-shirts and more",
    url: "https://wingscrew-clothing.printify.me",
    audience: "adult",
    // Printify store has no products yet. Switch to "live" when it does.
    status: "coming soon",
  },
];
