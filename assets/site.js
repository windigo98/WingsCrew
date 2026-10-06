(function () {
  var mount = document.querySelector("[data-apps]");
  var apps = Array.isArray(window.WINGS_APPS) ? window.WINGS_APPS : [];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sanitizeUrl(url) {
    try {
      var parsed = new URL(url, window.location.href);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.href;
      }
    } catch (error) {
      return "#";
    }
    return "#";
  }

  function renderApps() {
    if (!mount) return;

    var cards = apps.filter(function (app) {
      return app && app.name && app.url;
    });

    if (!cards.length) {
      mount.innerHTML = '<p class="empty">No apps yet.</p>';
      return;
    }

    mount.innerHTML = cards
      .map(function (app) {
        var url = sanitizeUrl(app.url);
        return (
          '<a class="panel app-card" href="' +
          escapeHtml(url) +
          '">' +
          '<p class="badge">' +
          escapeHtml(app.badge || "App") +
          "</p>" +
          "<h3>" +
          escapeHtml(app.name) +
          "</h3>" +
          '<p class="blurb">' +
          escapeHtml(app.blurb || "") +
          "</p>" +
          '<span class="open">Open app <span aria-hidden="true">↗</span></span>' +
          "</a>"
        );
      })
      .join("");
  }

  function watchNav() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll(".nav a[href^='#']")
    );
    if (!links.length) return;

    var ids = links.map(function (link) {
      return link.getAttribute("href").slice(1);
    });

    function update() {
      var line = window.innerHeight * 0.35;
      var current = null;
      ids.forEach(function (id) {
        var section = document.getElementById(id);
        if (!section) return;
        if (section.getBoundingClientRect().top < line) current = id;
      });
      links.forEach(function (link) {
        if (link.getAttribute("href") === "#" + current) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("hashchange", update);
  }

  renderApps();
  watchNav();
})();
