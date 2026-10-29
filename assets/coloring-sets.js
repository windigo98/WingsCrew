// Coloring sets for the unlisted Crew Lab review at /crew-lab/coloring-review/.
// Kids' pages. Keep this page noindex, off the public hub, and out of sitemap.xml.
//
// Add a set by appending one object to WINGS_COLORING_SETS. Put its images in
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
      // ?v=1 on every image URL. File names stay pNN_a.webp and pNN_b.webp.
      // Page 22 will be replaced later. Bump version (or that page's version)
      // when the files change so phones load the new art.
      version: 1,
      pages: numberedPages(30, {
        1: { badge: "NEW" },
        9: { badge: "NEW" },
        13: { badge: "NEW" },
        17: { badge: "NEW" },
        19: { badge: "NEW" },
        21: { badge: "NEW" },
        28: { badge: "NEW" },
        29: { badge: "NEW" },
      }),
    },
  ];
})();
