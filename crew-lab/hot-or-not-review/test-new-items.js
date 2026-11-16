// New Hot or Not cards must be undecided on a phone that already voted every old id.
// Run: node crew-lab/hot-or-not-review/test-new-items.js
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var nodeCrypto = require("node:crypto");

var root = path.join(__dirname, "../..");
var setsRoot = path.join(__dirname, "../coloring-review/sets");
var shirtDir = path.join(__dirname, "../tshirts");

var PRIOR_SHIRT_HASH = "95654594fd59c5b56738814838cfd1e466793847647e5e54f2e18373929c75c4";
var PRIOR_BOOK_HASH = "1c60bb202f17194cccfe9d7227bb296070d9c0f7310f8c9010512b4963d452af";
var PRIOR_SHIRT_COUNT = 492;
var PRIOR_SET_IDS = ["dinosaurs", "nativity", "unicorns", "trucks"];

var NEW_SHIRTS = [
  ["191-random-lollipop", "Random Lollipop"],
  ["191-random-lollipop-cap", "Random Lollipop (cap)"],
  ["191b-random-lollipop", "Random Lollipop (flirty)"],
  ["191b-random-lollipop-cap", "Random Lollipop (flirty cap)"],
  ["192-eye-candy-sugar-coated", "Eye Candy, Sugar Coated"],
  ["193-sweet-tooth-sharp-bite", "Sweet Tooth, Sharp Bite"],
  ["194-suck-it-up-buttercup", "Suck It Up, Buttercup"],
  ["195-too-sweet-to-handle", "Too Sweet to Handle"],
  ["196-licked-and-loaded", "Licked & Loaded"],
  ["197-hard-candy-soft-heart", "Hard Candy, Soft Heart"],
  ["198-sugar-daddy-issues", "Sugar Daddy Issues"],
  ["199-cherry-on-top-of-trouble", "Cherry on Top of Trouble"],
  ["200-mint-condition", "Mint Condition"],
  ["201-gummy-and-gorgeous", "Gummy & Gorgeous"],
  ["202-popping-off-my-world", "Popping Off My World"],
  ["203-unwrap-me-slowly", "Unwrap Me Slowly"],
  ["204-highly-inappropriate", "Highly Inappropriate"],
];

var DINO_SET_ID = "dinosaurs-regen-nov11";
var DINO_TITLE = "Cute Dinosaurs: redo (Nov 11), pick A or B";
var DINO_PAGES = [2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 22, 23, 24, 29];
var DINO_SCENES = {
  2: "Jungle fern forest",
  3: "Dino egg nest",
  4: "Sunny beach",
  5: "Jungle waterfall",
  7: "Cozy cave",
  8: "Desert canyon",
  9: "Flower meadow",
  10: "Lazy river",
  11: "Rainy day puddles",
  12: "Hot spring pond",
  13: "Dino playground",
  14: "Jungle picnic",
  15: "Birthday party clearing",
  16: "Starry campsite",
  17: "Ice age snowy hill",
  19: "Vegetable garden",
  20: "Forest music stage",
  22: "Bubble bath lagoon",
  23: "Rainbow hill",
  24: "Fossil dig site",
  29: "Seashore tide line",
};
var REGEN_PAGES = { 10: true, 12: true, 22: true };

function hash(value) {
  return nodeCrypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function loadWindow() {
  var sandbox = { window: {}, console: console };
  vm.createContext(sandbox);
  ["assets/tshirt-designs.js", "assets/coloring-sets.js", "assets/review-queue.js"].forEach(function (file) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
  });
  return sandbox.window;
}

function pad(number) {
  return number < 10 ? "0" + number : String(number);
}

function isDecided(raw) {
  return !!(raw && (raw.vote === "yes" || raw.vote === "no" || raw.vote === "needs"));
}

function pendingItems(queue, shirtStore, bookStore) {
  var pending = { shirts: [], books: [] };
  queue.forEach(function (set) {
    if (!set || (set.type !== "shirts" && set.type !== "books")) return;
    set.items.forEach(function (item) {
      var raw = set.type === "shirts" ? shirtStore[item.id] : (bookStore[set.id] || {})[item.id];
      if (!isDecided(raw)) pending[set.type].push({ setId: set.id, id: item.id, image: item.image });
    });
  });
  return pending;
}

