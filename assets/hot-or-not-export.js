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

  var BEGIN_RE = /^BEGIN ([A-Za-z]+) (\d+)(?: part (\d+) of (\d+))?$/;
  var END_RE = /^END ([A-Za-z]+) (\d+) picks included(?: part (\d+) of (\d+))?$/;
  var ITEM_RE = /^(.+?): (Hot|Not|Needs work)(?: \| (.*))?$/;

  function cleanLine(line) {
    return String(line || "").replace(/^\s*>\s?/, "").trim();
  }

  function parseBlocks(text) {
    var lines = String(text || "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map(cleanLine)
      .filter(Boolean);
    var blocks = [];
    var i = 0;
    while (i < lines.length) {
      var begin = BEGIN_RE.exec(lines[i]);
      if (!begin) {
        i += 1;
        continue;
      }
      i += 1;
      var collected = [];
      var end = null;
      while (i < lines.length) {
        end = END_RE.exec(lines[i]);
        if (end || BEGIN_RE.exec(lines[i])) break;
        collected.push(lines[i]);
        i += 1;
      }
      var items = [];
      var fields = {};
      var problems = [];
      collected.forEach(function (line) {
        var total = /^set total (\d+)$/.exec(line);
        var sum = /^checksum fnv1a32 ([0-9a-f]{8})$/.exec(line);
        var setSum = /^set-checksum fnv1a32 ([0-9a-f]{8})$/.exec(line);
        var ids = /^ids (\d+)$/.exec(line);
        var item = ITEM_RE.exec(line);
        if (total) fields.setTotal = Number(total[1]);
        else if (sum) fields.checksum = sum[1];
        else if (setSum) fields.setChecksum = setSum[1];
        else if (ids) fields.ids = Number(ids[1]);
        else if (item) items.push({ status: item[2], line: line });
        else problems.push("Skipped a line that is not a pick.");
      });
      var label = begin[1];
      var count = Number(begin[2]);
      var part = begin[3] ? Number(begin[3]) : 1;
      var parts = begin[4] ? Number(begin[4]) : 1;
      var partName = parts > 1 ? " part " + part + " of " + parts : "";
      if (!end) problems.push(label + partName + " has no END line.");
      else if (
        end[1] !== label ||
        Number(end[2]) !== count ||
        (end[3] ? Number(end[3]) : 1) !== part ||
        (end[4] ? Number(end[4]) : 1) !== parts
      ) {
        problems.push(label + " END line does not match BEGIN.");
      }
      if (items.length !== count || fields.ids !== count) {
        problems.push(label + partName + " count does not match.");
      }
      var hash = checksumHex(
        items
          .map(function (item) {
            return item.line;
          })
          .join("\n")
      );
      if (fields.checksum !== hash) problems.push(label + partName + " checksum does not match.");
      if (typeof fields.setTotal !== "number") problems.push(label + partName + " has no set total.");
      blocks.push({
        label: label,
        part: part,
        parts: parts,
        items: items,
        fields: fields,
        problems: problems,
        trusted: problems.length === 0,
      });
      if (end) i += 1;
    }
    return blocks;
  }

  function statusLines(title, items) {
    var list = items.filter(function (item) {
      return item.status === title;
    });
    if (!list.length) return [];
    return [title + " (" + list.length + ")"].concat(
      list.map(function (item) {
        return item.line;
      })
    );
  }

  function shortenReceived(text) {
    var blocks = parseBlocks(text);
    if (!blocks.length) {
      var empty = "No Hot or Not review was found in that paste.";
      return { ok: false, problems: [empty], sets: [], text: empty };
    }
    var order = [];
    var groups = {};
    blocks.forEach(function (block) {
      if (!groups[block.label]) {
        groups[block.label] = [];
        order.push(block.label);
      }
      groups[block.label].push(block);
    });
    var problems = [];
    var setTexts = [];
    var sets = [];
    order.forEach(function (label) {
      var group = groups[label];
      var byPart = {};
      var seen = {};
      var partCount = 1;
      group.forEach(function (block) {
        if (block.parts > partCount) partCount = block.parts;
        seen[block.part] = true;
        if (!block.trusted) {
          block.problems.forEach(function (problem) {
            problems.push(problem);
          });
          return;
        }
        var prev = byPart[block.part];
        if (!prev) {
          byPart[block.part] = block;
          return;
        }
        var prevText = prev.items
          .map(function (item) {
            return item.line;
          })
          .join("\n");
        var nextText = block.items
          .map(function (item) {
            return item.line;
          })
          .join("\n");
        if (prevText !== nextText) {
          problems.push(label + " part " + block.part + " of " + block.parts + " was pasted more than once and the copies do not match.");
          delete byPart[block.part];
        }
      });
      var trusted = [];
      var part;
      for (part = 1; part <= partCount; part++) {
        if (byPart[part]) trusted.push(byPart[part]);
        else if (!seen[part]) problems.push(label + " is missing part " + part + " of " + partCount + ".");
      }
      if (!trusted.length) {
        sets.push({ label: label, complete: false, received: 0, expected: 0, hot: 0, not: 0, needs: 0 });
        return;
      }
      var setTotal = trusted[0].fields.setTotal;
      var agreed = trusted.every(function (block) {
        return block.parts === partCount && block.fields.setTotal === setTotal;
      });
      if (!agreed) problems.push(label + " parts do not agree on the set total.");
      var items = [];
      trusted.forEach(function (block) {
        items = items.concat(block.items);
      });
      var missing = partCount - trusted.length;
      var complete = agreed && missing === 0 && items.length === setTotal;
      if (complete) {
        var setHash = checksumHex(
          items
            .map(function (item) {
              return item.line;
            })
            .join("\n")
        );
        var checksums = {};
        trusted.forEach(function (block) {
          if (block.fields.setChecksum) checksums[block.fields.setChecksum] = true;
        });
        var keys = Object.keys(checksums);
        if (keys.length > 1 || (keys.length === 1 && keys[0] !== setHash)) {
          problems.push(label + " set-checksum does not match.");
          complete = false;
        }
      } else if (agreed && missing === 0 && items.length !== setTotal) {
        problems.push(label + " set total does not match the picks.");
      }
      var hot = items.filter(function (item) {
        return item.status === "Hot";
      }).length;
      var lines = [
        complete
          ? label + ": " + items.length + " picks. " + hot + " Hot left off this list."
          : label + ": " + items.length + " of " + setTotal + " picks pasted.",
      ];
      lines = lines.concat(statusLines("Not", items), statusLines("Needs work", items));
      setTexts.push(lines.join("\n"));
      sets.push({
        label: label,
        complete: complete,
        received: items.length,
        expected: setTotal,
        hot: hot,
        not: items.filter(function (item) {
          return item.status === "Not";
        }).length,
        needs: items.filter(function (item) {
          return item.status === "Needs work";
        }).length,
      });
    });
    var chunks = [];
    if (problems.length) chunks.push(problems.join("\n"));
    if (setTexts.length) chunks.push(setTexts.join("\n\n"));
    return { ok: problems.length === 0, problems: problems, sets: sets, text: chunks.join("\n\n") };
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
    shortenReceived: shortenReceived,
  };
});
