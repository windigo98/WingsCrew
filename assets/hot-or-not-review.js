// Hot or Not review. One item at a time.
// Shirt votes stay in wingscrew-tshirt-review.
// Book votes stay in wingscrew-coloring-review.
// Anything else stays in wingscrew-hot-or-not-review.
// Copy and the mailto drafts are the only ways out. Nothing is sent on its own.
// Long drafts are split in assets/hot-or-not-export.js. A link over the safe
// limit is not opened.
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
      if (item && knownFile(item, value.lookingAt)) lookingAt = value.lookingAt;
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
        if (!isDecided(set, item)) total += 1;
      });
    });
    return total;
  }

  function visibleIndexes() {
    var list = [];
    if (!currentSet) return list;
    currentSet.items.forEach(function (item, itemIndex) {
      if (showDecided || !isDecided(currentSet, item)) list.push(itemIndex);
    });
    return list;
  }

  function itemAt(itemIndex) {
    return currentSet && currentSet.items[itemIndex] ? currentSet.items[itemIndex] : null;
  }

  function knownFile(item, file) {
    if (!item || typeof file !== "string") return false;
    if (file === item.image) return true;
    if (item.alternate && file === item.alternate) return true;
    var extras = item.extras || [];
    var i;
    for (i = 0; i < extras.length; i++) {
      if (extras[i].image === file) return true;
    }
    return false;
  }

  function extraLabel(item, file) {
    var extras = item && item.extras ? item.extras : [];
    var i;
    for (i = 0; i < extras.length; i++) {
      if (extras[i].image === file) return extras[i].label;
    }
    return "";
  }

  function showingText(item, file) {
    var label = extraLabel(item, file);
    if (label) return label + " (" + file + ")";
    return file;
  }

  function exportApi() {
    return window.WingsHotOrNotExport || null;
  }

  function picksFor(type) {
    var picks = [];
    var api = exportApi();
    setsFor(type).forEach(function (set) {
      set.items.forEach(function (item) {
        var review = reviewFor(set, item);
        if (review.vote !== "yes" && review.vote !== "no" && review.vote !== "needs") return;
        picks.push({
          id: api ? api.pickId(set, item, review) : item.id,
          status: statusLabel(review.vote),
          note: review.notes,
        });
      });
    });
    return picks;
  }

  function reviewText() {
    var api = exportApi();
    if (!api) return "";
    return api.copyText(
      ["shirts", "books", "other"].map(function (type) {
        return { label: sectionName(type), picks: picksFor(type) };
      })
    );
  }

  function messagesFor(scope) {
    var api = exportApi();
    if (!api) return [];
    var types = scope === "all" ? ["shirts", "books", "other"] : [scope];
    var messages = [];
    types.forEach(function (type) {
      var picks = picksFor(type);
      if (!picks.length) return;
      api.buildMessages(sectionName(type), picks).messages.forEach(function (message) {
        message.sectionLabel = sectionName(type);
        messages.push(message);
      });
    });
    return messages;
  }

  function hideWarning() {
    var warn = mount.querySelector("[data-mail-warn]");
    if (!warn) return;
    warn.hidden = true;
    warn.textContent = "";
  }

  function showWarning(length) {
    var warn = mount.querySelector("[data-mail-warn]");
    var parts = mount.querySelector("[data-mail-parts]");
    if (parts) parts.hidden = true;
    if (!warn) return;
    var api = exportApi();
    warn.hidden = false;
    if (warn.scrollIntoView) warn.scrollIntoView({ block: "center" });
    if (!api) {
      warn.textContent = "The email builder did not load. Reload the page, then use Copy my review if it still fails.";
      return;
    }
    if (!length) {
      warn.textContent = "Nothing picked in this set yet. Only Hot, Not, and Needs work are included.";
      return;
    }
    var shown = Number(length).toLocaleString();
    warn.textContent =
      "This email link is " +
      shown +
      " characters. Mail apps cut links longer than " +
      api.SAFE_LIMIT.toLocaleString() +
      ", so it was not opened and nothing was cut off. Use Copy my review, then paste the whole text into a message to " +
      MAIL +
      ".";
  }

  function openMail(href) {
    var api = exportApi();
    var limit = api ? api.SAFE_LIMIT : 1800;
    if (!href || href.length > limit) {
      showWarning(href ? href.length : 0);
      return false;
    }
    window.location.href = href;
    return true;
  }

  function partLabel(message, scope) {
    if (scope === "all") {
      if (message.parts > 1) {
        return "Send " + message.sectionLabel + " part " + message.part + " of " + message.parts;
      }
      return "Send " + message.sectionLabel;
    }
    return "Send part " + message.part + " of " + message.parts;
  }

  function flowIntro(messages) {
    var names = [];
    var total = 0;
    messages.forEach(function (message) {
      if (names.indexOf(message.sectionLabel) === -1) {
        names.push(message.sectionLabel);
        total += message.setTotal;
      }
    });
    var emails = messages.length === 1 ? "1 email" : messages.length + " emails";
    var picks = total === 1 ? "1 pick" : total + " picks";
    return (
      names.join(", ") +
      ": " +
      picks +
      " in " +
      emails +
      ". Tap one at a time so the browser does not block the next draft. Each button is marked after it opens. Nothing is sent until you send it."
    );
  }

  function renderFlow(scope) {
    var box = mount.querySelector("[data-mail-parts]");
    var messages = messagesFor(scope);
    if (!messages.length) {
      if (box) box.hidden = true;
      showWarning(0);
      return;
    }
    var longest = 0;
    var unsafe = false;
    messages.forEach(function (message) {
      if (message.href.length > longest) longest = message.href.length;
      if (!message.safe || message.href.length > (exportApi() ? exportApi().SAFE_LIMIT : 1800)) unsafe = true;
    });
    if (unsafe) {
      showWarning(longest);
      return;
    }
    if (messages.length === 1) {
      if (box) box.hidden = true;
      hideWarning();
      openMail(messages[0].href);
      return;
    }
    hideWarning();
    if (!box) return;
    var intro = document.createElement("p");
    intro.className = "review-hint";
    intro.textContent = flowIntro(messages);
    box.innerHTML = "";
    box.hidden = false;
    box.appendChild(intro);
    messages.forEach(function (message, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "review-mail";
      button.setAttribute("data-send-part", String(index));
      button.setAttribute("data-mail-scope", scope);
      button.textContent = partLabel(message, scope);
      box.appendChild(button);
    });
    var first = box.querySelector("button");
    if (first) first.focus();
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

  function versionButtons(item, lookingAt) {
    var extras = item.extras || [];
    if (!extras.length) {
      if (!item.alternate) return "";
      return (
        '<button type="button" class="review-alt" data-alt aria-pressed="' +
        (lookingAt === item.alternate ? "true" : "false") +
        '">Other version</button>' +
        '<p class="review-version">Showing ' +
        escapeHtml(lookingAt) +
        "</p>"
      );
    }
    var buttons = "";
    if (item.alternate) {
      buttons +=
        '<button type="button" class="review-alt" data-version="' +
        escapeHtml(item.alternate) +
        '" aria-pressed="' +
        (lookingAt === item.alternate ? "true" : "false") +
        '">Other version</button>';
    }
    extras.forEach(function (extra) {
      buttons +=
        '<button type="button" class="review-alt" data-version="' +
        escapeHtml(extra.image) +
        '" aria-pressed="' +
        (lookingAt === extra.image ? "true" : "false") +
        '">' +
        escapeHtml(extra.label) +
        "</button>";
    });
    return (
      '<div class="review-versions" role="group" aria-label="Choose a version">' +
      buttons +
      "</div>" +
      '<p class="review-version">Showing ' +
      escapeHtml(showingText(item, lookingAt)) +
      "</p>"
    );
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
    var zoomHint = currentSet.type === "books" ? "Tap the page to enlarge" : "Tap the picture to enlarge";
    var poseLabel = extraLabel(item, review.lookingAt);
    var altText = poseLabel ? item.title + ", " + poseLabel : item.title;
    var art = src
      ? '<div class="review-art has-image">' +
        (item.badge ? '<p class="review-new">' + escapeHtml(item.badge) + "</p>" : "") +
        '<button type="button" class="review-zoom" data-zoom><img src="' +
        escapeHtml(src) +
        '" alt="' +
        escapeHtml(altText) +
        '" loading="lazy" decoding="async"></button></div>'
      : '<div class="review-art" role="img" aria-label="' +
        escapeHtml("No artwork for " + item.title) +
        '"><p>No artwork</p></div>';

    return (
      '<article class="panel review-card">' +
      art +
      (src ? '<p class="review-zoom-hint">' + zoomHint + "</p>" : "") +
      versionButtons(item, review.lookingAt) +
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
      '<button type="button" class="review-mail" data-mail="shirts" aria-describedby="review-mail-hint">Email Shirts (0)</button>' +
      '<button type="button" class="review-mail" data-mail="books" aria-describedby="review-mail-hint">Email Books (0)</button>' +
      '<button type="button" class="review-mail" data-mail="other" aria-describedby="review-mail-hint">Email Other (0)</button>' +
      '<button type="button" class="review-mail" data-mail="all" aria-describedby="review-mail-hint">Email all (0)</button>' +
      '<p class="review-hint" id="review-mail-hint">Opens a draft to ' +
      escapeHtml(MAIL) +
      ". Nothing is sent until you send it. A long set is split into parts you tap one at a time. If a link would be cut off, it stays closed. Use Copy my review instead.</p>" +
      '<p class="review-warn" data-mail-warn hidden role="alert"></p>' +
      '<div class="review-parts" data-mail-parts hidden></div>' +
      '<p class="review-hint" data-memory hidden>This browser is not storing picks on this phone. Copy or email them before you leave.</p>' +
      "</div>" +
      '<div class="review-fallback" data-fallback hidden>' +
      '<label class="review-label" for="review-plain">Review text</label>' +
      '<textarea class="review-field" id="review-plain" readonly></textarea>' +
      "</div>" +
      '<div class="review-received">' +
      '<h2 class="review-subhead">Shorten a received review</h2>' +
      '<p class="review-hint">Paste the emails here. Hot picks are counted and left off the list. Not and Needs work stay, with their notes. A missing part is named, so a short list is never the whole review by accident.</p>' +
      '<label class="review-label" for="review-received">Pasted emails</label>' +
      '<textarea class="review-field" id="review-received" rows="5" placeholder="Paste one or more Hot or Not emails"></textarea>' +
      '<button type="button" class="review-mail" data-shorten>Shorten this list</button>' +
      '<p class="review-warn" data-shorten-warn hidden role="alert"></p>' +
      '<label class="review-label" for="review-short" data-short-label hidden>Short list</label>' +
      '<textarea class="review-field" id="review-short" readonly hidden></textarea>' +
      '<button type="button" class="review-mail" data-shorten-copy hidden>Copy the short list</button>' +
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
    return (
      adult +
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
    var counts = {
      shirts: picksFor("shirts").length,
      books: picksFor("books").length,
      other: picksFor("other").length,
    };
    counts.all = counts.shirts + counts.books + counts.other;
    ["shirts", "books", "other", "all"].forEach(function (scope) {
      var button = mount.querySelector('[data-mail="' + scope + '"]');
      if (!button) return;
      var name = scope === "all" ? "Email all" : "Email " + sectionName(scope);
      button.textContent = name + " (" + counts[scope] + ")";
      button.disabled = counts[scope] === 0;
    });
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

    Array.prototype.forEach.call(card.querySelectorAll("[data-version]"), function (button) {
      button.addEventListener("click", function () {
        flushNotes();
        var current = reviewFor(currentSet, item);
        var target = button.getAttribute("data-version") || "";
        if (!knownFile(item, target) || target === item.image) return;
        var nextFile = current.lookingAt === target ? item.image : target;
        writeReview(currentSet, item, {
          vote: current.vote,
          notes: current.notes,
          lookingAt: nextFile,
        });
        renderCard(false);
      });
    });

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
        var text = reviewText();
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

    var actions = mount.querySelector(".review-actions");
    if (actions) {
      actions.addEventListener("click", function (event) {
        var node = event.target;
        while (node && node !== actions) {
          if (node.getAttribute && node.getAttribute("data-mail")) {
            flushNotes();
            paintMail();
            if (node.disabled) return;
            renderFlow(node.getAttribute("data-mail"));
            return;
          }
          if (node.hasAttribute && node.hasAttribute("data-send-part")) {
            var scope = node.getAttribute("data-mail-scope");
            var index = Number(node.getAttribute("data-send-part"));
            flushNotes();
            paintMail();
            var messages = messagesFor(scope);
            var message = messages[index];
            if (!message) {
              renderFlow(scope);
              return;
            }
            var limit = exportApi() ? exportApi().SAFE_LIMIT : 1800;
            if (!message.safe || message.href.length > limit) {
              showWarning(message.href.length);
              return;
            }
            if (!openMail(message.href)) return;
            node.classList.add("is-opened");
            node.setAttribute("aria-pressed", "true");
            var opened = partLabel(message, scope).replace(/^Send /, "");
            opened = opened.charAt(0).toUpperCase() + opened.slice(1);
            node.textContent = opened + " opened";
            return;
          }
          node = node.parentNode;
        }
      });
    }

    var shorten = mount.querySelector("[data-shorten]");
    if (shorten) {
      shorten.addEventListener("click", function () {
        var api = exportApi();
        var field = document.getElementById("review-received");
        var out = document.getElementById("review-short");
        var shortLabel = mount.querySelector("[data-short-label]");
        var warn = mount.querySelector("[data-shorten-warn]");
        var copyShortButton = mount.querySelector("[data-shorten-copy]");
        if (!api || !field || !out) return;
        var result = api.shortenReceived(field.value);
        out.value = result.text;
        out.rows = Math.min(Math.max(result.text.split("\n").length, 3), 18);
        out.hidden = !result.text;
        if (shortLabel) shortLabel.hidden = !result.text;
        if (copyShortButton) copyShortButton.hidden = !result.text;
        if (warn) {
          warn.hidden = result.ok;
          warn.textContent = result.ok ? "" : result.problems.join(" ");
        }
        var focusNode = !result.ok && warn ? warn : out;
        if (focusNode && focusNode.scrollIntoView) focusNode.scrollIntoView({ block: "nearest" });
      });
    }

    var copyShort = mount.querySelector("[data-shorten-copy]");
    if (copyShort) {
      copyShort.addEventListener("click", function () {
        var out = document.getElementById("review-short");
        var text = out ? out.value : "";
        if (!text) return;
        var write =
          navigator.clipboard && navigator.clipboard.writeText
            ? navigator.clipboard.writeText(text)
            : Promise.reject(new Error("clipboard unavailable"));
        write.then(
          function () {
            copyShort.textContent = "Copied";
            window.setTimeout(function () {
              copyShort.textContent = "Copy the short list";
            }, 1600);
          },
          function () {
            if (out) {
              out.hidden = false;
              out.focus();
              out.select();
            }
          }
        );
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
