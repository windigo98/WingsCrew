// Crew Lab list. Only /crew-lab/ renders this. It is not linked from the public nav.
// Add an object to publish another in-progress card. No other files need to change.
//
// name    Card title
// blurb   One line under the title
// status  "live", "not live yet", or "coming soon"
// url     Where the card goes. Omit it for "coming soon" so the card has no link.
// group   "progress" — the Crew Lab page lists this group
// mark    Optional extra label, such as "Adult"
//
// WingsCrew Looks returned 404, not 200, on 13 Oct 2026, so its status stays
// "not live yet". Switch that status to "live" when the URL returns 200.
window.WINGS_LAB = [
  {
    group: "progress",
    name: "T-shirt review",
    blurb: "Hot-or-not on adult humor shirts. Yes, no, and notes stay on this phone.",
    status: "live",
    mark: "Adult",
    url: "/crew-lab/tshirt-review/",
  },
  {
    group: "progress",
    name: "Coloring review",
    blurb: "Yes, no, or needs work on coloring pages. Votes and notes stay on this phone.",
    status: "live",
    url: "/crew-lab/coloring-review/",
  },
  {
    group: "progress",
    name: "Highkeep",
    blurb: "Preview build on this site. Lists, reminders, and small games.",
    status: "live",
    url: "/highkeep-preview/",
  },
  {
    group: "progress",
    name: "WTB Clarity 2plat",
    blurb: "Preview build on this site. Check in, keep streaks, and build on the beach.",
    status: "live",
    url: "/wtb-clarity-preview/",
  },
  {
    group: "progress",
    name: "Caught Red-Handed",
    blurb: "Jeopardy-style 21+ party game, in development on this site. Answer in secret, get caught.",
    status: "live",
    mark: "Adult",
    url: "/21plus/caught-red-handed/",
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
];
