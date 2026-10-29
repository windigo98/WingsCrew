// Social profiles for the About "Find us" section and every site footer.
// This is the only list. To add X or Facebook, append:
//   { name: "X", href: "https://x.com/example/" }
// Instagram is not ready yet. Add it here when the profile is live:
//   { name: "Instagram", href: "https://www.instagram.com/..." }
window.WINGS_SOCIAL = [
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@wingscrewofficial",
  },
  {
    name: "Pinterest",
    href: "https://www.pinterest.com/wingscrewofficial/",
  },
];

(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeHref(href) {
    try {
      var parsed = new URL(href, window.location.href);
      if (parsed.protocol !== "https:") return "";
      return parsed.href;
    } catch (error) {
      return "";
    }
  }

  function profiles() {
    var list = window.WINGS_SOCIAL;
    if (!Array.isArray(list)) return [];
    return list
      .filter(function (item) {
        return item && item.name && safeHref(item.href);
      })
      .map(function (item) {
        return {
          name: String(item.name).trim(),
          href: safeHref(item.href),
        };
      })
      .filter(function (item) {
        return item.name && item.href;
      });
  }

  function anchor(profile, text) {
    var hint = text === profile.name ? "" : " on " + profile.name;
    return (
      '<a href="' +
      escapeHtml(profile.href) +
      '" target="_blank" rel="noopener">' +
      escapeHtml(text) +
      '<span class="sr-only">' +
      escapeHtml(hint + " (opens in a new tab)") +
      "</span></a>"
    );
  }

  // One profile: the About link reads "Follow us".
  // More than one: "Follow us" introduces a link for each profile name.
  function renderFollow(node, list) {
    if (!list.length) {
      node.hidden = true;
      node.innerHTML = "";
      return;
    }
    if (list.length === 1) {
      node.innerHTML = anchor(list[0], "Follow us");
    } else {
      node.innerHTML =
        '<span class="follow-label">Follow us</span>' +
        list
          .map(function (profile) {
            return anchor(profile, profile.name);
          })
          .join("");
    }
    node.hidden = false;
  }

  function renderFooter(node, list) {
    if (!list.length) {
      node.hidden = true;
      node.innerHTML = "";
      return;
    }
    node.innerHTML = list
      .map(function (profile) {
        return anchor(profile, profile.name);
      })
      .join("");
    node.hidden = false;
  }

  function render() {
    var list = profiles();
    var nodes = document.querySelectorAll("[data-social]");
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.getAttribute("data-social") === "follow") {
        renderFollow(node, list);
      } else {
        renderFooter(node, list);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
