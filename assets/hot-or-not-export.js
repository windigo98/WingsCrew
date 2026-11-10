// Hot or Not review export. Builds the copy text and the mailto drafts.
// Votes stay in localStorage. This file only formats them.
//
// Checksum (so another tool can verify a draft):
// FNV-1a 32-bit over the item lines only, joined by "\n" with no trailing
// newline. Each UTF-16 code unit (String.charCodeAt, 0–65535) is mixed in.
// ASCII lines match the usual byte-wise FNV-1a ("a" -> e40c292c).
//   hash = 2166136261
//   for each code unit c:
//     hash = hash XOR c
//     hash = (hash * 16777619) mod 2^32
//   print 8 lowercase hex digits
// The "checksum" line hashes that part's item lines.
// The "set-checksum" line hashes every item line in the set, in order.
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.WingsHotOrNotExport = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  var MAIL = "dovewingsbusiness@gmail.com";
  // iOS Mail drops mailto URLs around this size. Never open one longer than this.
  var SAFE_LIMIT = 1800;
  // Pack below the hard limit so a part is not sitting on the cutoff.
  var PACK_LIMIT = 1600;

  function oneLine(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function checksumHex(text) {
    var hash = 2166136261;
    var i;
    for (i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }

  function bookPickId(setId, file) {
    var base = String(file == null ? "" : file).split("/").pop();
    var match = /^p(\d+)_([A-Za-z0-9_-]+)\.webp$/.exec(base);
    if (!match) return oneLine(String(setId) + " " + base.replace(/\.webp$/i, ""));
    return oneLine(setId) + " p" + match[1] + " " + match[2];
  }

  function pickId(set, item, review) {
    if (!set || !item) return "";
    if (set.type === "books") {
      var looking = review && review.lookingAt;
      var lookingName = String(looking == null ? "" : looking).split("/").pop();
      if (/^p\d+_/.test(lookingName)) return bookPickId(set.id, lookingName);
      return bookPickId(set.id, item.image);
    }
    if (set.type === "shirts") return oneLine(item.id);
    return oneLine(String(set.id) + " " + String(item.id));
  }

  function pickLine(id, status, note) {
    var line = oneLine(id) + ": " + oneLine(status);
    var extra = oneLine(note);
    if (extra) line += " | " + extra;
    return line;
  }

  function pluralPicks(count) {
    return count + (count === 1 ? " pick" : " picks");
  }

  function mailto(subject, body) {
    return (
      "mailto:" +
      MAIL +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body)
    );
  }

  function render(label, itemLines, partIndex, partCount, setTotal, allLines) {
    var count = itemLines.length;
    var partNo = partIndex + 1;
    var multi = partCount > 1;
    var begin = multi
      ? "BEGIN " + label + " " + count + " part " + partNo + " of " + partCount
      : "BEGIN " + label + " " + count;
    var end = multi
      ? "END " + label + " " + count + " picks included part " + partNo + " of " + partCount
      : "END " + label + " " + count + " picks included";
    var partHash = checksumHex(itemLines.join("\n"));
    var setHash = checksumHex(allLines.join("\n"));
    var body = [begin]
      .concat(itemLines)
      .concat([
        "set total " + setTotal,
        "checksum fnv1a32 " + partHash,
        "set-checksum fnv1a32 " + setHash,
        "ids " + count,
        end,
      ])
      .join("\n");
    var subject = "Hot or Not \u2013 " + label + " \u2013 " + pluralPicks(setTotal);
    if (multi) subject += " \u2013 part " + partNo + " of " + partCount;
    var href = mailto(subject, body);
    return {
      subject: subject,
      body: body,
      href: href,
      part: partNo,
      parts: partCount,
      count: count,
      setTotal: setTotal,
      checksum: partHash,
      setChecksum: setHash,
      safe: href.length <= SAFE_LIMIT,
      lines: itemLines.slice(),
    };
  }

  function chunkLines(label, lines) {
    var total = lines.length;
    var guess = total;
    var wide = guess - 1;
    var chunks = [];
    var start = 0;
    while (start < total) {
      var alone = render(label, [lines[start]], wide, guess, total, lines);
      if (alone.href.length > PACK_LIMIT) {
        chunks.push([lines[start]]);
        start += 1;
        continue;
      }
      var best = start + 1;
      var lo = start + 1;
      var hi = total;
      while (lo <= hi) {
        var mid = Math.floor((lo + hi) / 2);
        var candidate = render(label, lines.slice(start, mid), wide, guess, total, lines);
        if (candidate.href.length <= PACK_LIMIT) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      chunks.push(lines.slice(start, best));
      start = best;
    }
    return chunks;
  }

  function buildMessages(label, picks) {
    var lines = (picks || []).map(function (pick) {
      return pickLine(pick.id, pick.status, pick.note);
    });
    var total = lines.length;
    if (!total) {
      var empty = render(label, [], 0, 1, 0, []);
      return { label: label, total: 0, safe: empty.safe, messages: [empty] };
    }
    var single = render(label, lines, 0, 1, total, lines);
    if (single.href.length <= PACK_LIMIT) {
      return { label: label, total: total, safe: true, messages: [single] };
    }
    var messages = chunkLines(label, lines).map(function (chunk, index, chunks) {
      return render(label, chunk, index, chunks.length, total, lines);
    });
    var safe = messages.every(function (message) {
      return message.safe;
    });
    return { label: label, total: total, safe: safe, messages: messages };
  }

  function copyText(sections) {
    return (sections || [])
      .map(function (section) {
        var lines = (section.picks || []).map(function (pick) {
          return pickLine(pick.id, pick.status, pick.note);
        });
        return render(section.label, lines, 0, 1, lines.length, lines).body;
      })
      .join("\n");
  }

  return {
    MAIL: MAIL,
    SAFE_LIMIT: SAFE_LIMIT,
    checksumHex: checksumHex,
    bookPickId: bookPickId,
    pickId: pickId,
    pickLine: pickLine,
    buildMessages: buildMessages,
    copyText: copyText,
  };
});
