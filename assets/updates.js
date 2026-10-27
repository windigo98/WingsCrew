// What's new — the About page feed (about/index.html).
//
// Add a new entry by inserting one object at the top of WINGS_UPDATES:
//   { date: "YYYY-MM-DD", title: "Short title", description: "One line.", link: "https://example.com" }
// link is optional. Leave it off when the note has nowhere to go.
// Newest dates show first. When two dates match, the earlier object stays first.
//
// That one line is the live list. Copy the same entry into the What's new
// list in about/index.html so it still shows when JavaScript is off.
//
// All-ages only. Do not add 21+ shop links, games, or humor here.
//
// date         Calendar day, YYYY-MM-DD
// title        Short headline
// description  One line under the title
// link         Optional https URL
window.WINGS_UPDATES = [
  {
    date: "2026-10-27",
    title: "WingsCrew Clothing is open",
    description: "Our tee shop is live with clean tees, plus a separate 21+ collection.",
    link: "https://wingscrew-clothing.printify.me/collection/clean",
  },
  {
    date: "2026-10-27",
    title: "Meet WingsCrew",
    description: "The new About page, with our story and how to send shirt ideas.",
  },
  {
    date: "2026-10-27",
    title: "Net Pulse, by WingsCrew",
    description: "A free phone app that checks if your internet is really working and how fast it is.",
    link: "https://windigo98.github.io/Net-pulse/",
  },
  {
    date: "2026-10-27",
    title: "Find us on Pinterest",
    description: "WingsCrew is now on Pinterest.",
    link: "https://www.pinterest.com/wingscrewofficial/",
  },
];

(function () {
  var VISIBLE_COUNT = 6;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dateKey(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : "";
  }

  function formatDate(value) {
    var key = dateKey(value);
    if (!key) return "";
    var parts = key.split("-");
    var month = MONTHS[Number(parts[1]) - 1];
    if (!month) return "";
    return month + " " + Number(parts[2]) + ", " + parts[0];
  }

  // Family pages never link the 21+ collection or the store's full product list.
  function safeLink(link) {
    var parsed;
    var path;
    if (!link) return "";
    try {
      parsed = new URL(link, window.location.href);
    } catch (error) {
      return "";
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    path = parsed.pathname.replace(/\/+$/, "") || "/";
    if (/\/21plus(?:\/|$)/i.test(path)) return "";
    if (parsed.hostname === "wingscrew-clothing.printify.me" && path !== "/collection/clean") {
      return "";
    }
    return parsed.href;
  }

  function entries() {
    var list = window.WINGS_UPDATES;
    if (!Array.isArray(list)) return [];
    return list
      .filter(function (entry) {
        return entry && entry.title && entry.description && dateKey(entry.date);
      })
      .map(function (entry) {
        return {
          date: dateKey(entry.date),
          title: String(entry.title).trim(),
          description: String(entry.description).trim(),
          link: safeLink(entry.link),
        };
      })
      .filter(function (entry) {
        return entry.title && entry.description;
      })
      .sort(function (a, b) {
        if (a.date === b.date) return 0;
        return a.date < b.date ? 1 : -1;
      });
  }

  function opensNewTab(href) {
    try {
      return new URL(href).hostname !== window.location.hostname;
    } catch (error) {
      return true;
    }
  }

  function itemHtml(entry) {
    var title = escapeHtml(entry.title);
    var external = entry.link && opensNewTab(entry.link);
    var heading = entry.link
      ? '<a href="' +
        escapeHtml(entry.link) +
        '"' +
        (external ? ' target="_blank" rel="noopener"' : "") +
        ">" +
        title +
        (external ? '<span class="sr-only"> (opens in a new tab)</span>' : "") +
        "</a>"
      : title;
    return (
      '<li class="update">' +
      '<p class="update-date"><time datetime="' +
      escapeHtml(entry.date) +
      '">' +
      escapeHtml(formatDate(entry.date)) +
      "</time></p>" +
      '<h3 class="update-title">' +
      heading +
      "</h3>" +
      '<p class="update-text">' +
      escapeHtml(entry.description) +
      "</p></li>"
    );
  }

  function render() {
    var list = document.querySelector("[data-updates]");
    var items = entries();
    var more;
    var open = false;
    if (!list || !items.length) return;

    function apply() {
      var nodes = list.querySelectorAll(".update");
      Array.prototype.forEach.call(nodes, function (node, index) {
        node.hidden = !open && index >= VISIBLE_COUNT;
      });
      if (!more) return;
      if (items.length <= VISIBLE_COUNT) {
        more.hidden = true;
        more.setAttribute("aria-expanded", "true");
        return;
      }
      more.hidden = false;
      more.textContent = open ? "Show less" : "Show more";
      more.setAttribute("aria-expanded", open ? "true" : "false");
    }

    list.innerHTML = items.map(itemHtml).join("");
    more = list.parentNode.querySelector("[data-updates-more]");
    if (items.length > VISIBLE_COUNT) {
      if (!more) {
        more = document.createElement("button");
        more.type = "button";
        more.className = "updates-more";
        more.setAttribute("data-updates-more", "");
        more.setAttribute("aria-controls", list.id || "whats-new-list");
        list.insertAdjacentElement("afterend", more);
        more.addEventListener("click", function () {
          open = !open;
          apply();
        });
      }
      more.hidden = false;
    } else if (more) {
      more.hidden = true;
    }
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
