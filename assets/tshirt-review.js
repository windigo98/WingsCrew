// Crew Lab t-shirt review. Votes and notes stay in localStorage.
// Copy and the mailto link are the only ways out. Nothing is sent on its own.
(function () {
  var STORAGE_KEY = "wingscrew-tshirt-review";
  var INDEX_KEY = "wingscrew-tshirt-review-index";
  var MAIL = "dovewingsbusiness@gmail.com";
  var mount = document.querySelector("[data-tshirt-review]");
  if (!mount) return;

  var memoryOnly = false;
  var copyTimer = null;
  var designs = loadDesigns();
  var reviews = loadReviews();
  var index = 0;

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
      var stored = Number(sessionStorage.getItem(INDEX_KEY));
      if (!isFinite(stored) || stored < 0 || stored >= designs.length) return 0;
      return stored;
    } catch (error) {
      return 0;
    }
  }

  function saveIndex() {
    try {
      sessionStorage.setItem(INDEX_KEY, String(index));
    } catch (error) {
      /* the vote still stays in memory for this visit */
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

  function designHeading(design) {
    var sameTitle = designs.some(function (other) {
      return other !== design && other.title === design.title;
    });
    return sameTitle ? design.title + " (" + design.id + ")" : design.title;
  }

  function plainText() {
    var lines = ["T-shirt review", ""];
    designs.forEach(function (design, designIndex) {
      if (designIndex > 0) lines.push("");
      var review = reviewFor(design.id);
      var notes = review.notes.trim();
      lines.push(designHeading(design));
      lines.push("Status: " + statusLabel(review.vote));
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
    if (!image || image.indexOf("\\") !== -1 || image.indexOf("//") === 0) return "";
    if (/^https?:\/\//i.test(image)) {
      try {
        var parsed = new URL(image);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.href;
      } catch (error) {
        return "";
      }
      return "";
    }
    if (image.charAt(0) === "/") return image;
    return "";
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
    var art = src
      ? '<div class="review-art has-image"><img src="' +
        escapeHtml(src) +
        '" alt="' +
        escapeHtml("Artwork for " + design.title) +
        '"></div>'
      : '<div class="review-art" role="img" aria-label="' +
        escapeHtml("No artwork for " + design.title) +
        '"><p>No artwork</p></div>';

    return (
      '<article class="panel review-card">' +
      art +
      '<h2 id="design-title" tabindex="-1">' +
      escapeHtml(design.title) +
      "</h2>" +
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
      '<textarea class="review-field" id="design-notes" rows="5" autocomplete="off" placeholder="Add a note for this design">' +
      escapeHtml(review.notes) +
      "</textarea>" +
      '<p class="review-hint">Saved on this phone for this design.</p>' +
      '<div class="review-nav">' +
      '<button type="button" data-nav="prev"' +
      (index === 0 ? " disabled" : "") +
      ">Previous</button>" +
      '<button type="button" data-nav="next"' +
      (index === designs.length - 1 ? " disabled" : "") +
      ">Next</button>" +
      "</div>" +
      "</article>"
    );
  }

  function shellHtml() {
    return (
      '<p class="review-count" data-count></p>' +
      '<div data-card></div>' +
      '<h2 class="review-subhead">All designs</h2>' +
      '<ul class="review-list" data-list>' +
      designs
        .map(function (design, designIndex) {
          return (
            "<li><button type=\"button\" data-jump=\"" +
            designIndex +
            '"><span class="review-item-title">' +
            escapeHtml(design.title) +
            '</span><span class="review-item-status" data-status-for="' +
            escapeHtml(design.id) +
            '"></span></button></li>'
          );
        })
        .join("") +
      "</ul>" +
      '<div class="review-actions">' +
      '<button type="button" class="review-copy" data-copy aria-live="polite">Copy my review</button>' +
      '<a class="review-mail" data-mail aria-describedby="review-mail-hint">Email my review</a>' +
      '<p class="review-hint" id="review-mail-hint">Opens a message to ' +
      escapeHtml(MAIL) +
      ". Nothing is sent until you send it.</p>" +
      '<p class="review-hint" data-memory hidden>This browser is not storing votes on this phone. Copy or email them before you leave.</p>' +
      "</div>" +
      '<div class="review-fallback" data-fallback hidden>' +
      '<label class="review-label" for="review-plain">Review text</label>' +
      '<textarea class="review-field" id="review-plain" readonly></textarea>' +
      "</div>"
    );
  }

  function paint() {
    var design = designs[index];
    var review = reviewFor(design.id);
    var label = statusLabel(review.vote);
    var badge = mount.querySelector("[data-vote-label]");
    if (badge) badge.textContent = label;

    Array.prototype.forEach.call(mount.querySelectorAll("[data-vote]"), function (button) {
      var vote = button.getAttribute("data-vote");
      var pressed = vote === "pending" ? label === "Pending" : vote === review.vote;
      button.setAttribute("aria-pressed", pressed ? "true" : "false");
    });

    Array.prototype.forEach.call(mount.querySelectorAll("[data-status-for]"), function (node) {
      node.textContent = statusLabel(reviewFor(node.getAttribute("data-status-for")).vote);
    });

    Array.prototype.forEach.call(mount.querySelectorAll("[data-jump]"), function (button) {
      var selected = Number(button.getAttribute("data-jump")) === index;
      if (selected) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });

    var mail = mount.querySelector("[data-mail]");
    if (mail) mail.href = mailtoHref();

    var memory = mount.querySelector("[data-memory]");
    if (memory) memory.hidden = !memoryOnly;

    var count = mount.querySelector("[data-count]");
    if (count) count.textContent = "Design " + (index + 1) + " of " + designs.length;
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
        paint();
      });
    });

    var notes = document.getElementById("design-notes");
    if (notes) {
      notes.addEventListener("input", function () {
        var current = reviewFor(design.id);
        writeReview(design.id, { vote: current.vote, notes: notes.value });
        paint();
      });
    }

    Array.prototype.forEach.call(card.querySelectorAll("[data-nav]"), function (button) {
      button.addEventListener("click", function () {
        if (button.disabled) return;
        flushNotes();
        index += button.getAttribute("data-nav") === "next" ? 1 : -1;
        renderCard(true);
      });
    });

    var image = card.querySelector("img");
    if (image) {
      image.addEventListener("error", function () {
        var art = image.parentNode;
        if (!art) return;
        art.className = "review-art";
        art.setAttribute("role", "img");
        art.setAttribute("aria-label", "No artwork for " + design.title);
        art.textContent = "";
        var message = document.createElement("p");
        message.textContent = "No artwork";
        art.appendChild(message);
      });
    }
  }

  function renderCard(focusTitle) {
    var slot = mount.querySelector("[data-card]");
    if (!slot) return;
    slot.innerHTML = cardHtml(designs[index]);
    bindCard();
    paint();
    saveIndex();
    if (focusTitle) {
      var title = document.getElementById("design-title");
      if (title) title.focus();
    }
  }

  function bindShell() {
    Array.prototype.forEach.call(mount.querySelectorAll("[data-jump]"), function (button) {
      button.addEventListener("click", function () {
        var next = Number(button.getAttribute("data-jump"));
        if (next === index) {
          var title = document.getElementById("design-title");
          if (title) title.focus();
          return;
        }
        flushNotes();
        index = next;
        renderCard(true);
      });
    });

    var copyButton = mount.querySelector("[data-copy]");
    if (copyButton) {
      copyButton.addEventListener("click", function () {
        flushNotes();
        paint();
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
        paint();
      });
    }
  }

  if (!designs.length) {
    mount.innerHTML = '<p class="empty">No designs yet</p>';
    return;
  }

  index = loadIndex();
  mount.innerHTML = shellHtml();
  bindShell();
  renderCard(false);
})();
