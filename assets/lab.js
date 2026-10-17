(function () {
  var entries = Array.isArray(window.WINGS_LAB) ? window.WINGS_LAB : [];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sanitizeUrl(url) {
    if (typeof url !== "string" || !url) return "";
    if (url.charAt(0) === "/" && url.charAt(1) !== "/" && url.indexOf("\\") === -1) {
      return url;
    }
    try {
      var parsed = new URL(url, window.location.href);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.href;
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function cardHtml(entry) {
    var status = entry.status || "coming soon";
    var url = status === "coming soon" ? "" : sanitizeUrl(entry.url);
    var inner =
      '<p class="badge">' +
      escapeHtml(status) +
      "</p>" +
      (entry.mark
        ? '<p class="badge">' + escapeHtml(entry.mark) + "</p>"
        : "") +
      "<h3>" +
      escapeHtml(entry.name) +
      "</h3>" +
      '<p class="blurb">' +
      escapeHtml(entry.blurb || "") +
      "</p>";

    if (!url) {
      return '<article class="panel">' + inner + "</article>";
    }

    return (
      '<a class="panel app-card" href="' +
      escapeHtml(url) +
      '">' +
      inner +
      '<span class="open">Open <span aria-hidden="true">↗</span></span>' +
      "</a>"
    );
  }

  function render(mount) {
    var group = mount.getAttribute("data-lab");
    var cards = entries.filter(function (entry) {
      return entry && entry.name && (!group || entry.group === group);
    });

    if (!cards.length) {
      mount.innerHTML = '<p class="empty">Nothing in this list.</p>';
      return;
    }

    mount.innerHTML = cards.map(cardHtml).join("");
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-lab]"), render);
})();