function voteAll(items, store, nested) {
  items.forEach(function (item) {
    var record = { vote: "yes", notes: "" };
    if (nested) {
      if (!store[item.setId]) store[item.setId] = {};
      store[item.setId][item.id] = record;
    } else {
      store[item.id] = record;
    }
  });
}

var window = loadWindow();
var shirts = window.WINGS_TSHIRTS;
var sets = window.WINGS_COLORING_SETS;
var queue = window.WINGS_REVIEW_QUEUE;
var exp = require("../../assets/hot-or-not-export.js");

assert.strictEqual(shirts.length, PRIOR_SHIRT_COUNT + NEW_SHIRTS.length);
assert.strictEqual(hash(shirts.slice(0, PRIOR_SHIRT_COUNT)), PRIOR_SHIRT_HASH);
assert.deepStrictEqual(
  Array.prototype.map.call(sets.slice(0, 4), function (set) { return set.id; }),
  PRIOR_SET_IDS
);
assert.strictEqual(hash(sets.slice(0, 4)), PRIOR_BOOK_HASH);
assert.strictEqual(sets.length, 5);

var priorIds = {};
shirts.slice(0, PRIOR_SHIRT_COUNT).forEach(function (shirt) {
  assert.ok(!priorIds[shirt.id], "duplicate old shirt id " + shirt.id);
  priorIds[shirt.id] = true;
});

var added = shirts.slice(PRIOR_SHIRT_COUNT);
assert.deepStrictEqual(
  Array.prototype.map.call(added, function (shirt) { return [shirt.id, shirt.title]; }),
  NEW_SHIRTS
);
added.forEach(function (shirt) {
  assert.ok(!priorIds[shirt.id], "new shirt id already voted on this phone: " + shirt.id);
  assert.strictEqual(shirt.image, shirt.id + ".webp");
  assert.ok(shirt.image.indexOf("-old") === -1);
  assert.strictEqual(shirt.hasBack, false);
  assert.strictEqual(typeof shirt.description, "string");
  assert.ok(shirt.description.length > 0);
  var file = path.join(shirtDir, shirt.image);
  assert.ok(fs.existsSync(file), "missing " + shirt.image);
});

var regen = sets[4];
assert.strictEqual(regen.id, DINO_SET_ID);
assert.strictEqual(regen.title, DINO_TITLE);
assert.strictEqual(regen.pages.length, 42);

var expectedPages = [];
DINO_PAGES.forEach(function (number) {
  ["A", "B"].forEach(function (letter) {
    var id = "p" + pad(number) + "-" + letter.toLowerCase();
    expectedPages.push({
      id: id,
      title: "Page " + pad(number) + " " + letter,
      image: "p" + pad(number) + "_" + letter.toLowerCase() + ".webp",
      description: DINO_SCENES[number],
      flag: REGEN_PAGES[number] ? "Regen advised" : undefined,
    });
  });
});
assert.strictEqual(expectedPages.length, 42);
var dinoWebpPrefixes = {};
fs.readdirSync(path.join(setsRoot, "dinosaurs")).forEach(function (name) {
  if (name.slice(-5) !== ".webp") return;
  dinoWebpPrefixes[webpPrefix(path.join(setsRoot, "dinosaurs", name))] = true;
});
regen.pages.forEach(function (page, index) {
  var expected = expectedPages[index];
  assert.strictEqual(page.id, expected.id);
  assert.strictEqual(page.title, expected.title);
  assert.strictEqual(page.image, expected.image);
  assert.ok(!page.alternate, "A and B are separate cards");
  assert.strictEqual(page.description, expected.description);
  assert.strictEqual(page.flag, expected.flag);
  assert.ok(!priorIds[page.id]);
  var file = path.join(setsRoot, DINO_SET_ID, page.image);
  assert.ok(fs.existsSync(file), "missing " + file);
  assert.ok(dinoWebpPrefixes[webpPrefix(file)], page.image + " is not a 927x1200 lossy webp like the other coloring pages");
});

