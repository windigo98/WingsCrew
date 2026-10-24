// WingsCrew apps. The homepage renders one card per entry that is not adult.
// Add an object to this list to publish another app.
// For an adult app, set adult: true, or add it to adult-apps.js instead.
// Adult entries are listed on /21plus/ and left off the homepage.
//
// name   Visible title
// blurb  Short description under the title
// url    Where "Open app" goes (https)
// badge  Small label above the title, shown in small caps
// adult  Optional. true sends the card to the 21+ page instead of the homepage.
window.WINGS_APPS = [
  {
    name: "Net Pulse",
    blurb: "Checks whether this phone can actually reach the internet, then shows latency and speed.",
    url: "https://windigo98.github.io/Net-pulse/",
    badge: "Connectivity checker",
  },
  {
    name: "Litter Crusaders Maps",
    blurb: "Catch litter creatures on the map, fill your Litter-dex, and send park bosses packing.",
    url: "https://windigo98.github.io/Litter-Crusaders-Maps/",
    badge: "Play",
  },
  {
    name: "WingsCrew Looks",
    blurb: "Plan outfits from your own closet, keep a gift wishlist, and get votes with Fit or Miss?",
    url: "https://windigo98.github.io/WingsCrew-Looks/",
    badge: "New",
  },
];
