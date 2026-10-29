// Crew Lab coloring review. Votes and notes stay in localStorage, per set.
// Copy and the mailto link are the only ways out. Nothing is sent on its own.
// Images are local files in crew-lab/coloring-review/sets/<set-id>/.
(function () {
  var STORAGE_KEY = "wingscrew-coloring-review";
  var SET_KEY = "wingscrew-coloring-review-set";
  var MAIL = "dovewingsbusiness@gmail.com";
  var mount = document.querySelector("[data-coloring-review]");
  if (!mount) return;

  var memoryOnly = false;
  var copyTimer = null;
  var sets = loadSets();
  var saved = loadSaved();
  var currentSet = null;
  var pages = [];
  var reviews = {};
  var index = 0;
  var filter = "all";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cleanLine(value) {
    return String(value).replace(/\s+/g, " ").trim();
  }

  function fileName(value) {
    if (typeof value !== "string") return "";
    var base = value.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.webp$/.test(base)) return "";
    return base;
  }

  function badgeText(value) {
    if (typeof value !== "string") return "";
    var text = cleanLine(value);
    if (!text || text.length > 24) return "";
    if (!/^[A-Za-z0-9][A-Za-z0-9 .+-]*$/.test(text)) return "";
    return text;
  }

  function cacheVersion(value) {
    var n = Number(value);
    if (!isFinite(n) || n < 1 || n > 9999 || Math.floor(n) !== n) return "";
    return String(n);
  }

  function loadPages(source, setVersion) {
    if (!Array.isArray(source)) return [];
    var seen = {};
    var list = [];
    source.forEach(function (entry) {
      if (!entry || typeof entry.id !== "string" || typeof entry.title !== "string") return;
      var id = entry.id.trim();
      var title = cleanLine(entry.title);
      var image = fileName(entry.image);
      var alternate = fileName(entry.alternate);
      if (!id || !title || !image || seen[id]) return;
      if (alternate === image) alternate = "";
      seen[id] = true;
      list.push({
        id: id,
        title: title,
        image: image,
        alternate: alternate,
        badge: badgeText(entry.badge),
        version: cacheVersion(entry.version) || setVersion || "",
      });
    });
    return list;
  }

  function loadSets() {
    var source = Array.isArray(window.WINGS_COLORING_SETS) ? window.WINGS_COLORING_SETS : [];
    var seen = {};
    var list = [];
    source.forEach(function (entry) {
      if (!entry || typeof entry.id !== "string" || typeof entry.title !== "string") return;
      var id = entry.id.trim();
      var title = cleanLine(entry.title);
      if (!id || !title || seen[id] || !/^[a-z0-9-]+$/.test(id)) return;
      var setPages = loadPages(entry.pages, cacheVersion(entry.version));
      if (!setPages.length) return;
      seen[id] = true;
      list.push({ id: id, title: title, pages: setPages });
    });
    return list;
  }

  function loadSaved() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return parsed;
    } catch (error) {
      memoryOnly = true;
      return {};
    }
  }

  function bucketFor(setId) {
    var bucket = saved[setId];
    if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) {
      bucket = {};
      saved[setId] = bucket;
    }
    return bucket;
  }

  function findSet(setId) {
    var i;
    for (i = 0; i < sets.length; i++) {
      if (sets[i].id === setId) return sets[i];
    }
    return sets[0] || null;
  }

  function pageAt(pageIndex) {
    return pages[pageIndex] || null;
  }

  function pageById(id) {
    var i;
    for (i = 0; i < pages.length; i++) {
      if (pages[i].id === id) return pages[i];
    }
    return null;
  }

  function indexKey() {
    return "wingscrew-coloring-review-index:" + currentSet.id;
  }

  function filterKey() {
    return "wingscrew-coloring-review-filter:" + currentSet.id;
  }

  function loadIndex() {
    try {
      var stored = sessionStorage.getItem(indexKey());
      if (!stored) return 0;
      var i;
      for (i = 0; i < pages.length; i++) {
        if (pages[i].id === stored) return i;
      }
    } catch (error) {
      return 0;
    }
    return 0;
  }

  function loadFilter() {
    try {
      var stored = sessionStorage.getItem(filterKey());
      if (
        stored === "all" ||
        stored === "pending" ||
        stored === "yes" ||
        stored === "no" ||
        stored === "needs"
      ) {
        return stored;
      }
    } catch (error) {
      return "all";
    }
    return "all";
  }

  function loadSetId() {
    try {
      return sessionStorage.getItem(SET_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function saveIndex() {
    try {
      if (!currentSet || index < 0 || !pages[index]) sessionStorage.removeItem(indexKey());
      else sessionStorage.setItem(indexKey(), pages[index].id);
    } catch (error) {
      /* the vote still stays in memory for this visit */
    }
  }

  function saveFilter() {
    try {
      if (currentSet) sessionStorage.setItem(filterKey(), filter);
    } catch (error) {
      /* the list still filters for this visit */
    }
  }

  function saveSetId() {
    try {
      if (currentSet) sessionStorage.setItem(SET_KEY, currentSet.id);
    } catch (error) {
      /* the open set still stays for this visit */
    }
  }

  function normalize(value, page) {
    var vote = "pending";
    var notes = "";
    var lookingAt = page ? page.image : "";
    if (value && typeof value === "object") {
      if (value.vote === "yes" || value.vote === "no" || value.vote === "needs" || value.vote === "pending") {
        vote = value.vote;
      }
      if (typeof value.notes === "string") notes = value.notes;
      if (
        page &&
        typeof value.lookingAt === "string" &&
        (value.lookingAt === page.image || (page.alternate && value.lookingAt === page.alternate))
      ) {
        lookingAt = value.lookingAt;
      }
    }
    return { vote: vote, notes: notes, lookingAt: lookingAt };
  }

  function reviewFor(id) {
    return normalize(reviews[id], pageById(id));
  }

  function writeReview(id, next) {
    reviews[id] = {
      vote: next.vote,
      notes: next.notes,
      lookingAt: next.lookingAt,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (error) {
      memoryOnly = true;
    }
  }

  function statusLabel(vote) {
    if (vote === "yes") return "Yes";
    if (vote === "no") return "No";
    if (vote === "needs") return "Needs work";
    return "Not yet";
  }

  function voteOf(page) {
    var vote = reviewFor(page.id).vote;
    if (vote === "yes" || vote === "no" || vote === "needs") return vote;
    return "pending";
  }

  function matchesFilter(page) {
    if (filter === "all") return true;
    return voteOf(page) === filter;
  }

  function visibleIndexes() {
    var list = [];
    pages.forEach(function (page, pageIndex) {
      if (matchesFilter(page)) list.push(pageIndex);
    });
    return list;
  }

  function countVotes(vote) {
    var total = 0;
    pages.forEach(function (page) {
      if (voteOf(page) === vote) total += 1;
    });
    return total;
  }

  function pageHeading(page) {
    var sameTitle = pages.some(function (other) {
      return other !== page && other.title === page.title;
    });
    return sameTitle ? page.title + " (" + page.id + ")" : page.title;
  }

  function fileList(page) {
    if (page.alternate) return page.image + ", " + page.alternate;
    return page.image;
  }

  function plainText() {
    var lines = ["Coloring page review", ""];
    sets.forEach(function (set, setIndex) {
      if (setIndex > 0) lines.push("");
      lines.push("Set: " + set.title);
      var bucket = saved[set.id];
      set.pages.forEach(function (page) {
        var stored = bucket && bucket[page.id] ? bucket[page.id] : null;
        var review = normalize(stored, page);
        var notes = review.notes.trim();
        lines.push("");
        lines.push(pageHeading(page));
        lines.push("Files: " + fileList(page));
        lines.push("Looking at: " + review.lookingAt);
        if (page.badge) lines.push("Badge: " + page.badge);
        lines.push("Status: " + statusLabel(review.vote));
        lines.push("Notes:");
        lines.push(notes || "(none)");
      });
    });
    return lines.join("\n") + "\n";
  }

  function mailtoHref() {
    return (
      "mailto:" +
      MAIL +
      "?subject=" +
      encodeURIComponent("Coloring page review") +
      "&body=" +
      encodeURIComponent(plainText())
    );
  }

  function imageSrc(setId, file, version) {
    if (!file || !/^[a-z0-9-]+$/.test(setId)) return "";
    var src = "sets/" + setId + "/" + file;
    if (version && /^[1-9][0-9]{0,3}$/.test(version)) src += "?v=" + version;
    return src;
  }

  function voteButton(vote, label, pressed) {
    return (
      '<button type="button" class="review-' +
      vote +
      '" data-vote="' +
      vote +
      '" aria-pressed="' +
      (pressed ? "true" : "false") +
      '">' +
      label +
      "</button>"
    );
  }

  function cardHtml(page) {
    var review = reviewFor(page.id);
    var src = imageSrc(currentSet.id, review.lookingAt, page.version);
    var visible = visibleIndexes();
    var pos = visible.indexOf(index);
    var showingAlt = page.alternate && review.lookingAt === page.alternate;
    var art = src
      ? '<div class="review-art has-image">' +
        (page.badge ? '<p class="review-new">' + escapeHtml(page.badge) + "</p>" : "") +
        '<button type="button" class="review-zoom" data-zoom><img src="' +
        escapeHtml(src) +
        '" width="927" height="1200" alt="' +
        escapeHtml(page.title) +
        '" loading="lazy" decoding="async"></button></div>'
      : '<div class="review-art" role="img" aria-label="' +
        escapeHtml("No artwork for " + page.title) +
        '"><p>No artwork</p></div>';

    return (
      '<article class="panel review-card">' +
      art +
      (src ? '<p class="review-zoom-hint">Tap the page to enlarge</p>' : "") +
      (page.alternate
        ? '<button type="button" class="review-alt" data-alt aria-pressed="' +
          (showingAlt ? "true" : "false") +
          '">Other version</button>' +
          '<p class="review-version">Showing ' +
          escapeHtml(review.lookingAt) +
          "</p>"
        : "") +
      "<h2 id=\"page-title\" tabindex=\"-1\">" +
      escapeHtml(page.title) +
      "</h2>" +
      '<p class="review-status">Status <strong data-vote-label>' +
      statusLabel(review.vote) +
      "</strong></p>" +
      '<div class="review-votes" role="group" aria-label="Set status">' +
      voteButton("yes", "Yes", review.vote === "yes") +
      voteButton("no", "No", review.vote === "no") +
      voteButton("needs", "Needs work", review.vote === "needs") +
      "</div>" +
      '<label class="review-label" for="page-notes">Notes</label>' +
      '<textarea class="review-field" id="page-notes" rows="4" autocomplete="off" placeholder="Add a note for this page">' +
      escapeHtml(review.notes) +
      "</textarea>" +
      '<p class="review-hint">Saved on this phone for this page.</p>' +
      '<div class="review-nav">' +
      '<button type="button" data-nav="prev"' +
      (pos <= 0 ? " disabled" : "") +
      ">Previous</button>" +
      '<button type="button" data-nav="next"' +
      (pos === -1 || pos >= visible.length - 1 ? " disabled" : "") +
      ">Next</button>" +
      "</div>" +
      "</article>"
    );
  }

  function setButtons() {
    return sets
      .map(function (set) {
        var pressed = currentSet && set.id === currentSet.id;
        return (
          '<button type="button" data-set="' +
          escapeHtml(set.id) +
          '" aria-pressed="' +
          (pressed ? "true" : "false") +
          '">' +
          escapeHtml(set.title) +
          "</button>"
        );
      })
      .join("");
  }

  function shellHtml() {
    return (
      '<p class="review-label review-set-label" id="set-label">Set</p>' +
      '<div class="review-sets" role="group" aria-labelledby="set-label">' +
      setButtons() +
      "</div>" +
      '<p class="review-count" data-count></p>' +
      '<div class="review-filters" role="group" aria-label="Filter pages">' +
      '<button type="button" data-filter="all">All <span data-filter-count="all"></span></button>' +
      '<button type="button" data-filter="pending">Not yet <span data-filter-count="pending"></span></button>' +
      '<button type="button" data-filter="yes">Yes <span data-filter-count="yes"></span></button>' +
      '<button type="button" data-filter="no">No <span data-filter-count="no"></span></button>' +
      '<button type="button" data-filter="needs">Needs work <span data-filter-count="needs"></span></button>' +
      "</div>" +
      '<div data-card></div>' +
      '<h2 class="review-subhead">Jump to a page</h2>' +
      '<ul class="review-list" data-list></ul>' +
      '<div class="review-actions">' +
      '<button type="button" class="review-copy" data-copy aria-live="polite">Copy my review</button>' +
      '<a class="review-mail" data-mail aria-describedby="review-mail-hint">Email my review</a>' +
      '<p class="review-hint" id="review-mail-hint">Opens a message to ' +
      escapeHtml(MAIL) +
      ". Nothing is sent until you send it. If the draft is cut short, paste from Copy my review.</p>" +
      '<p class="review-hint" data-memory hidden>This browser is not storing votes on this phone. Copy or email them before you leave.</p>' +
      "</div>" +
      '<div class="review-fallback" data-fallback hidden>' +
      '<label class="review-label" for="review-plain">Review text</label>' +
      '<textarea class="review-field" id="review-plain" readonly></textarea>' +
      "</div>" +
      '<dialog class="review-lightbox" data-lightbox aria-label="Enlarged page">' +
      '<div class="review-lightbox-bar">' +
      '<button type="button" class="review-lightbox-zoom" data-lightbox-zoom>Show all</button>' +
      '<button type="button" class="review-lightbox-close" data-lightbox-close>Close</button>' +
      "</div>" +
      '<p class="review-zoom-hint" data-lightbox-hint>Drag to see the lines. Tap the page to fit the screen.</p>' +
      '<div class="review-lightbox-stage is-zoomed" data-lightbox-stage><img alt="" data-lightbox-img width="927" height="1200"></div>' +
      "</dialog>"
    );
  }

  function paintCount() {
    var count = mount.querySelector("[data-count]");
    if (!count) return;
    if (index < 0 || !pages[index]) {
      count.textContent = "0 of " + pages.length;
      return;
    }
    count.textContent = index + 1 + " of " + pages.length;
  }

  function paintFilters() {
    var counts = {
      all: pages.length,
      pending: countVotes("pending"),
      yes: countVotes("yes"),
      no: countVotes("no"),
      needs: countVotes("needs"),
    };
    Array.prototype.forEach.call(mount.querySelectorAll("[data-filter-count]"), function (node) {
      node.textContent = String(counts[node.getAttribute("data-filter-count")] || 0);
    });
    Array.prototype.forEach.call(mount.querySelectorAll("[data-filter]"), function (button) {
      var selected = button.getAttribute("data-filter") === filter;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function paintSets() {
    Array.prototype.forEach.call(mount.querySelectorAll("[data-set]"), function (button) {
      var selected = currentSet && button.getAttribute("data-set") === currentSet.id;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function paintMail() {
    var mail = mount.querySelector("[data-mail]");
    if (mail) mail.href = mailtoHref();
    var memory = mount.querySelector("[data-memory]");
    if (memory) memory.hidden = !memoryOnly;
  }

  function paintCard() {
    var page = pageAt(index);
    if (!page) return;
    var review = reviewFor(page.id);
    var label = statusLabel(review.vote);
    var badge = mount.querySelector("[data-vote-label]");
    if (badge) badge.textContent = label;
    Array.prototype.forEach.call(mount.querySelectorAll("[data-vote]"), function (button) {
      var vote = button.getAttribute("data-vote");
      button.setAttribute("aria-pressed", vote === review.vote ? "true" : "false");
    });
    var visible = visibleIndexes();
    var pos = visible.indexOf(index);
    var prev = mount.querySelector('[data-nav="prev"]');
    var next = mount.querySelector('[data-nav="next"]');
    if (prev) prev.disabled = pos <= 0;
    if (next) next.disabled = pos === -1 || pos >= visible.length - 1;
  }

  function renderList() {
    var list = mount.querySelector("[data-list]");
    if (!list) return;
    var scroll = list.scrollTop;
    var visible = visibleIndexes();
    if (!visible.length) {
      list.innerHTML = '<li><p class="empty">No pages in this filter.</p></li>';
      return;
    }
    list.innerHTML = visible
      .map(function (pageIndex) {
        var page = pages[pageIndex];
        var current = pageIndex === index ? ' aria-current="true"' : "";
        var badge = page.badge
          ? ' <span class="review-item-badge">' + escapeHtml(page.badge) + "</span>"
          : "";
        return (
          '<li><button type="button" data-jump="' +
          pageIndex +
          '"' +
          current +
          '><span class="review-item-title">' +
          (pageIndex + 1) +
          ". " +
          escapeHtml(page.title) +
          badge +
          '</span><span class="review-item-status" data-status-for="' +
          escapeHtml(page.id) +
          '">' +
          statusLabel(voteOf(page)) +
          "</span></button></li>"
        );
      })
      .join("");
    list.scrollTop = scroll;
  }

  function showNoMatch() {
    var slot = mount.querySelector("[data-card]");
    if (slot) slot.innerHTML = '<p class="empty">No pages in this filter.</p>';
    paintCount();
    paintFilters();
    paintSets();
    paintMail();
    renderList();
    saveIndex();
  }

  function flushNotes() {
    var field = document.getElementById("page-notes");
    var page = pageAt(index);
    if (!field || !page) return;
    var current = reviewFor(page.id);
    if (reviews[page.id] && current.notes === field.value) return;
    writeReview(page.id, {
      vote: current.vote,
      notes: field.value,
      lookingAt: current.lookingAt,
    });
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "0";
      field.style.left = "0";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.focus();
      field.select();
      try {
        var ok = document.execCommand("copy");
        document.body.removeChild(field);
        if (ok) resolve();
        else reject(new Error("copy failed"));
      } catch (error) {
        if (field.parentNode) field.parentNode.removeChild(field);
        reject(error);
      }
    });
  }

  function showCopied(button) {
    var fallback = mount.querySelector("[data-fallback]");
    if (fallback) fallback.hidden = true;
    button.textContent = "Copied";
    button.classList.add("is-copied");
    if (copyTimer) window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () {
      button.textContent = "Copy my review";
      button.classList.remove("is-copied");
      copyTimer = null;
    }, 1600);
  }

  function showFallback(text) {
    var box = mount.querySelector("[data-fallback]");
    var field = document.getElementById("review-plain");
    if (!box || !field) return;
    field.value = text;
    box.hidden = false;
    field.focus();
    field.select();
  }

  function goTo(nextIndex, focusTitle) {
    index = nextIndex;
    if (index < 0 || !pages[index]) {
      showNoMatch();
      return;
    }
    renderCard(focusTitle);
  }

  function step(direction) {
    var visible = visibleIndexes();
    var pos = visible.indexOf(index);
    var nextPos = pos + direction;
    if (nextPos < 0 || nextPos >= visible.length) return;
    flushNotes();
    goTo(visible[nextPos], true);
  }

  function afterVote(page) {
    if (matchesFilter(page)) {
      paintCard();
      paintCount();
      paintFilters();
      paintMail();
      renderList();
      saveIndex();
      return;
    }
    var visible = visibleIndexes();
    var nextIndex = -1;
    var i;
    for (i = 0; i < visible.length; i++) {
      if (visible[i] > index) {
        nextIndex = visible[i];
        break;
      }
    }
    if (nextIndex === -1 && visible.length) nextIndex = visible[visible.length - 1];
    goTo(nextIndex, false);
  }

  function bindCard() {
    var page = pageAt(index);
    var card = mount.querySelector("[data-card]");
    if (!card || !page) return;

    Array.prototype.forEach.call(card.querySelectorAll("[data-vote]"), function (button) {
      button.addEventListener("click", function () {
        flushNotes();
        var current = reviewFor(page.id);
        writeReview(page.id, {
          vote: button.getAttribute("data-vote"),
          notes: current.notes,
          lookingAt: current.lookingAt,
        });
        afterVote(page);
      });
    });

    var alt = card.querySelector("[data-alt]");
    if (alt) {
      alt.addEventListener("click", function () {
        flushNotes();
        var current = reviewFor(page.id);
        var nextFile =
          page.alternate && current.lookingAt === page.image ? page.alternate : page.image;
        writeReview(page.id, {
          vote: current.vote,
          notes: current.notes,
          lookingAt: nextFile,
        });
        renderCard(false);
      });
    }

    var notes = document.getElementById("page-notes");
    if (notes) {
      notes.addEventListener("input", function () {
        var current = reviewFor(page.id);
        writeReview(page.id, {
          vote: current.vote,
          notes: notes.value,
          lookingAt: current.lookingAt,
        });
        paintMail();
      });
    }

    Array.prototype.forEach.call(card.querySelectorAll("[data-nav]"), function (button) {
      button.addEventListener("click", function () {
        if (button.disabled) return;
        step(button.getAttribute("data-nav") === "next" ? 1 : -1);
      });
    });

    var zoom = card.querySelector("[data-zoom]");
    if (zoom) {
      zoom.addEventListener("click", function () {
        var image = zoom.querySelector("img");
        if (!image) return;
        openLightbox(image.getAttribute("src"), image.getAttribute("alt") || page.title);
      });
    }

    var image = card.querySelector("img");
    if (image) {
      image.addEventListener("error", function () {
        var art = image.parentNode;
        while (art && (!art.classList || !art.classList.contains("review-art"))) {
          art = art.parentNode;
        }
        if (!art) return;
        art.className = "review-art";
        art.setAttribute("role", "img");
        art.setAttribute("aria-label", "No artwork for " + page.title);
        art.textContent = "";
        var message = document.createElement("p");
        message.textContent = "No artwork";
        art.appendChild(message);
      });
    }
  }

  function lightboxEls() {
    return {
      dialog: mount.querySelector("[data-lightbox]"),
      stage: mount.querySelector("[data-lightbox-stage]"),
      img: mount.querySelector("[data-lightbox-img]"),
      hint: mount.querySelector("[data-lightbox-hint]"),
      zoom: mount.querySelector("[data-lightbox-zoom]"),
    };
  }

  function setLightboxZoom(zoomed) {
    var els = lightboxEls();
    if (!els.stage) return;
    els.stage.classList.toggle("is-zoomed", zoomed);
    if (els.zoom) els.zoom.textContent = zoomed ? "Show all" : "Zoom in";
    if (els.hint) {
      els.hint.textContent = zoomed
        ? "Drag to see the lines. Tap the page to fit the screen."
        : "Tap the page to zoom in.";
    }
    window.requestAnimationFrame(function () {
      if (!els.stage) return;
      els.stage.scrollLeft = Math.max(0, (els.stage.scrollWidth - els.stage.clientWidth) / 2);
      els.stage.scrollTop = Math.max(0, (els.stage.scrollHeight - els.stage.clientHeight) / 2);
    });
  }

  function openLightbox(src, alt) {
    var els = lightboxEls();
    if (!els.dialog || !els.img || !src) return;
    els.img.alt = alt || "";
    els.img.onload = function () {
      setLightboxZoom(true);
    };
    els.img.src = src;
    setLightboxZoom(true);
    if (typeof els.dialog.showModal === "function") {
      if (!els.dialog.open) els.dialog.showModal();
    } else {
      els.dialog.setAttribute("open", "");
    }
    var closeButton = mount.querySelector("[data-lightbox-close]");
    if (closeButton) closeButton.focus();
  }

  function closeLightbox() {
    var dialog = mount.querySelector("[data-lightbox]");
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    var zoom = mount.querySelector("[data-zoom]");
    if (zoom) zoom.focus();
  }

  function renderCard(focusTitle) {
    var slot = mount.querySelector("[data-card]");
    if (!slot || !pages[index]) return;
    slot.innerHTML = cardHtml(pages[index]);
    bindCard();
    paintCard();
    paintCount();
    paintFilters();
    paintSets();
    paintMail();
    renderList();
    saveIndex();
    if (focusTitle) {
      var title = document.getElementById("page-title");
      if (title) {
        try {
          title.focus({ preventScroll: true });
        } catch (error) {
          title.focus();
        }
      }
      var count = mount.querySelector("[data-count]");
      if (count && count.scrollIntoView) count.scrollIntoView({ block: "start" });
    }
  }

  function buttonFrom(list, node) {
    while (node && node !== list) {
      if (node.tagName === "BUTTON") return node;
      node = node.parentNode;
    }
    return null;
  }

  function useSet(set, focusTitle) {
    closeLightbox();
    currentSet = set;
    pages = set.pages;
    reviews = bucketFor(set.id);
    index = loadIndex();
    filter = loadFilter();
    saveSetId();
    paintSets();
    if (!pages.length) {
      showNoMatch();
      return;
    }
    if (!matchesFilter(pages[index])) {
      var first = visibleIndexes();
      index = first.length ? first[0] : -1;
    }
    if (index < 0) showNoMatch();
    else renderCard(focusTitle);
  }

  function bindShell() {
    var list = mount.querySelector("[data-list]");
    if (list) {
      list.addEventListener("click", function (event) {
        var button = buttonFrom(list, event.target);
        if (!button) return;
        var next = Number(button.getAttribute("data-jump"));
        if (!isFinite(next) || !pages[next]) return;
        if (next === index) {
          var title = document.getElementById("page-title");
          if (title) {
            try {
              title.focus({ preventScroll: true });
            } catch (error) {
              title.focus();
            }
          }
          var count = mount.querySelector("[data-count]");
          if (count && count.scrollIntoView) count.scrollIntoView({ block: "start" });
          return;
        }
        flushNotes();
        goTo(next, true);
      });
    }

    Array.prototype.forEach.call(mount.querySelectorAll("[data-set]"), function (button) {
      button.addEventListener("click", function () {
        var nextId = button.getAttribute("data-set");
        if (!currentSet || nextId === currentSet.id) return;
        var next = findSet(nextId);
        if (!next || next.id !== nextId) return;
        flushNotes();
        useSet(next, false);
      });
    });

    Array.prototype.forEach.call(mount.querySelectorAll("[data-filter]"), function (button) {
      button.addEventListener("click", function () {
        var nextFilter = button.getAttribute("data-filter");
        if (nextFilter === filter) return;
        flushNotes();
        filter = nextFilter;
        saveFilter();
        var visible = visibleIndexes();
        if (visible.indexOf(index) === -1) {
          goTo(visible.length ? visible[0] : -1, false);
          return;
        }
        renderCard(false);
      });
    });

    var copyButton = mount.querySelector("[data-copy]");
    if (copyButton) {
      copyButton.addEventListener("click", function () {
        flushNotes();
        paintMail();
        var text = plainText();
        var write =
          navigator.clipboard && navigator.clipboard.writeText
            ? navigator.clipboard.writeText(text)
            : Promise.reject(new Error("clipboard unavailable"));

        write.then(
          function () {
            showCopied(copyButton);
          },
          function () {
            legacyCopy(text).then(
              function () {
                showCopied(copyButton);
              },
              function () {
                showFallback(text);
              }
            );
          }
        );
      });
    }

    var mail = mount.querySelector("[data-mail]");
    if (mail) {
      mail.addEventListener("click", function () {
        flushNotes();
        paintMail();
      });
    }

    var dialog = mount.querySelector("[data-lightbox]");
    var closeButton = mount.querySelector("[data-lightbox-close]");
    var zoomToggle = mount.querySelector("[data-lightbox-zoom]");
    var lightboxImage = mount.querySelector("[data-lightbox-img]");
    if (closeButton) closeButton.addEventListener("click", closeLightbox);
    if (zoomToggle) {
      zoomToggle.addEventListener("click", function () {
        var stage = mount.querySelector("[data-lightbox-stage]");
        setLightboxZoom(!(stage && stage.classList.contains("is-zoomed")));
      });
    }
    if (lightboxImage) {
      lightboxImage.addEventListener("click", function () {
        var stage = mount.querySelector("[data-lightbox-stage]");
        setLightboxZoom(!(stage && stage.classList.contains("is-zoomed")));
      });
    }
    if (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeLightbox();
      });
      dialog.addEventListener("cancel", function () {
        var zoom = mount.querySelector("[data-zoom]");
        if (zoom) window.setTimeout(function () { zoom.focus(); }, 0);
      });
    }
  }

  if (!sets.length) {
    mount.innerHTML = '<p class="empty">No pages yet</p>';
    return;
  }

  mount.innerHTML = shellHtml();
  bindShell();
  useSet(findSet(loadSetId()), false);
})();