function webpPrefix(file) {
  var data = fs.readFileSync(file);
  assert.strictEqual(data.slice(12, 16).toString(), "VP8 ");
  var width = data.readUInt16LE(26) & 0x3fff;
  var height = data.readUInt16LE(28) & 0x3fff;
  var rest = data.subarray(30);
  var bits = "";
  var i;
  for (i = 0; i < 24; i++) bits += String((rest[i >> 3] >> (i & 7)) & 1);
  return width + "x" + height + " " + bits;
}

var shirtQueue = queue.filter(function (set) { return set.type === "shirts"; })[0];
var bookQueue = queue.filter(function (set) { return set.type === "books"; });
assert.strictEqual(shirtQueue.items.length, PRIOR_SHIRT_COUNT + NEW_SHIRTS.length);
assert.strictEqual(bookQueue.length, 5);
assert.strictEqual(bookQueue[4].id, DINO_SET_ID);
assert.strictEqual(bookQueue[4].items.length, 42);

var fresh = pendingItems(queue, {}, {});
assert.strictEqual(fresh.shirts.length, PRIOR_SHIRT_COUNT + NEW_SHIRTS.length);
assert.strictEqual(fresh.books.length, 120 + 42);

var oldShirtStore = {};
var oldBookStore = {};
voteAll(
  fresh.shirts.filter(function (item) { return priorIds[item.id]; }),
  oldShirtStore,
  false
);
voteAll(
  fresh.books.filter(function (item) { return item.setId !== DINO_SET_ID; }),
  oldBookStore,
  true
);
var owner = pendingItems(queue, oldShirtStore, oldBookStore);
assert.deepStrictEqual(
  owner.shirts.map(function (item) { return item.id; }),
  NEW_SHIRTS.map(function (row) { return row[0]; })
);
assert.strictEqual(owner.shirts.length, 17);
assert.strictEqual(owner.books.length, 42);
assert.ok(owner.books.every(function (item) { return item.setId === DINO_SET_ID; }));

function picksFor(type, shirtStore, bookStore) {
  var picks = [];
  queue.forEach(function (set) {
    if (set.type !== type) return;
    set.items.forEach(function (item) {
      var raw = type === "shirts" ? shirtStore[item.id] : (bookStore[set.id] || {})[item.id];
      if (!isDecided(raw)) return;
      var status = raw.vote === "yes" ? "Hot" : raw.vote === "no" ? "Not" : "Needs work";
      picks.push({
        id: exp.pickId(set, item, raw),
        status: status,
        note: "",
      });
    });
  });
  return picks;
}

var votedShirts = {};
var votedBooks = {};
NEW_SHIRTS.forEach(function (row) {
  votedShirts[row[0]] = { vote: "yes", notes: "" };
});
votedBooks[DINO_SET_ID] = {};
regen.pages.forEach(function (page) {
  votedBooks[DINO_SET_ID][page.id] = { vote: "no", notes: "", lookingAt: page.image };
});
Object.keys(oldShirtStore).forEach(function (id) { votedShirts[id] = oldShirtStore[id]; });
Object.keys(oldBookStore).forEach(function (id) { votedBooks[id] = oldBookStore[id]; });

var shirtLines = exp.copyText([{ label: "Shirts", picks: picksFor("shirts", votedShirts, votedBooks) }]);
var bookLines = exp.copyText([{ label: "Books", picks: picksFor("books", votedShirts, votedBooks) }]);
var allLines = exp.copyText([
  { label: "Shirts", picks: picksFor("shirts", votedShirts, votedBooks) },
  { label: "Books", picks: picksFor("books", votedShirts, votedBooks) },
]);
NEW_SHIRTS.forEach(function (row) {
  assert.ok(shirtLines.indexOf(row[0] + ": Hot") !== -1, row[0]);
  assert.ok(allLines.indexOf(row[0] + ": Hot") !== -1, row[0]);
});
regen.pages.forEach(function (page) {
  var pick = exp.bookPickId(DINO_SET_ID, page.image);
  assert.ok(bookLines.indexOf(pick + ": Not") !== -1, pick);
  assert.ok(allLines.indexOf(pick + ": Not") !== -1, pick);
});

var pageHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(pageHtml.indexOf("© 2026") !== -1);

console.log("ok");
console.log("shirts " + shirts.length + " new " + NEW_SHIRTS.length);
console.log("books pending when old ids are voted " + owner.books.length);
console.log("shirts pending when old ids are voted " + owner.shirts.length);
