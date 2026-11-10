# Hot or Not review export

Picks stay on the phone (`localStorage`). **Copy my review** and the **Email** buttons are the only way out. Nothing is sent on its own.

Email is one button per set (Shirts, Books, Other), plus **Email all**. Each draft uses the same compact lines as Copy:

```
dinosaurs p06 a: Hot
01-armor-off: Not | note text
```

Book ids are the set folder, the page (`p06`), and the slot from the file name (`p06_a.webp` → `a`, `p24_pose_a.webp` → `pose_a`). Shirt ids are the vote keys. A blank note is left off. Pending cards are not included.

## Draft shape

A short set is one email. The subject is `Hot or Not – Books – 90 picks`. The body starts with `BEGIN` and ends with `END`:

```
BEGIN Books 2
dinosaurs p06 a: Hot
unicorns p01 pose_a: Not | note text
set total 2
checksum fnv1a32 1a2b3c4d
set-checksum fnv1a32 1a2b3c4d
ids 2
END Books 2 picks included
```

A long set is split into parts you tap one at a time (`Send part 1 of 3`). The subject gains `part 1 of 3`. `BEGIN` / `END` use that part's count, and `set total` is the whole set. Parts are packed to 1,600 characters of encoded `mailto:` URL, under the 1,800 limit that stays safe for iOS Mail. If a link would still be longer than 1,800, it is not opened. Use **Copy my review** and paste.

## Checksum

`checksum` is FNV-1a 32-bit of that part's item lines joined by `\n` (no trailer, no trailing newline). `set-checksum` is the same hash of every item line in the set, in order. `ids` is how many item lines are in the part. It must match the `BEGIN` and `END` counts.

```
hash = 2166136261
for each UTF-16 code unit c (String.charCodeAt, 0–65535):
  hash = hash XOR c
  hash = (hash * 16777619) mod 2^32
print 8 lowercase hex digits
```

ASCII matches byte-wise FNV-1a (`"a"` → `e40c292c`, empty → `811c9dc5`). The same steps are in `assets/hot-or-not-export.js` (`checksumHex`).

To verify a set, concatenate the item lines from part 1 through part n. The count must equal `set total`, and the hash must equal `set-checksum`.

## Test

```
node crew-lab/hot-or-not-review/test-export.js
```

The script builds 500 shirt picks, 90 book picks from the files in `crew-lab/coloring-review/sets/`, and a few other picks. It checks the URL limit, the BEGIN/END counts, the checksum, and that the parts union to the full list with nothing missing or repeated.
