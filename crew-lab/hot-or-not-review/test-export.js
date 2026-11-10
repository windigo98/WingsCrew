// Builds sample Hot or Not emails from fixture votes and checks nothing is dropped.
// Run: node crew-lab/hot-or-not-review/test-export.js
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var exp = require("../../assets/hot-or-not-export.js");
var setsRoot = path.join(__dirname, "../coloring-review/sets");

function fnv1a32(text) {
  var hash = 2166136261;
  var i;
  for (i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function pageFile(set, page) {
  var id = page < 10 ? "0" + page : String(page);
  if (set === "unicorns" && page === 1) return "p01_pose_a.webp";
  if (set === "dinosaurs" && page === 17) return "p17_b.webp";
  var preferred = "p" + id + "_a.webp";
  if (fs.existsSync(path.join(setsRoot, set, preferred))) return preferred;
  var other = "p" + id + "_b.webp";
  if (fs.existsSync(path.join(setsRoot, set, other))) return other;
  throw new Error("No page file for " + set + " " + id);
}

function fileForBookId(pickId) {
  var match = /^([a-z0-9-]+) p(\d+) ([A-Za-z0-9_-]+)$/.exec(pickId);
  assert.ok(match, "book id shape: " + pickId);
  return path.join(setsRoot, match[1], "p" + match[2] + "_" + match[3] + ".webp");
}

function pluralPicks(count) {
  return count + " " + (count === 1 ? "pick" : "picks");
}

function expectedSubject(label, total, part, parts) {
  var subject = "Hot or Not \u2013 " + label + " \u2013 " + pluralPicks(total);
  if (parts > 1) subject += " \u2013 part " + part + " of " + parts;
  return subject;
}

function parseBody(body) {
  var lines = body.split("\n");
  assert.ok(!lines.some(function (line) { return line === ""; }), "blank line in body");
  var begin = /^BEGIN ([A-Za-z]+) (\d+)(?: part (\d+) of (\d+))?$/.exec(lines[0]);
  var end = /^END ([A-Za-z]+) (\d+) picks included(?: part (\d+) of (\d+))?$/.exec(lines[lines.length - 1]);
  assert.ok(begin, "BEGIN line: " + lines[0]);
  assert.ok(end, "END line: " + lines[lines.length - 1]);
  var cursor = lines.length - 2;
  var fields = {};
  while (cursor > 0) {
    var total = /^set total (\d+)$/.exec(lines[cursor]);
    var sum = /^checksum fnv1a32 ([0-9a-f]{8})$/.exec(lines[cursor]);
    var setSum = /^set-checksum fnv1a32 ([0-9a-f]{8})$/.exec(lines[cursor]);
    var ids = /^ids (\d+)$/.exec(lines[cursor]);
    if (total) fields.setTotal = Number(total[1]);
    else if (sum) fields.checksum = sum[1];
    else if (setSum) fields.setChecksum = setSum[1];
    else if (ids) fields.ids = Number(ids[1]);
    else break;
    cursor -= 1;
  }
  return {
    label: begin[1],
    count: Number(begin[2]),
    part: begin[3] ? Number(begin[3]) : 1,
    parts: begin[4] ? Number(begin[4]) : 1,
    endLabel: end[1],
    endCount: Number(end[2]),
    endPart: end[3] ? Number(end[3]) : 1,
    endParts: end[4] ? Number(end[4]) : 1,
    items: lines.slice(1, cursor + 1),
    fields: fields,
  };
}

function assertBatch(label, picks) {
  var built = exp.buildMessages(label, picks);
  var expectedLines = picks.map(function (pick) {
    return exp.pickLine(pick.id, pick.status, pick.note);
  });
  var fullHash = fnv1a32(expectedLines.join("\n"));
  assert.strictEqual(built.label, label);
  assert.strictEqual(built.total, picks.length);
  assert.strictEqual(built.safe, true, label + " should fit under the mailto limit");
  assert.ok(built.messages.length >= 1);
  if (picks.length >= 500) assert.ok(built.messages.length > 1, "a long set must split");

  var seen = [];
  built.messages.forEach(function (message, index) {
    assert.ok(message.href.length <= exp.SAFE_LIMIT, label + " part " + (index + 1) + " is " + message.href.length);
    assert.strictEqual(message.safe, true);
    assert.strictEqual(message.href.indexOf("mailto:" + exp.MAIL + "?subject="), 0);
    assert.strictEqual(message.subject, expectedSubject(label, picks.length, index + 1, built.messages.length));
    assert.strictEqual(decodeURIComponent(message.href.split("body=")[1]), message.body);
    assert.ok(message.body.indexOf("Notes:") === -1);
    assert.ok(message.body.indexOf("(none)") === -1);

    var parsed = parseBody(message.body);
    assert.strictEqual(parsed.label, label);
    assert.strictEqual(parsed.endLabel, label);
    assert.strictEqual(parsed.count, parsed.items.length);
    assert.strictEqual(parsed.endCount, parsed.items.length);
    assert.strictEqual(parsed.fields.ids, parsed.items.length);
    assert.strictEqual(parsed.fields.setTotal, picks.length);
    assert.strictEqual(parsed.part, index + 1);
    assert.strictEqual(parsed.parts, built.messages.length);
    assert.strictEqual(parsed.endPart, parsed.part);
    assert.strictEqual(parsed.endParts, parsed.parts);
    assert.strictEqual(parsed.fields.checksum, fnv1a32(parsed.items.join("\n")));
    assert.strictEqual(parsed.fields.checksum, message.checksum);
    assert.strictEqual(parsed.fields.setChecksum, fullHash);
    assert.deepStrictEqual(parsed.items, message.lines);
    seen = seen.concat(parsed.items);
  });

  assert.deepStrictEqual(seen, expectedLines);
  assert.strictEqual(new Set(seen).size, seen.length);
  return built;
}

assert.strictEqual(exp.SAFE_LIMIT, 1800);
assert.strictEqual(exp.checksumHex("a"), "e40c292c");
assert.strictEqual(exp.checksumHex(""), "811c9dc5");
assert.strictEqual(fnv1a32("a"), exp.checksumHex("a"));

assert.strictEqual(exp.bookPickId("dinosaurs", "p06_a.webp"), "dinosaurs p06 a");
assert.strictEqual(exp.bookPickId("unicorns", "p24_pose_a.webp"), "unicorns p24 pose_a");
assert.ok(fs.existsSync(fileForBookId("dinosaurs p06 a")));
assert.ok(fs.existsSync(fileForBookId("unicorns p24 pose_a")));

assert.strictEqual(
  exp.pickId(
    { type: "books", id: "dinosaurs" },
    { id: "06", image: "p06_a.webp" },
    { lookingAt: "p06_a.webp" }
  ),
  "dinosaurs p06 a"
);
assert.strictEqual(
  exp.pickId(
    { type: "books", id: "unicorns" },
    { id: "01", image: "p01_a.webp" },
    { lookingAt: "p01_pose_a.webp" }
  ),
  "unicorns p01 pose_a"
);
assert.strictEqual(
  exp.pickId({ type: "shirts", id: "shirts" }, { id: "01-armor-off", image: "01-armor-off.webp" }, {}),
  "01-armor-off"
);
assert.strictEqual(
  exp.pickId({ type: "other", id: "mugs" }, { id: "01", image: "01.webp" }, {}),
  "mugs 01"
);

assert.strictEqual(exp.pickLine("dinosaurs p06 a", "Hot", ""), "dinosaurs p06 a: Hot");
assert.strictEqual(exp.pickLine("dinosaurs p06 a", "Hot", "   "), "dinosaurs p06 a: Hot");
assert.strictEqual(exp.pickLine("01-armor-off", "Not", "note text"), "01-armor-off: Not | note text");
assert.strictEqual(exp.pickLine("01-armor-off", "Not", "line one\nline two"), "01-armor-off: Not | line one line two");

var shirts = [];
var s;
for (s = 1; s <= 500; s++) {
  var shirtId = s === 1 ? "01-armor-off" : "shirt-" + String(s).padStart(3, "0");
  shirts.push({
    id: shirtId,
    status: s % 3 === 0 ? "Needs work" : s % 2 === 0 ? "Not" : "Hot",
    note: s === 1 ? "note text" : s % 47 === 0 ? "check the print" : "",
  });
}

var bookSets = ["dinosaurs", "unicorns", "trucks"];
var books = [];
bookSets.forEach(function (setName) {
  var page;
  for (page = 1; page <= 30; page++) {
    var file = pageFile(setName, page);
    var pickId = exp.bookPickId(setName, file);
    assert.ok(fs.existsSync(fileForBookId(pickId)), pickId);
    var status = page % 2 === 0 ? "Not" : "Hot";
    if (setName === "dinosaurs" && page === 6) status = "Hot";
    books.push({
      id: pickId,
      status: status,
      note: setName === "dinosaurs" && page === 6 ? "keep this one" : "",
    });
  }
});
assert.strictEqual(books.length, 90);
assert.ok(books.some(function (pick) { return pick.id === "dinosaurs p06 a"; }));
assert.ok(books.some(function (pick) { return pick.id === "dinosaurs p17 b"; }));
assert.ok(books.some(function (pick) { return pick.id === "unicorns p01 pose_a"; }));

var others = [
  { id: "mugs 01", status: "Hot", note: "" },
  { id: "mugs 02", status: "Not", note: "handle is thin" },
  { id: "stickers 04", status: "Needs work", note: "" },
];

var shirtMail = assertBatch("Shirts", shirts);
var bookMail = assertBatch("Books", books);
var otherMail = assertBatch("Other", others);

var copy = exp.copyText([
  { label: "Shirts", picks: shirts },
  { label: "Books", picks: books },
  { label: "Other", picks: others },
]);
assert.ok(copy.indexOf("BEGIN Shirts 500") === 0);
assert.ok(copy.indexOf("END Shirts 500 picks included") !== -1);
assert.ok(copy.indexOf("BEGIN Books 90") !== -1);
assert.ok(copy.indexOf("END Books 90 picks included") !== -1);
assert.ok(copy.indexOf("BEGIN Other 3") !== -1);
assert.ok(copy.indexOf("END Other 3 picks included") !== -1);
assert.ok(copy.indexOf("dinosaurs p06 a: Hot | keep this one") !== -1);
assert.ok(copy.indexOf("01-armor-off: Hot | note text") !== -1);
assert.ok(copy.indexOf("Notes:") === -1);
assert.ok(copy.indexOf("(none)") === -1);
assert.ok(copy.indexOf("\n\n") === -1);
["Shirts", "Books", "Other"].forEach(function (label) {
  var block = copy.split("BEGIN " + label + " ")[1];
  var body = "BEGIN " + label + " " + block.split(/(?=BEGIN )/)[0].replace(/\n$/, "");
  var parsed = parseBody(body);
  assert.strictEqual(parsed.fields.checksum, fnv1a32(parsed.items.join("\n")));
  assert.strictEqual(parsed.fields.ids, parsed.items.length);
  assert.strictEqual(parsed.count, parsed.items.length);
});

var emptyCopy = exp.copyText([{ label: "Books", picks: [] }]);
var emptyParsed = parseBody(emptyCopy);
assert.strictEqual(emptyParsed.count, 0);
assert.strictEqual(emptyParsed.fields.checksum, "811c9dc5");
assert.strictEqual(emptyParsed.fields.ids, 0);

var hugeNote = "x".repeat(4000);
var huge = exp.buildMessages("Shirts", [{ id: "01-armor-off", status: "Not", note: hugeNote }]);
assert.strictEqual(huge.safe, false);
assert.ok(huge.messages.some(function (message) {
  return message.safe === false && message.href.length > exp.SAFE_LIMIT;
}));
var hugeCopy = exp.copyText([{ label: "Shirts", picks: [{ id: "01-armor-off", status: "Not", note: hugeNote }] }]);
assert.ok(hugeCopy.indexOf(hugeNote) !== -1);

function linesFor(picks, status) {
  return picks
    .filter(function (pick) {
      return pick.status === status;
    })
    .map(function (pick) {
      return exp.pickLine(pick.id, pick.status, pick.note);
    });
}

function assertShortSet(text, label, picks) {
  var hot = linesFor(picks, "Hot");
  var nots = linesFor(picks, "Not");
  var needs = linesFor(picks, "Needs work");
  assert.ok(text.indexOf(label + ": " + picks.length + " picks. " + hot.length + " Hot left off this list.") !== -1);
  nots.concat(needs).forEach(function (line) {
    assert.ok(text.indexOf(line) !== -1, "missing " + line);
  });
  hot.forEach(function (line) {
    assert.strictEqual(text.indexOf(line), -1, "Hot line should be left off: " + line);
  });
  if (nots.length) assert.ok(text.indexOf("Not (" + nots.length + ")") !== -1);
  if (needs.length) assert.ok(text.indexOf("Needs work (" + needs.length + ")") !== -1);
}

var received = bookMail.messages
  .map(function (message) {
    return "Subject: " + message.subject + "\n\n" + message.body;
  })
  .join("\n\n");
var shortened = exp.shortenReceived(received);
assert.strictEqual(shortened.ok, true);
assert.deepStrictEqual(shortened.problems, []);
assertShortSet(shortened.text, "Books", books);
assert.ok(shortened.text.indexOf("BEGIN ") === -1);
assert.ok(shortened.text.indexOf("checksum ") === -1);

var combined = exp.shortenReceived(
  [shirtMail, bookMail, otherMail]
    .map(function (batch) {
      return batch.messages
        .map(function (message) {
          return message.body;
        })
        .join("\n");
    })
    .join("\n")
);
assert.strictEqual(combined.ok, true);
assertShortSet(combined.text, "Shirts", shirts);
assertShortSet(combined.text, "Books", books);
assertShortSet(combined.text, "Other", others);

var missingPart = exp.shortenReceived(
  [bookMail.messages[0].body, bookMail.messages[2].body].join("\n\n")
);
assert.strictEqual(missingPart.ok, false);
assert.ok(missingPart.problems.some(function (problem) {
  return problem === "Books is missing part 2 of 3.";
}));
var pastedCount = bookMail.messages[0].lines.length + bookMail.messages[2].lines.length;
assert.ok(missingPart.text.indexOf(pastedCount + " of 90 picks pasted") !== -1);
assert.ok(missingPart.text.indexOf("dinosaurs p06 a: Hot") === -1);

var tampered = exp.shortenReceived(bookMail.messages[0].body.replace(": Hot", ": Not"));
assert.strictEqual(tampered.ok, false);
assert.ok(tampered.problems.some(function (problem) {
  return problem.indexOf("checksum") !== -1;
}));
assert.strictEqual(tampered.text.indexOf("dinosaurs p01"), -1);

console.log("ok");
console.log("shirts parts " + shirtMail.messages.length);
console.log("books parts " + bookMail.messages.length + " first url " + bookMail.messages[0].href.length);
console.log("other parts " + otherMail.messages.length);
console.log("--- sample books part ---");
console.log(bookMail.messages[0].body.split("\n").slice(0, 6).join("\n"));
console.log("...");
console.log(bookMail.messages[0].body.split("\n").slice(-5).join("\n"));
