// Hot or Not review queue for /crew-lab/hot-or-not-review/.
// Everything here is waiting on a yes before it goes out.
//
// How to add a set
// Shirts: append an object in assets/tshirt-designs.js. Put the image in
//         crew-lab/tshirts/. The id is the vote key already saved on this phone.
// Books:  append a set in assets/coloring-sets.js. Put images in
//         crew-lab/coloring-review/sets/<id>/.
// Other:  append a set to WINGS_REVIEW_OTHER below.
//
// Other set fields
// id         Stable key. Votes for this set are saved under this id.
// title      Name in the set picker.
// version    Optional. Image URLs get ?v= this number. Bump it when a file
//            is replaced but the name stays. An item version wins.
// imageBase  Optional folder relative to /crew-lab/hot-or-not-review/.
// items      Cards, in order.
//
// Item fields: id, title, image, alternate, badge ("NEW"), version,
// description, flag. Image is a local .webp file name.
//
// Do not put image files in this script.
// Votes already on a phone stay in localStorage:
//   shirts  wingscrew-tshirt-review
//   books   wingscrew-coloring-review
//   other   wingscrew-hot-or-not-review
//
// In the store
// IN_STORE is the only list to edit when another batch goes live.
// A number hides every card for that design (shirt, hoodie, sticker, mug, tote).
// Batches 03-11 are not live yet. Add their numbers here when they are.
// 93 is Unc Status: Unlocked. It was dropped, not published. It stays in this
// list so it does not sit in the decision queue.
(function () {
  var IN_STORE = [
    // Launch set, live since Oct 26
    "01",
    "02",
    "03",
    "12",
    "32",
    "36",
    "37",
    "60",
    "61",
    "75",
    "77",
    "79",
    "82",
    "83",
    "86",
    "89",
    "190",
    // Batch 01, published Oct 26
    "16",
    "22",
    "50",
    "52",
    "62",
    "70",
    "72",
    "80",
    "88",
    // Batch 02, published Oct 29
    "98",
    "99",
    "100",
    // Dropped. Not in the store.
    "93",
  ];
  window.WINGS_IN_STORE = IN_STORE;
  window.WINGS_REVIEW_OTHER = [
    // {
    //   id: "example",
    //   title: "Example",
    //   version: 1,
    //   imageBase: "sets/example/",
    //   items: [{ id: "01", title: "Example 01", image: "01.webp", badge: "NEW" }],
    // },
  ];

  function clean(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function fileName(value) {
    if (typeof value !== "string") return "";
    var base = value.trim().split("/").pop();
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.webp$/.test(base)) return "";
    return base;
  }

  function badgeText(value) {
    if (typeof value !== "string") return "";
    var text = clean(value);
    if (!text || text.length > 24) return "";
    if (!/^[A-Za-z0-9][A-Za-z0-9 .+-]*$/.test(text)) return "";
    return text;
  }

  function cacheVersion(value) {
    var n = Number(value);
    if (!isFinite(n) || n < 1 || n > 9999 || Math.floor(n) !== n) return "";
    return String(n);
  }

  function safeBase(value) {
    if (typeof value !== "string") return "";
    var base = value.trim();
    if (!base || base.indexOf("..") !== -1 || base.indexOf("\\") !== -1 || base.indexOf("//") !== -1) {
      return "";
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(base)) return "";
    if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(base)) return "";
    if (base.charAt(base.length - 1) !== "/") base += "/";
    return base;
  }

  function mapItem(entry, setVersion) {
    if (!entry || typeof entry.id !== "string" || typeof entry.title !== "string") return null;
    var id = entry.id.trim();
    var title = clean(entry.title);
    var image = fileName(entry.image);
    if (!id || !title || !image) return null;
    var alternate = fileName(entry.alternate);
    if (alternate === image) alternate = "";
    return {
      id: id,
      title: title,
      image: image,
      alternate: alternate,
      badge: badgeText(entry.badge),
      version: cacheVersion(entry.version) || setVersion || "",
      description: typeof entry.description === "string" ? clean(entry.description) : "",
      hasBack: entry.hasBack === true,
      flag: typeof entry.flag === "string" ? clean(entry.flag) : "",
    };
  }

  function mapList(source, setVersion) {
    if (!Array.isArray(source)) return [];
    var seen = {};
    var list = [];
    source.forEach(function (entry) {
      var item = mapItem(entry, setVersion);
      if (!item || seen[item.id]) return;
      seen[item.id] = true;
      list.push(item);
    });
    return list;
  }

  var inStoreNumbers = {};
  IN_STORE.forEach(function (value) {
    var n = parseInt(value, 10);
    if (isFinite(n)) inStoreNumbers[String(n)] = true;
  });

  function designNumber(id) {
    var match = String(id).match(/^(\d+)/);
    if (!match) return "";
    return String(parseInt(match[1], 10));
  }

  var queue = [];
  var shirtItems = mapList(window.WINGS_TSHIRTS, "");
  shirtItems.forEach(function (item) {
    var number = designNumber(item.id);
    item.inStore = inStoreNumbers[number] === true;
    item.notNeeded = number === "93";
  });
  if (shirtItems.length) {
    queue.push({
      id: "shirts",
      type: "shirts",
      title: "Shirts",
      imageBase: "../tshirts/",
      version: "",
      items: shirtItems,
    });
  }

  var bookSets = Array.isArray(window.WINGS_COLORING_SETS) ? window.WINGS_COLORING_SETS : [];
  bookSets.forEach(function (set) {
    if (!set || typeof set.id !== "string" || typeof set.title !== "string") return;
    var id = set.id.trim();
    var title = clean(set.title);
    if (!id || !title || !/^[a-z0-9-]+$/.test(id)) return;
    var version = cacheVersion(set.version);
    var items = mapList(set.pages, version);
    if (!items.length) return;
    queue.push({
      id: id,
      type: "books",
      title: title,
      imageBase: "../coloring-review/sets/" + id + "/",
      version: version,
      items: items,
    });
  });

  var otherSets = Array.isArray(window.WINGS_REVIEW_OTHER) ? window.WINGS_REVIEW_OTHER : [];
  otherSets.forEach(function (set) {
    if (!set || typeof set.id !== "string" || typeof set.title !== "string") return;
    var id = set.id.trim();
    var title = clean(set.title);
    if (!id || !title || !/^[a-z0-9-]+$/.test(id)) return;
    var version = cacheVersion(set.version);
    var items = mapList(set.items, version);
    if (!items.length) return;
    queue.push({
      id: id,
      type: "other",
      title: title,
      imageBase: safeBase(set.imageBase),
      version: version,
      items: items,
    });
  });

  window.WINGS_REVIEW_QUEUE = queue;
})();
