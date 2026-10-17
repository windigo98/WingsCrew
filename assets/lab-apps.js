// Crew Lab list. Only /crew-lab/ renders this. It is not linked from the hub.
// Add an object to publish another testing card. No other files need to change.
//
// name    Card title
// blurb   Short note under the title
// status  "live", "not live yet", or "coming soon"
// url     Where the card goes. Omit it for "coming soon" so the card has no link.
// group   "progress" (in-progress section) or "live" (live apps for a quick check)
//
// WingsCrew Looks returned 404, not 200, on 13 Oct 2026, so its status stays
// "not live yet". Switch that status to "live" when the URL returns 200.
window.WINGS_LAB = [
  {
    group: "progress",
    name: "Highkeep",
    blurb: "Preview build on this site.",
    status: "live",
    url: "/highkeep-preview/",
  },
  {
    group: "progress",
    name: "WingsCrew Looks",
    blurb: "The GitHub Pages URL is not returning 200 yet.",
    status: "not live yet",
    url: "https://windigo98.github.io/WingsCrew-Looks/",
  },
  {
    group: "progress",
    name: "WingsCrew Color Adventures",
    blurb: "No build to open yet.",
    status: "coming soon",
  },
  {
    group: "progress",
    name: "WTB Clarity 2plat",
    blurb: "Preview build on this site.",
    status: "live",
    url: "/wtb-clarity-preview/",
  },
  // Unlisted review tool. Keep this URL off the public hub and out of sitemap.xml.
  {
    group: "progress",
    name: "T-shirt review",
    blurb: "Yes or no on each design, plus notes. Saved on this phone until you copy or email it.",
    status: "live",
    url: "/crew-lab/tshirt-review/",
  },
  {
    group: "live",
    name: "Tipsy Tease & Spilt Tea",
    blurb: "Spicy questions, truths, and dares. Pass the phone, or let a host read the card.",
    status: "live",
    url: "https://windigo98.github.io/Sip-and-Spill/",
  },
  {
    group: "live",
    name: "Net Pulse",
    blurb: "Checks whether this phone can actually reach the internet, then shows latency and speed.",
    status: "live",
    url: "https://windigo98.github.io/Net-pulse/",
  },
  {
    group: "live",
    name: "Litter Crusaders Maps",
    blurb: "Catch litter creatures on the map, fill your Litter-dex, and send park bosses packing.",
    status: "live",
    url: "https://windigo98.github.io/Litter-Crusaders-Maps/",
  },
  {
    group: "live",
    name: "21+ Adult Humor & Games",
    blurb: "Age-gated adult humor and games.",
    status: "live",
    url: "/21plus/",
  },
];
