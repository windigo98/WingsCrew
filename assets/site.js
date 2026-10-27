(function () {
  var AGE_KEY = "wingscrew-21plus";
  var mount = document.querySelector("[data-apps]");

  function isAdult(app) {
    return !!(app && app.adult);
  }

  function appList() {
    var all = Array.isArray(window.WINGS_APPS) ? window.WINGS_APPS : [];
    var dedicated = Array.isArray(window.WINGS_ADULT_APPS) ? window.WINGS_ADULT_APPS : [];
    var adultMode = mount && mount.getAttribute("data-apps") === "adult";
    var source = adultMode
      ? dedicated.concat(all.filter(isAdult))
      : all.filter(function (app) {
          return app && !isAdult(app);
        });
    var seen = {};

    return source.filter(function (app) {
      if (!app || !app.name || !app.url) return false;
      var key = String(app.url);
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  var apps = appList();

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

  function merchRecord() {
    var merch = window.WINGS_MERCH;
    if (!merch || typeof merch !== "object" || Array.isArray(merch)) {
      return { status: "coming soon", items: [] };
    }
    return merch;
  }

  function merchStatus() {
    return merchRecord().status === "live" ? "live" : "coming soon";
  }

  function onAdultPage() {
    return /\/21plus(\/|$)/.test(window.location.pathname || "");
  }

  // Clean collection on family pages. 21+ collection only on /21plus/.
  // The store root is the full product list, so it is never a merch link.
  function merchUrl(audience, url) {
    var parsed;
    var path;
    if (audience === "adult") {
      if (!onAdultPage()) return "";
    } else if (audience !== "clean") {
      return "";
    }
    try {
      parsed = new URL(url, window.location.href);
    } catch (error) {
      return "";
    }
    if (parsed.protocol !== "https:") return "";
    if (parsed.hostname !== "wingscrew-clothing.printify.me") return "";
    path = parsed.pathname.replace(/\/+$/, "") || "/";
    if (audience === "adult" && path !== "/collection/21") return "";
    if (audience === "clean" && path !== "/collection/clean") return "";
    return "https://wingscrew-clothing.printify.me" + path;
  }

  function merchList(audience) {
    var items = merchRecord().items;
    if (!Array.isArray(items)) return [];
    return items.filter(function (item) {
      return (
        item &&
        item.audience === audience &&
        item.name &&
        merchUrl(audience, item.url)
      );
    }).map(function (item) {
      return {
        name: item.name,
        blurb: item.blurb || "",
        href: merchUrl(audience, item.url)
      };
    });
  }

  function merchLabel() {
    return merchStatus() === "live" ? "Shop" : "Opening soon";
  }

  function renderMerch() {
    var mounts = document.querySelectorAll("[data-merch]");
    if (!mounts.length) return;

    Array.prototype.forEach.call(mounts, function (node) {
      var audience = node.getAttribute("data-merch");
      var cards = merchList(audience);

      if (!cards.length) {
        node.innerHTML = '<p class="empty">Nothing in this shop yet.</p>';
        return;
      }

      node.innerHTML = cards
        .map(function (item) {
          return (
            '<a class="panel app-card" href="' +
            escapeHtml(item.href) +
            '" target="_blank" rel="noopener">' +
            '<p class="badge">' +
            escapeHtml(merchLabel()) +
            "</p>" +
            "<h3>" +
            escapeHtml(item.name) +
            "</h3>" +
            '<p class="blurb">' +
            escapeHtml(item.blurb) +
            "</p>" +
            '<span class="open">Open shop <span aria-hidden="true">↗</span>' +
            '<span class="sr-only"> (opens in a new tab)</span></span>' +
            "</a>"
          );
        })
        .join("");
    });
  }

  function applyMerchChrome() {
    var live = merchStatus() === "live";
    var lede = document.querySelector("[data-shop-lede]");
    var navs = document.querySelectorAll("[data-merch-nav]");

    if (lede) {
      lede.textContent = live
        ? "Live apps from windigo98. WingsCrew Clothing is open."
        : "Live apps from windigo98. WingsCrew Clothing is opening soon.";
    }

    Array.prototype.forEach.call(navs, function (nav) {
      var audience = nav.getAttribute("data-merch-nav");
      var match = merchList(audience)[0];
      var tag;

      if (match) nav.setAttribute("href", match.href);
      nav.setAttribute("target", "_blank");
      nav.setAttribute("rel", "noopener");

      while (nav.firstChild) nav.removeChild(nav.firstChild);
      nav.appendChild(document.createTextNode("Shop"));
      if (!live) {
        tag = document.createElement("span");
        tag.className = "soon-tag";
        tag.textContent = "· Opening soon";
        nav.appendChild(tag);
      }
      nav.setAttribute(
        "aria-label",
        live
          ? "Shop WingsCrew Clothing (opens in a new tab)"
          : "Shop WingsCrew Clothing, opening soon (opens in a new tab)"
      );
    });
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

  function wireAgeGate() {
    var gate = document.querySelector("[data-age-gate]");
    if (!gate) return;

    var yes = gate.querySelector("[data-age-yes]");
    var no = gate.querySelector("[data-age-no]");

    function grant() {
      try {
        window.localStorage.setItem(AGE_KEY, "yes");
      } catch (error) {
        /* private mode still unlocks for this visit */
      }
      document.documentElement.classList.add("age-ok");
      var heading = document.querySelector(".age-content h1");
      if (!heading || typeof heading.focus !== "function") return;
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }

    if (yes) yes.addEventListener("click", grant);

    if (no) {
      no.addEventListener("click", function () {
        window.location.href = "../";
      });
    }

    if (
      !document.documentElement.classList.contains("age-ok") &&
      yes &&
      typeof yes.focus === "function"
    ) {
      yes.focus();
    }
  }

  renderApps();
  renderMerch();
  applyMerchChrome();
  watchNav();
  wireShare();
  wireAgeGate();
})();
