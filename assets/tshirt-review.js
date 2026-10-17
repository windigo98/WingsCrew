// Crew Lab t-shirt review. Votes and notes stay in localStorage.
// Copy and the mailto link are the only ways out. Nothing is sent on its own.
// Images are local files in crew-lab/tshirts/. External image URLs are ignored.
(function () {
  var STORAGE_KEY = "wingscrew-tshirt-review";
  var INDEX_KEY = "wingscrew-tshirt-review-index";
  var FILTER_KEY = "wingscrew-tshirt-review-filter";
  var MAIL = "dovewingsbusiness@gmail.com";
  var mount = document.querySelector("[data-tshirt-review]");
  if (!mount) return;

  var memoryOnly = false;
  var copyTimer = null;
  var designs = loadDesigns();
  var reviews = loadReviews();
  var index = 0;
  var filter = "all";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadDesigns() {
    var source = Array.isArray(window.WINGS_TSHIRTS) ? window.WINGS_TSHIRTS : [];
    var seen = {};
    var list = [];

    source.forEach(function (entry) {
      if (!entry || typeof entry.id !== "string" || typeof entry.title !== "string") return;
      var id = entry.id.trim();
      var title = entry.title.replace(/\s+/g, " ").trim();
      if (!id || !title || seen[id]) return;
      seen[id] = true;
      list.push({
        id: id,
        title: title,
        image: typeof entry.image === "string" ? entry.image.trim() : "",
        description:
          typeof entry.description === "string"
            ? entry.description.replace(/\s+/g, " ").trim()
            : "",
        hasBack: entry.hasBack === true,
        flag: typeof entry.flag === "string" ? entry.flag.replace(/\s+/g, " ").trim() : "",
      });
    });

    return list;
  }

  function loadReviews() {
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

  function loadIndex() {
    try {
      var stored = sessionStorage.getItem(INDEX_KEY);
      if (!stored) return 0;
      var i;
      for (i = 0; i < designs.length; i++) {
        if (designs[i].id === stored) return i;
      }
      var asNumber = Number(stored);
      if (isFinite(asNumber) && asNumber >= 0 && asNumber < designs.length) return asNumber;
    } catch (error) {
      return 0;
    }
    return 0;
  }

  function loadFilter() {
    try {
      var stored = sessionStorage.getItem(FILTER_KEY);
      if (stored === "all" || stored === "pending" || stored === "yes" || stored === "no") {
        return stored;
      }
    } catch (error) {
      return "all";
    }
    return "all";
  }

  function saveIndex() {
    try {
      if (index < 0 || !designs[index]) sessionStorage.removeItem(INDEX_KEY);
      else sessionStorage.setItem(INDEX_KEY, designs[index].id);
    } catch (error) {
      /* the vote still stays in memory for this visit */
    }
  }

  function saveFilter() {
    try {
      sessionStorage.setItem(FILTER_KEY, filter);
    } catch (error) {
      /* the list still filters for this visit */
    }
  }

  function normalize(value) {
    var vote = "pending";
    var notes = "";
    if (value && typeof value === "object") {
      if (value.vote === "yes" || value.vote === "no" || value.vote === "pending") {
        vote = value.vote;
      }
      if (typeof value.notes === "string") notes = value.notes;
    }
    return { vote: vote, notes: notes };
  }

  function reviewFor(id) {
    return normalize(reviews[id]);
  }

  function writeReview(id, next) {
    reviews[id] = { vote: next.vote, notes: next.notes };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (error) {
      memoryOnly = true;
    }
  }

  function statusLabel(vote) {
    if (vote === "yes") return "Yes";
    if (vote === "no") return "No";
    return "Pending";
  }

  function voteOf(design) {
    var vote = reviewFor(design.id).vote;
    if (vote === "yes" || vote === "no") return vote;
    return "pending";
  }

  function matchesFilter(design) {
    if (filter === "all") return true;
    return voteOf(design) === filter;
  }

  function visibleIndexes() {
    var list = [];
    designs.forEach(function (design, designIndex) {
      if (matchesFilter(design)) list.push(designIndex);
    });
    return list;
  }

  function countVotes(vote) {
    var total = 0;
    designs.forEach(function (design) {
      if (voteOf(design) === vote) total += 1;
    });
    return total;
  }

  function designHeading(design) {
    var sameTitle = designs.some(function (other) {
      return other !== design && other.title === design.title;
    });
    return sameTitle ? design.title + " (" + design.id + ")" : design.title;
  }

  function plainText() {
    var lines = ["T-shirt review", "Adult", ""];
    designs.forEach(function (design, designIndex) {
      if (designIndex > 0) lines.push("");
      var review = reviewFor(design.id);
      var notes = review.notes.trim();
      lines.push(designHeading(design));
      lines.push("Id: " + design.id);
      lines.push("Status: " + statusLabel(review.vote));
      if (design.flag) lines.push("Flag: " + design.flag);
      if (design.hasBack) lines.push("Has a back: yes");
      lines.push("Notes:");
      lines.push(notes || "(none)");
    });
    return lines.join("\n") + "\n";
  }

  function mailtoHref() {
    return (
      "mailto:" +
      MAIL +
      "?subject=" +
      encodeURIComponent("T-shirt review") +
      "&body=" +
      encodeURIComponent(plainText())
    );
  }

  function imageSrc(image) {
    if (typeof image !== "string") return "";
    var value = image.trim();
    if (!value || /[\s\\]/.test(value) || value.indexOf("..") !== -1 || value.indexOf("//") !== -1) {
      return "";
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return "";
    var base = value.split("/").pop();
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.webp$/.test(base)) return "";
    if (value !== base && value !== "tshirts/" + base && value.indexOf("/tshirts/" + base) === -1) {
      return "";
    }
    return "../tshirts/" + base;
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

  function cardHtml(design) {
    var review = reviewFor(design.id);
    var src = imageSrc(design.image);
    var pending = review.vote !== "yes" && review.vote !== "no";
    var visible = visibleIndexes();
    var pos = visible.indexOf(index);
    var art = src
      ? '<div class="review-art has-image"><button type="button" class="review-zoom" data-zoom><img src="' +
        escapeHtml(src) +
        '" width="1000" height="1000" alt="' +
        escapeHtml(design.title) +
        '"></button><p class="review-zoom-hint">Tap the shirt to enlarge</p></div>'
      : '<div class="review-art" role="img" aria-label="' +
        escapeHtml("No artwork for " + design.title) +
        '"><p>No artwork</p></div>';

    return (
      '<article class="panel review-card">' +
      art +
      (design.flag ? '<p class="review-flag">' + escapeHtml(design.flag) + "</p>" : "") +
      '<h2 id="design-title" tabindex="-1">' +
      escapeHtml(design.title) +
      "</h2>" +
      (design.hasBack ? '<p class="review-has-back">Has a back</p>' : "") +
      (design.description
        ? '<p class="blurb">' + escapeHtml(design.description) + "</p>"
        : "") +
      '<p class="review-status">Status <strong data-vote-label>' +
      statusLabel(review.vote) +
      "</strong></p>" +
      '<div class="review-votes" role="group" aria-label="Set status">' +
      voteButton("yes", "Yes", review.vote === "yes") +
      voteButton("no", "No", review.vote === "no") +
      voteButton("pending", "Pending", pending) +
      "</div>" +
      '<label class="review-label" for="design-notes">Notes</label>' +
      '<textarea class="review-field" id="design-notes" rows="4" autocomplete="off" placeholder="Add a note for this design">' +
      escapeHtml(review.notes) +
      "</textarea>" +
      '<p class="review-hint">Saved on this phone for this design.</p>' +
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

  function shellHtml() {
    return (
      '<p class="review-count" data-count></p>' +
      '<div class="review-filters" role="group" aria-label="Filter designs">' +
      '<button type="button" data-filter="all">All <span data-filter-count="all"></span></button>' +
      '<button type="button" data-filter="pending">Pending <span data-filter-count="pending"></span></button>' +
      '<button type="button" data-filter="yes">Yes <span data-filter-count="yes"></span></button>' +
      '<button type="button" data-filter="no">No <span data-filter-count="no"></span></button>' +
      "</div>" +
      '<div data-card></div>' +
      '<h2 class="review-subhead">Jump to a design</h2>' +
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
      '<dialog class="review-lightbox" data-lightbox aria-label="Enlarged shirt">' +
      '<div class="review-lightbox-bar">' +
      '<button type="button" class="review-lightbox-zoom" data-lightbox-zoom>Show all</button>' +
      '<button type="button" class="review-lightbox-close" data-lightbox-close>Close</button>' +
      "</div>" +
      '<p class="review-zoom-hint" data-lightbox-hint>Drag to read the print. Tap the shirt to fit the screen.</p>' +
      '<div class="review-lightbox-stage is-zoomed" data-lightbox-stage><img alt="" data-lightbox-img width="1000" height="1000"></div>' +
      "</dialog>"
    );
  }

  function paintCount() {
    var count = mount.querySelector("[data-count]");
    if (!count) return;
    if (index < 0 || !designs[index]) {
      count.textContent = "0 of " + designs.length;
      return;
    }
    count.textContent = index + 1 + " of " + designs.length;
  }

  function paintFilters() {
    var counts = {
      all: designs.length,
      pending: countVotes("pending"),
      yes: countVotes("yes"),
      no: countVotes("no"),
    };
    Array.prototype.forEach.call(mount.querySelectorAll("[data-filter-count]"), function (node) {
      node.textContent = String(counts[node.getAttribute("data-filter-count")] || 0);
    });
    Array.prototype.forEach.call(mount.querySelectorAll("[data-filter]"), function (button) {
      var selected = button.getAttribute("data-filter") === filter;
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
    var design = designs[index];
    if (!design) return;
    var review = reviewFor(design.id);
    var label = statusLabel(review.vote);
    var badge = mount.querySelector("[data-vote-label]");
    if (badge) badge.textContent = label;
    Array.prototype.forEach.call(mount.querySelectorAll("[data-vote]"), function (button) {
      var vote = button.getAttribute("data-vote");
      var pressed = vote === "pending" ? label === "Pending" : vote === review.vote;
      button.setAttribute("aria-pressed", pressed ? "true" : "false");
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
      list.innerHTML = '<li><p class="empty">No designs in this filter.</p></li>';
      return;
    }
    list.innerHTML = visible
      .map(function (designIndex) {
        var design = designs[designIndex];
        var current = designIndex === index ? ' aria-current="true"' : "";
        return (
          '<li><button type="button" data-jump="' +
          designIndex +
          '"' +
          current +
          '><span class="review-item-title">' +
          (designIndex + 1) +
          ". " +
          escapeHtml(design.title) +
          '</span><span class="review-item-status" data-status-for="' +
          escapeHtml(design.id) +
          '">' +
          statusLabel(voteOf(design)) +
          "</span></button></li>"
        );
      })
      .join("");
    list.scrollTop = scroll;
  }

  function showNoMatch() {
    var slot = mount.querySelector("[data-card]");
    if (slot) slot.innerHTML = '<p class="empty">No designs in this filter.</p>';
    paintCount();
    paintFilters();
    paintMail();
    renderList();
    saveIndex();
  }

  function flushNotes() {
    var field = document.getElementById("design-notes");
    var design = designs[index];
    if (!field || !design) return;
    var current = reviewFor(design.id);
    if (reviews[design.id] && current.notes === field.value) return;
    writeReview(design.id, { vote: current.vote, notes: field.value });
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
    if (index < 0 || !designs[index]) {
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

  function afterVote(design) {
    if (matchesFilter(design)) {
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
    var design = designs[index];
    var card = mount.querySelector("[data-card]");
    if (!card || !design) return;

    Array.prototype.forEach.call(card.querySelectorAll("[data-vote]"), function (button) {
      button.addEventListener("click", function () {
        flushNotes();
        var current = reviewFor(design.id);
        writeReview(design.id, {
          vote: button.getAttribute("data-vote"),
          notes: current.notes,
        });
        afterVote(design);
      });
    });

    var notes = document.getElementById("design-notes");
    if (notes) {
      notes.addEventListener("input", function () {
        var current = reviewFor(design.id);
        writeReview(design.id, { vote: current.vote, notes: notes.value });
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
        openLightbox(image.getAttribute("src"), image.getAttribute("alt") || design.title);
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
        art.removeAttribute("role");
        art.setAttribute("role", "img");
        art.setAttribute("aria-label", "No artwork for " + design.title);
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
        ? "Drag to read the print. Tap the shirt to fit the screen."
        : "Tap the shirt to zoom in.";
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
    if (!slot || !designs[index]) return;
    slot.innerHTML = cardHtml(designs[index]);
    bindCard();
    paintCard();
    paintCount();
    paintFilters();
    paintMail();
    renderList();
    saveIndex();
    if (focusTitle) {
      var title = document.getElementById("design-title");
      if (title) title.focus();
    }
  }

  function buttonFrom(list, node) {
    while (node && node !== list) {
      if (node.tagName === "BUTTON") return node;
      node = node.parentNode;
    }
    return null;
  }

  function bindShell() {
    var list = mount.querySelector("[data-list]");
    if (list) {
      list.addEventListener("click", function (event) {
        var button = buttonFrom(list, event.target);
        if (!button) return;
        var next = Number(button.getAttribute("data-jump"));
        if (!isFinite(next) || !designs[next]) return;
        if (next === index) {
          var title = document.getElementById("design-title");
          if (title) title.focus();
          return;
        }
        flushNotes();
        goTo(next, true);
      });
    }

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

  if (!designs.length) {
    mount.innerHTML = '<p class="empty">No designs yet</p>';
    return;
  }

  index = loadIndex();
  filter = loadFilter();
  mount.innerHTML = shellHtml();
  bindShell();
  if (!matchesFilter(designs[index])) {
    var first = visibleIndexes();
    index = first.length ? first[0] : -1;
  }
  if (index < 0) showNoMatch();
  else renderCard(false);
})();
