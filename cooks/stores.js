/* Store hand-off.
   Each store below is a search adapter: one new tab per grocery item.
   No affiliate tags are added. No API keys live here.

   One-tap cart fill (Instacart and anything like it)
   -------------------------------------------------
   Instacart's Developer Platform needs a secret API key and the call has
   to run on a server. This page is static, so that adapter is not wired up.
   When a backend exists, add a cart adapter next to the search stores:

     {
       id: "instacart",
       label: "Instacart",
       kind: "cart",
       fill: function (items) {
         // POST the item names to your server.
         // The server holds the Instacart key and creates the cart.
         // Do not put the key, a token, or a private URL in this file.
         return Promise.reject(new Error("Instacart cart fill is not set up."));
       }
     }

   Search adapters only need id, label, and searchUrl(itemName).
   Cart adapters need id, label, kind: "cart", and fill(items).
   The shopping list renders a button for every adapter in this list. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CooksStores = api;
})(typeof window !== "undefined" ? window : this, function () {
  function search(base) {
    return function (itemName) {
      return base + encodeURIComponent(String(itemName || "").trim());
    };
  }

  var STORES = [
    {
      id: "heb",
      label: "H-E-B",
      kind: "search",
      searchUrl: search("https://www.heb.com/search?q="),
    },
    {
      id: "walmart",
      label: "Walmart",
      kind: "search",
      searchUrl: search("https://www.walmart.com/search?q="),
    },
  ];

  function adapters() {
    return STORES.slice();
  }

  function formatList(groups) {
    var lines = ["WingsCrew Cooks shopping list", ""];
    var any = false;
    (groups || []).forEach(function (group) {
      var open = (group.items || []).filter(function (item) { return !item.checked; });
      if (!open.length) return;
      any = true;
      lines.push(group.aisle);
      open.forEach(function (item) {
        var line = "- " + item.label;
        if (item.qty) line += " (" + item.qty + ")";
        lines.push(line);
        if (item.brandLine) lines.push("  " + item.brandLine);
      });
      lines.push("");
    });
    if (!any) return "WingsCrew Cooks shopping list\n\nNothing left to buy.";
    return lines.join("\n").trim();
  }

  function itemQuery(item) {
    return item && item.label ? String(item.label) : "";
  }

  /* Opens one search tab per item. Must run from a tap.
     Browsers, especially Safari, may block the later tabs.
     Returns the URLs so the page can say what it tried to open.
     Cart adapters are not opened here; call adapter.fill(items). */
  function searchUrls(store, items) {
    if (!store || typeof store.searchUrl !== "function") return [];
    return (items || []).map(function (item) {
      return store.searchUrl(itemQuery(item));
    }).filter(Boolean);
  }

  function openSearches(store, items) {
    var urls = searchUrls(store, items);
    urls.forEach(function (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    });
    return urls;
  }

  function shareText(text) {
    if (!navigator.share) return Promise.reject(new Error("share unavailable"));
    return navigator.share({ title: "WingsCrew Cooks shopping list", text: text });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
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

  return {
    adapters: adapters,
    formatList: formatList,
    searchUrls: searchUrls,
    openSearches: openSearches,
    shareText: shareText,
    copyText: copyText,
  };
});
