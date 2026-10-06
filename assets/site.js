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

  function pageUrl() {
    try {
      if (/^https?:$/.test(window.location.protocol) && window.location.href) {
        return window.location.href;
      }
    } catch (error) {
      /* fall through to the canonical hub URL */
    }

    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) return canonical.href;
    return window.location.href;
  }

  function legacyCopy(url) {
    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "0";
      field.style.left = "-9999px";
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

  function flashCopied(button) {
    var label = button.getAttribute("data-share-label") || "Share";
    if (button._shareTimer) window.clearTimeout(button._shareTimer);
    button.textContent = "Copied!";
    button.classList.add("is-copied");
    button.setAttribute("aria-label", "WingsCrew link copied");
    button._shareTimer = window.setTimeout(function () {
      button.textContent = label;
      button.classList.remove("is-copied");
      button.setAttribute("aria-label", "Share WingsCrew");
      button._shareTimer = null;
    }, 1600);
  }

  function copyPageUrl(button, url) {
    var write =
      navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(url)
        : Promise.reject(new Error("clipboard unavailable"));

    return write.then(
      function () {
        flashCopied(button);
      },
      function () {
        return legacyCopy(url).then(function () {
          flashCopied(button);
        });
      }
    );
  }

  function wireShare() {
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-share]")
    );
    if (!buttons.length) return;

    buttons.forEach(function (button) {
      var label = button.textContent.replace(/\s+/g, " ").trim() || "Share";
      button.setAttribute("data-share-label", label);
      button.setAttribute("aria-live", "polite");

      button.addEventListener("click", function () {
        var url = pageUrl();
        var payload = {
          title: "WingsCrew",
          text: "Check out WingsCrew — apps & more",
          url: url
        };

        if (typeof navigator.share !== "function") {
          copyPageUrl(button, url).catch(function () {});
          return;
        }

        navigator.share(payload)
          .catch(function (error) {
            if (error && error.name === "AbortError") return;
            return copyPageUrl(button, url);
          })
          .catch(function () {});
      });
    });
  }

  renderApps();
  watchNav();
  wireShare();
})();
