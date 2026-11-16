// WingsCrew Printables on Payhip. The homepage renders one card per entry
// into [data-printables].
//
// name   Card title
// blurb  One line under the title
// price  Shown under the blurb, e.g. "$5.99 printable PDF"
// url    Payhip product link (https://payhip.com/b/...). Opens in a new tab.
// image  Relative path under assets/printables/, a .webp cover
// alt    Cover alt text
// badge  Small label above the title
//
// storeUrl is the Payhip store. Only payhip.com product and store links
// are allowed through.
window.WINGS_PRINTABLES = {
  storeUrl: "https://payhip.com/WingsCrewPrintables",
  items: [
    {
      name: "Rainbow Sprinkle Unicorns",
      blurb: "30 soft, sparkly unicorn scenes for little colorers.",
      price: "$5.99 printable PDF",
      url: "https://payhip.com/b/BR02t",
      image: "assets/printables/rainbow-sprinkle-unicorns.webp",
      imageWidth: 800,
      imageHeight: 1035,
      alt: "Rainbow Sprinkle Unicorns coloring book cover",
      badge: "New",
    },
    {
      name: "Cute Ocean Friends",
      blurb: "30 busy, cute ocean scenes with smiling sea animals.",
      price: "$5.99 printable PDF",
      url: "https://payhip.com/b/P7z3c",
      image: "assets/printables/cute-ocean-friends.webp",
      imageWidth: 800,
      imageHeight: 1035,
      alt: "Cute Ocean Friends coloring book cover",
      badge: "Printable",
    },
    {
      name: "Jingle & Sparkle Christmas",
      blurb: "30 cozy, cute Christmas scenes for little colorers.",
      price: "$5.99 printable PDF",
      url: "https://payhip.com/b/MCmkb",
      image: "assets/printables/jingle-sparkle-christmas.webp",
      imageWidth: 800,
      imageHeight: 1035,
      alt: "Jingle and Sparkle Christmas coloring book cover",
      badge: "Printable",
    },
    {
      name: "Reason for the Season",
      blurb: "30 gentle scenes that tell the Nativity story.",
      price: "$5.99 printable PDF",
      url: "https://payhip.com/b/DyV7I",
      image: "assets/printables/reason-for-the-season.webp",
      imageWidth: 800,
      imageHeight: 1035,
      alt: "Reason for the Season Nativity coloring book cover",
      badge: "Printable",
    },
    {
      name: "WingsCrew Christmas Coloring Bundle",
      blurb: "Two Christmas books together: sparkle, plus the Nativity story.",
      price: "$9.99 printable PDF",
      url: "https://payhip.com/b/nNUrx",
      image: "assets/printables/christmas-bundle.webp",
      imageWidth: 800,
      imageHeight: 600,
      alt: "WingsCrew Christmas Coloring Bundle",
      badge: "Bundle",
    },
  ],
};

(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function printablesRecord() {
    var data = window.WINGS_PRINTABLES;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { storeUrl: "", items: [] };
    }
    return data;
  }

  // Product pages at /b/ID, or the WingsCrew Printables store.
  function printableUrl(url) {
    var parsed;
    var path;
    try {
      parsed = new URL(url, window.location.href);
    } catch (error) {
      return "";
    }
    if (parsed.protocol !== "https:") return "";
    if (parsed.hostname !== "payhip.com") return "";
    path = parsed.pathname.replace(/\/+$/, "") || "/";
    if (path === "/WingsCrewPrintables") {
      return "https://payhip.com/WingsCrewPrintables";
    }
    if (/^\/b\/[A-Za-z0-9]+$/.test(path)) {
      return "https://payhip.com" + path;
    }
    return "";
  }

  function printableImage(src) {
    if (typeof src !== "string") return "";
    if (!/^assets\/printables\/[a-z0-9-]+\.webp$/.test(src)) return "";
    return src;
  }

  function printablesList() {
    var items = printablesRecord().items;
    if (!Array.isArray(items)) return [];
    return items
      .filter(function (item) {
        return item && item.name && printableUrl(item.url);
      })
      .map(function (item) {
        var width = Number(item.imageWidth);
        var height = Number(item.imageHeight);
        return {
          name: item.name,
          blurb: item.blurb || "",
          price: item.price || "",
          href: printableUrl(item.url),
          image: printableImage(item.image),
          imageWidth: width > 0 && width < 4000 ? Math.round(width) : 0,
          imageHeight: height > 0 && height < 4000 ? Math.round(height) : 0,
          alt: item.alt || item.name,
          badge: item.badge || "Printable",
        };
      });
  }

  function cardHtml(item) {
    var img = "";
    if (item.image) {
      img =
        '<img class="printables-cover" src="' +
        escapeHtml(item.image) +
        '"' +
        (item.imageWidth ? ' width="' + item.imageWidth + '"' : "") +
        (item.imageHeight ? ' height="' + item.imageHeight + '"' : "") +
        ' alt="' +
        escapeHtml(item.alt) +
        '" />';
    }
    return (
      '<a class="panel app-card printables-card" href="' +
      escapeHtml(item.href) +
      '" target="_blank" rel="noopener">' +
      img +
      '<p class="badge">' +
      escapeHtml(item.badge) +
      "</p>" +
      "<h3>" +
      escapeHtml(item.name) +
      "</h3>" +
      '<p class="blurb">' +
      escapeHtml(item.blurb) +
      "</p>" +
      (item.price
        ? '<p class="printables-price">' + escapeHtml(item.price) + "</p>"
        : "") +
      '<span class="open">Get it on Payhip <span aria-hidden="true">↗</span>' +
      '<span class="sr-only"> (opens in a new tab)</span></span>' +
      "</a>"
    );
  }

  function renderPrintables() {
    var mounts = document.querySelectorAll("[data-printables]");
    if (!mounts.length) return;

    var cards = printablesList();
    Array.prototype.forEach.call(mounts, function (node) {
      if (!cards.length) {
        node.innerHTML = '<p class="empty">No printables yet.</p>';
        return;
      }
      node.innerHTML = cards.map(cardHtml).join("");
    });
  }

  window.renderWingsPrintables = renderPrintables;
  renderPrintables();
})();
