// Coloring books for the Hot or Not review at /crew-lab/hot-or-not-review/.
// The Books section reads this list. See assets/review-queue.js.
// Kids' pages. Keep the review noindex, off the public hub, and out of sitemap.xml.
//
// Add a book by appending one object to WINGS_COLORING_SETS. Put its images in
// crew-lab/coloring-review/sets/<id>/ . Votes stay on this phone, per set.
// No other file needs to change.
//
// id        Folder name under crew-lab/coloring-review/sets/. Stable key for votes.
// title     Name in the set picker and in the copied review.
// pages     One object per page, in order.
//
// Page fields:
// id         Stable key. Votes and notes for this set are saved under this id.
// title      Name on the card and in the copied review.
// image      Main file name in that set's folder. Local .webp only.
// alternate  The other version. Leave "" when the page has one file.
// badge      Optional short label on the card, such as "NEW".
// version    Optional cache key. The review adds ?v= to each image URL.
//            A page version wins over the set version. Bump it when a file
//            is replaced but the file name stays the same.
(function () {
  function page(number, options) {
    var id = number < 10 ? "0" + number : String(number);
    var main = options && options.main === "b" ? "b" : "a";
    var other = main === "a" ? "b" : "a";
    var entry = {
      id: id,
      title: "Page " + id,
      image: "p" + id + "_" + main + ".webp",
      alternate: "p" + id + "_" + other + ".webp",
    };
    if (options && options.badge) entry.badge = options.badge;
    if (options && options.version) entry.version = options.version;
    return entry;
  }

  function numberedPages(count, overrides) {
    var list = [];
    var i;
    for (i = 1; i <= count; i++) {
      list.push(page(i, overrides && overrides[i]));
    }
    return list;
  }

  window.WINGS_COLORING_SETS = [
    {
      id: "dinosaurs",
      title: "Cute Dinosaurs",
      pages: numberedPages(30, {
        14: { badge: "NEW" },
        17: { main: "b" },
        20: { badge: "NEW" },
      }),
    },
    {
      id: "nativity",
      title: "Reason for the Season: A Cute Nativity Coloring Book",
      // ?v=2 on every image URL. File names stay pNN_a.webp and pNN_b.webp.
      // Bump version (or one page's version) when a file is replaced.
      version: 2,
      pages: numberedPages(30, {
        1: { badge: "NEW" },
        9: { badge: "NEW" },
        13: { badge: "NEW" },
        17: { badge: "NEW" },
        19: { badge: "NEW" },
        21: { badge: "NEW" },
        22: { badge: "NEW" },
        28: { badge: "NEW" },
        29: { badge: "NEW" },
      }),
    },
    {
      id: "unicorns",
      title: "Cute Unicorns",
      pages: numberedPages(30, {
        2: { badge: "NEW" },
        4: { badge: "NEW" },
        5: { badge: "NEW" },
        7: { badge: "NEW" },
        16: { badge: "NEW" },
        24: { badge: "NEW" },
        25: { badge: "NEW" },
        30: { badge: "NEW" },
      }),
    },
    {
      id: "trucks",
      title: "Cute Trucks",
      pages: numberedPages(30, {
        5: { badge: "NEW" },
        12: { badge: "NEW" },
        13: { badge: "NEW" },
        14: { badge: "NEW" },
        18: { badge: "NEW" },
        22: { badge: "NEW" },
        23: { badge: "NEW" },
        25: { badge: "NEW" },
        27: { badge: "NEW" },
        28: { badge: "NEW" },
      }),
    },
  ];
})();
