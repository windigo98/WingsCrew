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
//
// Reason for the Season (Nativity) can be a second object in the array below.
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
  ];
})();
