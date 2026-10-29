// Hot or Not review. One item at a time.
// Shirt votes stay in wingscrew-tshirt-review.
// Book votes stay in wingscrew-coloring-review.
// Anything else stays in wingscrew-hot-or-not-review.
// Copy and the mailto link are the only ways out. Nothing is sent on its own.
(function () {
  var SHIRT_KEY = "wingscrew-tshirt-review";
  var BOOK_KEY = "wingscrew-coloring-review";
  var OTHER_KEY = "wingscrew-hot-or-not-review";
  var SECTION_KEY = "wingscrew-hot-or-not-section";
  var DECIDED_KEY = "wingscrew-hot-or-not-show-decided";
  var MAIL = "dovewingsbusiness@gmail.com";
  var SECTIONS = ["shirts", "books", "other"];
  var mount = document.querySelector("[data-hot-or-not]");
  if (!mount) return;

  var memoryOnly = false;
  var copyTimer = null;
  var queue = Array.isArray(window.WINGS_REVIEW_QUEUE) ? window.WINGS_REVIEW_QUEUE : [];
  var shirtStore = loadJson(SHIRT_KEY);
  var bookStore = loadJson(BOOK_KEY);
  var otherStore = loadJson(OTHER_KEY);
  var section = "shirts";
  var currentSet = null;
  var index = 0;
  var showDecided = false;
  var showInStore = false;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadJson(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return parsed;
    } catch (error) {
      memoryOnly = true;
      return {};
    }
  }

  function persist(key, store) {
    try {
      localStorage.setItem(key, JSON.stringify(store));
    } catch (error) {
      memoryOnly = true;
    }
  }

  function setsFor(type) {
    return queue.filter(function (set) {
      return set && set.type === type && Array.isArray(set.items) && set.items.length;
    });
  }

  function sectionName(type) {
    if (type === "books") return "Books";
    if (type === "other") return "Other";
    return "Shirts";
  }

  function storeFor(set) {
    if (set.type === "shirts") return shirtStore;
    if (set.type === "books") return bookStore;
    return otherStore;
  }

  function keyFor(set) {
    if (set.type === "shirts") return SHIRT_KEY;
    if (set.type === "books") return BOOK_KEY;
    return OTHER_KEY;
  }

  function normalize(value, item) {
    var vote = "pending";
    var notes = "";
    var lookingAt = item ? item.image : "";
    if (value && typeof value === "object") {
      if (value.vote === "yes" || value.vote === "no" || value.vote === "needs" || value.vote === "pending") {
        vote = value.vote;
      }
      if (typeof value.notes === "string") notes = value.notes;
      if (
        item &&
        typeof value.lookingAt === "string" &&
        (value.lookingAt === item.image || (item.alternate && value.lookingAt === item.alternate))
      ) {
        lookingAt = value.lookingAt;
      }
    }
    return { vote: vote, notes: notes, lookingAt: lookingAt };
  }

  function rawReview(set, item) {
    if (!set || !item) return null;
    if (set.type === "shirts") return shirtStore[item.id];
    var box = storeFor(set)[set.id];
    if (!box || typeof box !== "object" || Array.isArray(box)) return null;
    return box[item.id];
  }

  function reviewFor(set, item) {
    return normalize(rawReview(set, item), item);
  }

  function writeReview(set, item, next) {
    if (set.type === "shirts") {
      shirtStore[item.id] = { vote: next.vote, notes: next.notes };
      persist(SHIRT_KEY, shirtStore);
      return;
    }
    var store = storeFor(set);
    if (!store[set.id] || typeof store[set.id] !== "object" || Array.isArray(store[set.id])) {
      store[set.id] = {};
    }
    store[set.id][item.id] = {
      vote: next.vote,
      notes: next.notes,
      lookingAt: next.lookingAt,
    };
    persist(keyFor(set), store);
  }

  function statusLabel(vote) {
    if (vote === "yes") return "Hot";
    if (vote === "no") return "Not";
    if (vote === "needs") return "Needs work";
    return "Not yet";
  }

  function voteOf(set, item) {
    var vote = reviewFor(set, item).vote;
    if (vote === "yes" || vote === "no" || vote === "needs") return vote;
    return "pending";
  }

  function isDecided(set, item) {
    return voteOf(set, item) !== "pending";
  }

  function pendingIn(type) {
    var total = 0;
    setsFor(type).forEach(function (set) {
      set.items.forEach(function (item) {
        if (item.inStore) return;
        if (!isDecided(set, item)) total += 1;
      });
    });
    return total;
  }

  function inStoreCount() {
    var total = 0;
    setsFor("shirts").forEach(function (set) {
      set.items.forEach(function (item) {
        if (item.inStore) total += 1;
      });
    });
    return total;
  }

  function visibleIndexes() {
    var list = [];
    if (!currentSet) return list;
    var shirts = currentSet.type === "shirts";
    currentSet.items.forEach(function (item, itemIndex) {
      if (shirts && showInStore && !item.inStore) return;
      if (shirts && !showInStore && item.inStore) return;
      if (showDecided || !isDecided(currentSet, item)) list.push(itemIndex);
    });
    return list;
  }

  function itemAt(itemIndex) {
    return currentSet && currentSet.items[itemIndex] ? currentSet.items[itemIndex] : null;
  }

  function fileList(item) {
    if (item.alternate) return item.image + ", " + item.alternate;
    return item.image;
  }

  function plainText() {
    var lines = ["Hot or Not review", ""];
    ["shirts", "books", "other"].forEach(function (type) {
      var sets = setsFor(type);
      lines.push(sectionName(type));
      if (!sets.length) {
        lines.push("Nothing waiting here right now.");
        lines.push("");
        return;
      }
      sets.forEach(function (set) {
        lines.push("Set: " + set.title);
        set.items.forEach(function (item) {
          var review = reviewFor(set, item);
          lines.push("");
          lines.push(item.title);
          lines.push("Id: " + item.id);
          if (item.alternate) {
            lines.push("Files: " + fileList(item));
            lines.push("Looking at: " + review.lookingAt);
          }
          if (item.badge) lines.push("Badge: " + item.badge);
          if (item.notNeeded) lines.push("Not needed: yes");
          else if (item.inStore) lines.push("In store: yes");
          if (item.flag) lines.push("Flag: " + item.flag);
          if (item.hasBack) lines.push("Has a back: yes");
          lines.push("Status: " + statusLabel(review.vote));
          lines.push("Notes:");
          lines.push(review.notes.trim() || "(none)");
        });
        lines.push("");
      });
    });
    return lines.join("\n").replace(/\n+$/, "\n");
  }

  function mailtoHref() {
    return (
      "mailto:" +
      MAIL +
      "?subject=" +
      encodeURIComponent("Hot or Not review") +
      "&body=" +
      encodeURIComponent(plainText())
    );
  }

  function imageSrc(set, item, file) {
    if (!set || !file || !/^[A-Za-z0-9][A-Za-z0-9._-]*\.webp$/.test(file)) return "";
    var base = typeof set.imageBase === "string" ? set.imageBase : "";
    if (base && (base.indexOf("..") > 0 || /[\\]/.test(base) || base.indexOf("//") !== -1)) return "";
    var src = base + file;
    var version = item && item.version ? item.version : "";
    if (version && /^[1-9][0-9]{0,3}$/.test(version)) src += "?v=" + version;
    return src;
  }

  function readSession(key) {
    try {
      return sessionStorage.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function writeSession(key, value) {
    try {
      if (value) sessionStorage.setItem(key, value);
      else sessionStorage.removeItem(key);
    } catch (error) {
      /* this visit still keeps the place */
    }
  }

  function indexKey(set) {
    if (set.type === "shirts") return "wingscrew-tshirt-review-index";
    if (set.type === "books") return "wingscrew-coloring-review-index:" + set.id;
    return "wingscrew-hot-or-not-index:" + set.id;
  }

  function loadShowDecided() {
    return readSession(DECIDED_KEY) === "1";
  }

  function loadSection() {
    var hash = (location.hash || "").replace(/^#/, "");
    if (SECTIONS.indexOf(hash) !== -1) return hash;
    var stored = readSession(SECTION_KEY);
    if (SECTIONS.indexOf(stored) !== -1) return stored;
    return "shirts";
  }

  function loadSetId(type) {
    var stored = readSession("wingscrew-hot-or-not-set:" + type);
    if (stored) return stored;
    if (type === "books") return readSession("wingscrew-coloring-review-set");
    return "";
  }

  function findSet(type, setId) {
    var sets = setsFor(type);
    var i;
    for (i = 0; i < sets.length; i++) {
      if (sets[i].id === setId) return sets[i];
    }
    return sets[0] || null;
  }

  function loadIndex(set) {
    var stored = readSession(indexKey(set));
    if (!stored) return 0;
    var i;
    for (i = 0; i < set.items.length; i++) {
      if (set.items[i].id === stored) return i;
    }
    return 0;
  }

  function savePlace() {
    writeSession(SECTION_KEY, section);
    writeSession(DECIDED_KEY, showDecided ? "1" : "0");
    if (history.replaceState) history.replaceState(null, "", "#" + section);
    if (!currentSet) return;
    writeSession("wingscrew-hot-or-not-set:" + section, currentSet.id);
    if (currentSet.type === "books") writeSession("wingscrew-coloring-review-set", currentSet.id);
    var item = itemAt(index);
    writeSession(indexKey(currentSet), item ? item.id : "");
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

  function cardHtml(item) {
    var review = reviewFor(currentSet, item);
    var src = imageSrc(currentSet, item, review.lookingAt);
    var visible = visibleIndexes();
    var pos = visible.indexOf(index);
    var showingAlt = item.alternate && review.lookingAt === item.alternate;
    var zoomHint = currentSet.type === "books" ? "Tap the page to enlarge" : "Tap the picture to enlarge";
    var art = src
      ? '<div class="review-art has-image">' +
        (item.badge ? '<p class="review-new">' + escapeHtml(item.badge) + "</p>" : "") +
        '<button type="button" class="review-zoom" data-zoom><img src="' +
        escapeHtml(src) +
        '" alt="' +
        escapeHtml(item.title) +
        '" loading="lazy" decoding="async"></button></div>'
      : '<div class="review-art" role="img" aria-label="' +
        escapeHtml("No artwork for " + item.title) +
        '"><p>No artwork</p></div>';

    return (
      '<article class="panel review-card">' +
      art +
      (src ? '<p class="review-zoom-hint">' + zoomHint + "</p>" : "") +
      (item.alternate
        ? '<button type="button" class="review-alt" data-alt aria-pressed="' +
          (showingAlt ? "true" : "false") +
          '">Other version</button>' +
          '<p class="review-version">Showing ' +
          escapeHtml(review.lookingAt) +
          "</p>"
        : "") +
      (item.notNeeded
        ? '<p class="review-flag">Not needed</p>'
        : item.inStore
          ? '<p class="review-flag">In the store</p>'
          : "") +
      (item.flag ? '<p class="review-flag">' + escapeHtml(item.flag) + "</p>" : "") +
      '<h2 id="item-title" tabindex="-1">' +
      escapeHtml(item.title) +
      "</h2>" +
      (item.hasBack ? '<p class="review-has-back">Has a back</p>' : "") +
      (item.description ? '<p class="blurb">' + escapeHtml(item.description) + "</p>" : "") +
      '<p class="review-status">Status <strong data-vote-label>' +
      statusLabel(review.vote) +
      "</strong></p>" +
      '<div class="review-votes" role="group" aria-label="Set status">' +
      voteButton("hot", "Hot", review.vote === "yes") +
      voteButton("not", "Not", review.vote === "no") +
      voteButton("needs", "Needs work", review.vote === "needs") +
      "</div>" +
      '<label class="review-label" for="item-notes">Notes</label>' +
      '<textarea class="review-field" id="item-notes" rows="4" autocomplete="off" placeholder="Add a note for this one">' +
      escapeHtml(review.notes) +
      "</textarea>" +
      '<p class="review-hint">Saved on this phone.</p>' +
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
    return setsFor(section)
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
      '<div class="review-sections" role="tablist" aria-label="What to review">' +
      '<button type="button" role="tab" id="shirts" data-section="shirts" aria-selected="false" aria-controls="review-panel">Shirts <span class="review-section-count" data-section-count="shirts"></span></button>' +
      '<button type="button" role="tab" id="books" data-section="books" aria-selected="false" aria-controls="review-panel">Books <span class="review-section-count" data-section-count="books"></span></button>' +
      '<button type="button" role="tab" id="other" data-section="other" aria-selected="false" aria-controls="review-panel">Other <span class="review-section-count" data-section-count="other"></span></button>' +
      "</div>" +
      '<button type="button" class="review-decided" data-decided aria-pressed="false">Show decided</button>' +
      '<div id="review-panel" role="tabpanel" data-panel></div>' +
      '<div class="review-actions">' +
      '<button type="button" class="review-copy" data-copy aria-live="polite">Copy my review</button>' +
      '<a class="review-mail" data-mail aria-describedby="review-mail-hint">Email my review</a>' +
      '<p class="review-hint" id="review-mail-hint">Opens a message to ' +
      escapeHtml(MAIL) +
      ". Nothing is sent until you send it. If the draft is cut short, paste from Copy my review.</p>" +
      '<p class="review-hint" data-memory hidden>This browser is not storing picks on this phone. Copy or email them before you leave.</p>' +
      "</div>" +
      '<div class="review-fallback" data-fallback hidden>' +
      '<label class="review-label" for="review-plain">Review text</label>' +
      '<textarea class="review-field" id="review-plain" readonly></textarea>' +
      "</div>" +
      '<dialog class="review-lightbox" data-lightbox aria-label="Enlarged item">' +
      '<div class="review-lightbox-bar">' +
      '<button type="button" class="review-lightbox-zoom" data-lightbox-zoom>Show all</button>' +
      '<button type="button" class="review-lightbox-close" data-lightbox-close>Close</button>' +
      "</div>" +
      '<div class="review-lightbox-stage is-zoomed" data-lightbox-stage><img alt="" data-lightbox-img></div>' +
      "</dialog>"
    );
  }

  function panelHtml() {
    var sets = setsFor(section);
    if (!sets.length) {
      return '<p class="empty review-empty">Nothing waiting here right now.</p>';
    }
    var picker =
      sets.length > 1
        ? '<p class="review-label review-set-label" id="set-label">Set</p>' +
          '<div class="review-sets" role="group" aria-labelledby="set-label">' +
          setButtons() +
          "</div>"
        : "";
    var adult = section === "shirts" ? '<p class="badge review-adult">Adult</p>' : "";
    var inStore =
      section === "shirts" && inStoreCount()
        ? '<button type="button" class="review-instore" data-instore aria-pressed="' +
          (showInStore ? "true" : "false") +
          '">In store (' +
          inStoreCount() +
          ")</button>"
        : "";
    return (
      adult +
      inStore +
      picker +
      '<p class="review-count" data-count></p>' +
      '<div data-card></div>' +
      '<h2 class="review-subhead">Jump to one</h2>' +
      '<ul class="review-list" data-list></ul>'
    );
  }

  function paintSections() {
    SECTIONS.forEach(function (type) {
      var count = mount.querySelector('[data-section-count="' + type + '"]');
      var waiting = pendingIn(type);
      if (count) count.textContent = waiting + " left";
      var tab = mount.querySelector('[data-section="' + type + '"]');
      if (!tab) return;
      var selected = type === section;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      if (selected) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    });
    var decided = mount.querySelector("[data-decided]");
    if (decided) decided.setAttribute("aria-pressed", showDecided ? "true" : "false");
    var inStoreButton = mount.querySelector("[data-instore]");
    if (inStoreButton) inStoreButton.setAttribute("aria-pressed", showInStore ? "true" : "false");
    var panel = mount.querySelector("[data-panel]");
    if (panel) panel.setAttribute("aria-labelledby", section);
  }

  function paintCount() {
    var count = mount.querySelector("[data-count]");
    if (!count || !currentSet) return;
    var visible = visibleIndexes();
    var pos = visible.indexOf(index);
    if (pos === -1) count.textContent = "0 of " + visible.length;
    else count.textContent = pos + 1 + " of " + visible.length;
  }

  function paintMail() {
    var mail = mount.querySelector("[data-mail]");
    if (mail) mail.href = mailtoHref();
    var memory = mount.querySelector("[data-memory]");
    if (memory) memory.hidden = !memoryOnly;
  }

  function renderList() {
    var list = mount.querySelector("[data-list]");
    if (!list || !currentSet) return;
    var scroll = list.scrollTop;
    var visible = visibleIndexes();
    if (!visible.length) {
      list.innerHTML = '<li><p class="empty">Nothing in this list.</p></li>';
      return;
    }
    list.innerHTML = visible
      .map(function (itemIndex) {
        var item = currentSet.items[itemIndex];
        var current = itemIndex === index ? ' aria-current="true"' : "";
        var badge = item.badge
          ? ' <span class="review-item-badge">' + escapeHtml(item.badge) + "</span>"
          : "";
        return (
          '<li><button type="button" data-jump="' +
          itemIndex +
          '"' +
          current +
          '><span class="review-item-title">' +
          (itemIndex + 1) +
          ". " +
          escapeHtml(item.title) +
          badge +
          '</span><span class="review-item-status">' +
          statusLabel(voteOf(currentSet, item)) +
          "</span></button></li>"
        );
      })
      .join("");
    list.scrollTop = scroll;
  }

  function showEmptyFilter() {
    var slot = mount.querySelector("[data-card]");
    if (slot) {
      slot.innerHTML =
        '<p class="empty">Nothing left to decide here. Turn on Show decided to see your picks.</p>';
    }
    paintCount();
    paintSections();
    paintMail();
    renderList();
    savePlace();
  }

  function flushNotes() {
    var field = document.getElementById("item-notes");
    var item = itemAt(index);
    if (!field || !item || !currentSet) return;
    var current = reviewFor(currentSet, item);
    if (!rawReview(currentSet, item) && !field.value) return;
    if (rawReview(currentSet, item) && current.notes === field.value) return;
    writeReview(currentSet, item, {
      vote: current.vote,
      notes: field.value,
      lookingAt: current.lookingAt,
    });
  }

  function voteValue(name) {
    if (name === "hot") return "yes";
    if (name === "not") return "no";
    if (name === "needs") return "needs";
    return "pending";
  }

  function goTo(nextIndex, focusTitle) {
    index = nextIndex;
    if (!itemAt(index)) {
      showEmptyFilter();
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

  function afterVote(item) {
    if (showDecided || !isDecided(currentSet, item)) {
      renderCard(false);
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
    if (nextIndex === -1 && visible.length) nextIndex = visible[0];
    goTo(nextIndex, false);
  }

  function bindCard() {
    var item = itemAt(index);
    var card = mount.querySelector("[data-card]");
    if (!card || !item) return;

    Array.prototype.forEach.call(card.querySelectorAll("[data-vote]"), function (button) {
      button.addEventListener("click", function () {
        flushNotes();
        var current = reviewFor(currentSet, item);
        var nextVote = voteValue(button.getAttribute("data-vote"));
        if (current.vote === nextVote) nextVote = "pending";
        writeReview(currentSet, item, {
          vote: nextVote,
          notes: current.notes,
          lookingAt: current.lookingAt,
        });
        afterVote(item);
      });
    });

    var alt = card.querySelector("[data-alt]");
    if (alt) {
      alt.addEventListener("click", function () {
        flushNotes();
        var current = reviewFor(currentSet, item);
        var nextFile =
          item.alternate && current.lookingAt === item.image ? item.alternate : item.image;
        writeReview(currentSet, item, {
          vote: current.vote,
          notes: current.notes,
          lookingAt: nextFile,
        });
        renderCard(false);
      });
    }

    var notes = document.getElementById("item-notes");
    if (notes) {
      notes.addEventListener("input", function () {
        var current = reviewFor(currentSet, item);
        writeReview(currentSet, item, {
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
        openLightbox(image.getAttribute("src"), image.getAttribute("alt") || item.title);
      });
    }
  }

  function openLightbox(src, alt) {
    var dialog = mount.querySelector("[data-lightbox]");
    var image = mount.querySelector("[data-lightbox-img]");
    if (!dialog || !image || !src) return;
    image.alt = alt || "";
    image.src = src;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    var closeButton = mount.querySelector("[data-lightbox-close]");
    if (closeButton) closeButton.focus();
  }

  function closeLightbox() {
    var dialog = mount.querySelector("[data-lightbox]");
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  }

  function renderCard(focusTitle) {
    var slot = mount.querySelector("[data-card]");
    if (!slot || !itemAt(index)) return;
    slot.innerHTML = cardHtml(itemAt(index));
    bindCard();
    paintCount();
    paintSections();
    paintMail();
    renderList();
    savePlace();
    if (focusTitle) {
      var title = document.getElementById("item-title");
      if (title) {
        try {
          title.focus({ preventScroll: true });
        } catch (error) {
          title.focus();
        }
      }
      var art = mount.querySelector(".review-art");
      if (art && art.scrollIntoView) art.scrollIntoView({ block: "nearest" });
    }
  }

  function bindPanel() {
    var list = mount.querySelector("[data-list]");
    if (list) {
      list.addEventListener("click", function (event) {
        var node = event.target;
        while (node && node !== list && node.tagName !== "BUTTON") node = node.parentNode;
        if (!node || node === list) return;
        var next = Number(node.getAttribute("data-jump"));
        if (!isFinite(next) || !itemAt(next) || next === index) return;
        flushNotes();
        goTo(next, true);
      });
    }

    var inStoreButton = mount.querySelector("[data-instore]");
    if (inStoreButton) {
      inStoreButton.addEventListener("click", function () {
        flushNotes();
        showInStore = !showInStore;
        var visible = visibleIndexes();
        if (visible.indexOf(index) === -1) index = visible.length ? visible[0] : -1;
        if (index < 0) showEmptyFilter();
        else renderCard(false);
      });
    }

    Array.prototype.forEach.call(mount.querySelectorAll("[data-set]"), function (button) {
      button.addEventListener("click", function () {
        var nextId = button.getAttribute("data-set");
        if (!currentSet || nextId === currentSet.id) return;
        var next = findSet(section, nextId);
        if (!next || next.id !== nextId) return;
        flushNotes();
        useSet(next, false);
      });
    });
  }

  function useSet(set, focusTitle) {
    closeLightbox();
    currentSet = set;
    index = set ? loadIndex(set) : -1;
    var panel = mount.querySelector("[data-panel]");
    if (panel) panel.innerHTML = panelHtml();
    bindPanel();
    paintSections();
    paintMail();
    if (!set) {
      savePlace();
      return;
    }
    var visible = visibleIndexes();
    if (visible.indexOf(index) === -1) index = visible.length ? visible[0] : -1;
    if (index < 0) showEmptyFilter();
    else renderCard(focusTitle);
  }

  function useSection(type, focusTitle) {
    if (SECTIONS.indexOf(type) === -1) type = "shirts";
    if (type !== "shirts") showInStore = false;
    section = type;
    useSet(findSet(type, loadSetId(type)), focusTitle);
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

  function bindShell() {
    Array.prototype.forEach.call(mount.querySelectorAll("[data-section]"), function (button) {
      button.addEventListener("click", function () {
        var next = button.getAttribute("data-section");
        if (next === section) return;
        flushNotes();
        useSection(next, false);
      });
    });

    var decided = mount.querySelector("[data-decided]");
    if (decided) {
      decided.addEventListener("click", function () {
        flushNotes();
        showDecided = !showDecided;
        var visible = visibleIndexes();
        if (visible.indexOf(index) === -1) index = visible.length ? visible[0] : -1;
        if (!currentSet) {
          paintSections();
          savePlace();
          return;
        }
        if (index < 0) showEmptyFilter();
        else renderCard(false);
      });
    }

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

    var closeButton = mount.querySelector("[data-lightbox-close]");
    var zoomToggle = mount.querySelector("[data-lightbox-zoom]");
    var stage = mount.querySelector("[data-lightbox-stage]");
    if (closeButton) closeButton.addEventListener("click", closeLightbox);
    if (zoomToggle && stage) {
      zoomToggle.addEventListener("click", function () {
        var zoomed = stage.classList.toggle("is-zoomed");
        zoomToggle.textContent = zoomed ? "Show all" : "Zoom in";
      });
    }
  }

  mount.innerHTML = shellHtml();
  bindShell();
  showDecided = loadShowDecided();
  useSection(loadSection(), false);
})();
