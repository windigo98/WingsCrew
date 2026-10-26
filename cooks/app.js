/* WingsCrew Cooks. Phone cookbook: sections, pantry, list, cook mode. */
(function () {
  var P = window.CooksPantry;
  var S = window.CooksStores;
  var KEYS = {
    pantry: "wingscrew-cooks-pantry",
    picked: "wingscrew-cooks-picked",
    checked: "wingscrew-cooks-checked",
    sort: "wingscrew-cooks-sort",
  };

  var state = {
    recipes: [],
    picks: [],
    pantry: [],
    picked: [],
    checked: {},
    sort: "book",
    section: "Breakfast",
    query: "",
    ready: false,
    error: "",
    wakeOn: false,
  };

  var wakeLock = null;
  var statusTimer = 0;

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function save() {
    try {
      localStorage.setItem(KEYS.pantry, JSON.stringify(state.pantry));
      localStorage.setItem(KEYS.picked, JSON.stringify(state.picked));
      localStorage.setItem(KEYS.checked, JSON.stringify(state.checked));
      localStorage.setItem(KEYS.sort, state.sort);
    } catch (error) {
      /* Private mode can refuse storage. The page still works for this visit. */
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeUrl(url) {
    try {
      var parsed = new URL(url, window.location.href);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.href;
    } catch (error) {
      return "";
    }
    return "";
  }

  function recipeById(id) {
    var i;
    for (i = 0; i < state.recipes.length; i++) {
      if (state.recipes[i].id === id) return state.recipes[i];
    }
    return null;
  }

  function route() {
    var parts = (location.hash || "#/").replace(/^#/, "").split("/").filter(Boolean);
    var name = parts[0] || "home";
    if (name === "recipe" && parts[1]) return { name: "recipe", id: decodeURIComponent(parts[1]) };
    if (name === "got") return { name: "got" };
    if (name === "list") return { name: "list" };
    if (name === "cook" && parts[1]) {
      return {
        name: "cook",
        id: decodeURIComponent(parts[1]),
        step: Math.max(1, parseInt(parts[2] || "1", 10) || 1),
      };
    }
    return { name: "home" };
  }

  function say(message) {
    var el = document.getElementById("status");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 3200);
  }

  function hasPick(id) {
    return state.picked.indexOf(id) !== -1;
  }

  function togglePick(id) {
    if (hasPick(id)) state.picked = state.picked.filter(function (item) { return item !== id; });
    else state.picked.push(id);
    save();
  }

  function togglePantry(id) {
    if (state.pantry.indexOf(id) !== -1) {
      state.pantry = state.pantry.filter(function (item) { return item !== id; });
    } else {
      state.pantry.push(id);
    }
    save();
  }

  function metaLine(recipe) {
    var bits = [];
    if (recipe.servings) bits.push("Serves " + recipe.servings);
    var time = P.formatMinutes(recipe.totalMinutes);
    if (time) bits.push(time);
    return bits.join(" · ");
  }

  function starsHtml(rating) {
    if (!rating || rating.stars == null || rating.stars === "") return "";
    var n = Number(rating.stars);
    if (!isFinite(n)) return "";
    n = Math.max(0, Math.min(5, n));
    var shown = Math.round(n * 100) / 100;
    shown = shown % 1 === 0 ? String(shown) : String(shown);
    var width = (n / 5) * 100;
    var label = shown + " out of 5";
    if (rating.count != null && rating.count !== "") label += ", " + rating.count + " ratings";
    var count = rating.count != null && rating.count !== ""
      ? '<span class="count">' + escapeHtml(rating.count) + "</span>"
      : "";
    return (
      '<p class="stars" aria-label="' + escapeHtml(label) + '">' +
      '<span class="starbar" aria-hidden="true">★★★★★<span style="width:' + width + '%">★★★★★</span></span> ' +
      '<span class="star-num">' + escapeHtml(shown) + "</span> " +
      count +
      "</p>"
    );
  }

  function ratingRow(recipe) {
    var stars = starsHtml(recipe.rating);
    var site = P.siteLabel(recipe);
    if (!stars && !site) return "";
    return (
      '<div class="rating-row">' +
      stars +
      (site ? '<span class="site-name">' + escapeHtml(site) + "</span>" : "") +
      "</div>"
    );
  }

  function seasoningHtml(recipe) {
    var seasoning = recipe.seasoning;
    if (!seasoning || typeof seasoning !== "object") return "";
    var base = seasoning.base ? String(seasoning.base).trim() : "";
    var tries = Array.isArray(seasoning.tryThis)
      ? seasoning.tryThis.map(function (item) { return String(item).trim(); }).filter(Boolean)
      : [];
    var tip = seasoning.tip ? String(seasoning.tip).trim() : "";
    if (!base && !tries.length && !tip) return "";
    var html = '<section class="seasoning"><h2>Seasoning</h2>';
    if (base) html += '<p class="season-base">' + escapeHtml(base) + "</p>";
    if (tries.length) {
      html += '<p class="try-label">Try this</p><ul>' + tries.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") + "</ul>";
    }
    if (tip) html += '<p class="season-tip">' + escapeHtml(tip) + "</p>";
    return html + "</section>";
  }

  function badges(recipe) {
    var home = recipe.sections && recipe.sections[0] ? recipe.sections[0] : "";
    var html = '<div class="badges">';
    if (home) html += '<p class="badge">' + escapeHtml(home) + "</p>";
    if (P.isOriginal(recipe)) html += '<p class="badge">J D Original</p>';
    return html + "</div>";
  }

  function pickButton(id) {
    var on = hasPick(id);
    return (
      '<button type="button" class="pick' + (on ? " on" : "") + '" data-action="pick" data-id="' +
      escapeHtml(id) + '">' + (on ? "On the list" : "Add to list") + "</button>"
    );
  }

  function sortRecipes(list) {
    var copy = list.slice();
    if (state.sort === "title") {
      copy.sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (state.sort === "rating") {
      copy.sort(function (a, b) {
        var ar = a.rating && isFinite(Number(a.rating.stars)) ? Number(a.rating.stars) : -1;
        var br = b.rating && isFinite(Number(b.rating.stars)) ? Number(b.rating.stars) : -1;
        if (br !== ar) return br - ar;
        var ac = a.rating && isFinite(Number(a.rating.count)) ? Number(a.rating.count) : 0;
        var bc = b.rating && isFinite(Number(b.rating.count)) ? Number(b.rating.count) : 0;
        if (bc !== ac) return bc - ac;
        return a.title.localeCompare(b.title);
      });
    }
    return copy;
  }

  function visibleRecipes() {
    var query = state.query.trim().toLowerCase();
    var list = state.recipes.filter(function (recipe) {
      if (!query) return (recipe.sections || []).indexOf(state.section) !== -1;
      var hay = [
        recipe.title,
        P.summary(recipe),
        P.siteLabel(recipe),
        (recipe.tags || []).join(" "),
        (recipe.sections || []).join(" "),
        (recipe.ingredients || []).map(function (ing) { return ing.item; }).join(" "),
        recipe.notes || "",
      ].join(" ").toLowerCase();
      return query.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
    });
    return sortRecipes(list);
  }

  function card(recipe) {
    return (
      '<article class="card">' +
      '<a class="card-hit" href="#/recipe/' + encodeURIComponent(recipe.id) + '">' +
      badges(recipe) +
      "<h2>" + escapeHtml(recipe.title) + "</h2>" +
      ratingRow(recipe) +
      '<p class="summary">' + escapeHtml(P.blurb(recipe)) + "</p>" +
      (metaLine(recipe) ? '<p class="meta">' + escapeHtml(metaLine(recipe)) + "</p>" : "") +
      "</a>" +
      pickButton(recipe.id) +
      "</article>"
    );
  }

  function icon(name) {
    if (name === "book") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5z"/><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3"/></svg>';
    }
    if (name === "pot") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M8 10V8a4 4 0 0 1 8 0v2M9 4l1.5 2M15 4l-1.5 2"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';
  }

  function topbar() {
    return (
      '<header class="topbar"><div class="wrap bar">' +
      '<a class="brand" href="https://wingscrew.com/">' +
      '<img src="icons/logo.webp" width="532" height="720" alt="" />' +
      "<span>WingsCrew</span></a>" +
      '<a class="home-link" href="#/">Cooks</a>' +
      "</div></header>"
    );
  }

  function openCount() {
    var list = shopping();
    var n = 0;
    list.items.forEach(function (item) {
      if (!state.checked[item.id]) n += 1;
    });
    return n;
  }

  function tabbar() {
    var here = route().name;
    var current = here === "recipe" || here === "home" ? "home" : here;
    function tab(id, href, label, glyph) {
      var on = current === id;
      var count = id === "list" ? openCount() : 0;
      return (
        '<a class="tab" href="' + href + '"' + (on ? ' aria-current="page"' : "") + ">" +
        icon(glyph) +
        "<span>" + label + "</span>" +
        (count ? '<span class="badge-count">' + count + "</span>" : "") +
        "</a>"
      );
    }
    return (
      '<nav class="tabbar" aria-label="Cookbook">' +
      tab("home", "#/", "Recipes", "book") +
      tab("got", "#/got", "What I've got", "pot") +
      tab("list", "#/list", "List", "bag") +
      "</nav>"
    );
  }

  function footer() {
    return '<footer class="wrap"><p class="legal">© 2026 WingsCrew. All rights reserved.</p></footer>';
  }

  function shell(body, cook) {
    document.body.classList.toggle("has-tabs", !cook);
    document.body.classList.toggle("cook-page", !!cook);
    return topbar() + '<main id="main" class="wrap">' + body + "</main>" + (cook ? "" : footer() + tabbar());
  }

  function homeView() {
    var sections = P.sectionList(state.recipes);
    if (sections.indexOf(state.section) === -1) state.section = sections[0] || "Breakfast";
    var chips = sections.map(function (name) {
      var on = !state.query.trim() && name === state.section;
      return (
        '<button type="button" class="chip" data-action="section" data-section="' + escapeHtml(name) +
        '" aria-pressed="' + (on ? "true" : "false") + '">' + escapeHtml(name) + "</button>"
      );
    }).join("");
    var recipes = visibleRecipes();
    var heading = state.query.trim() ? "Search" : state.section;
    var empty = state.query.trim()
      ? "Nothing matches that search."
      : "No recipes in " + state.section + " yet.";
    return shell(
      "<h1>" + escapeHtml(heading) + "</h1>" +
      '<p class="lede">Budget recipes for home in Bastrop.</p>' +
      '<div class="sections" role="toolbar" aria-label="Sections">' + chips + "</div>" +
      '<div class="tools">' +
      '<input class="search" id="search" type="search" enterkeyhint="search" placeholder="Search recipes" value="' +
      escapeHtml(state.query) + '" aria-label="Search recipes" />' +
      '<label class="select-wrap"><span class="sr-only">Sort</span>' +
      '<select id="sort" aria-label="Sort recipes" data-action="sort">' +
      '<option value="book"' + (state.sort === "book" ? " selected" : "") + ">Cookbook order</option>" +
      '<option value="rating"' + (state.sort === "rating" ? " selected" : "") + ">Top rated</option>" +
      '<option value="title"' + (state.sort === "title" ? " selected" : "") + ">A to Z</option>" +
      "</select></label></div>" +
      '<div class="stack">' +
      (recipes.length ? recipes.map(card).join("") : '<p class="empty">' + escapeHtml(empty) + "</p>") +
      "</div>"
    );
  }

  function detailView(id) {
    var recipe = recipeById(id);
    if (!recipe) {
      return shell('<a class="back" href="#/">Back</a><h1>Recipe not found</h1><p class="empty">That one is not in the book.</p>');
    }
    var parts = P.recipeParts(recipe);
    var ingredients = parts.map(function (part) {
      var tag = part.optional ? "optional" : part.staple ? "on hand" : "";
      return (
        "<li><span>" + escapeHtml(part.raw) +
        (tag ? ' <span class="tag">' + tag + "</span>" : "") +
        "</span>" +
        (part.amount ? '<span class="amt">' + escapeHtml(part.amount) + "</span>" : "") +
        "</li>"
      );
    }).join("");
    var url = safeUrl(P.sourceUrl(recipe));
    var site = P.siteLabel(recipe);
    var original = P.isOriginal(recipe);
    var steps = "";
    if (original && Array.isArray(recipe.steps) && recipe.steps.length) {
      steps =
        '<section class="block"><h2>Steps</h2><ol class="steps">' +
        recipe.steps.map(function (step) { return "<li>" + escapeHtml(step) + "</li>"; }).join("") +
        "</ol></section>";
    }
    var noteText = recipe.notes ? String(recipe.notes).trim() : "";
    var notes = noteText
      ? '<section class="block"><h2>Notes</h2><p class="summary">' + escapeHtml(noteText) + "</p></section>"
      : "";
    var cook = Array.isArray(recipe.steps) && recipe.steps.length
      ? '<a class="primary" href="#/cook/' + encodeURIComponent(recipe.id) + '/1">Cook</a>'
      : "";
    var source = !original && url
      ? '<p class="source"><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">Full recipe at ' +
        escapeHtml(site || "the source") + "</a></p>"
      : "";
    return shell(
      '<a class="back" href="#/">Back</a>' +
      '<article class="detail">' +
      badges(recipe) +
      "<h1>" + escapeHtml(recipe.title) + "</h1>" +
      ratingRow(recipe) +
      (metaLine(recipe) ? '<p class="meta">' + escapeHtml(metaLine(recipe)) + "</p>" : "") +
      '<p class="summary">' + escapeHtml(P.summary(recipe)) + "</p>" +
      seasoningHtml(recipe) +
      notes +
      '<div class="actions">' + cook + pickButton(recipe.id) + "</div>" +
      source +
      '<section class="block"><h2>Ingredients</h2><ul class="ingredients">' + ingredients + "</ul></section>" +
      steps +
      "</article>"
    );
  }

  function gotView() {
    var chips = P.pantryChips(state.recipes);
    var byAisle = {};
    chips.forEach(function (chip) {
      if (!byAisle[chip.aisle]) byAisle[chip.aisle] = [];
      byAisle[chip.aisle].push(chip);
    });
    var aisles = P.AISLES.map(function (aisle) {
      var group = byAisle[aisle];
      if (!group || !group.length) return "";
      var buttons = group.map(function (chip) {
        var on = state.pantry.indexOf(chip.id) !== -1;
        return (
          '<button type="button" class="chip" data-action="pantry" data-id="' + escapeHtml(chip.id) +
          '" aria-pressed="' + (on ? "true" : "false") + '">' + escapeHtml(chip.label) + "</button>"
        );
      }).join("");
      return '<h2 class="aisle-label">' + escapeHtml(aisle) + '</h2><div class="pantry">' + buttons + "</div>";
    }).join("");

    var matched = P.matchBook(state.recipes, state.pantry);
    var can = matched.canMake.map(function (row) { return card(row.recipe); }).join("");
    var almost = matched.almost.map(function (row) {
      var missing = P.joinAnd(row.missing.map(function (part) { return part.label.toLowerCase(); }));
      return card(row.recipe).replace(
        "</article>",
        '<p class="note">Missing ' + escapeHtml(missing) + ".</p></article>"
      );
    }).join("");
    var results = "";
    if (!state.pantry.length) {
      results = '<p class="empty">Tap what you already have. Recipes you can cook show up here.</p>';
    } else if (!can && !almost) {
      results = '<p class="empty">Nothing is close yet. A few more taps usually does it.</p>';
    } else {
      if (can) results += '<h2 class="aisle-label">You can make these</h2><div class="stack">' + can + "</div>";
      if (almost) results += '<h2 class="aisle-label">One or two items short</h2><div class="stack">' + almost + "</div>";
    }

    return shell(
      "<h1>What I've got</h1>" +
      '<p class="lede">Salt, pepper, cooking oil, and water are already counted as on hand.</p>' +
      (state.pantry.length
        ? '<p class="actions"><button type="button" class="ghost" data-action="clear-pantry">Clear</button></p>'
        : "") +
      aisles +
      results
    );
  }

  function shopping() {
    return P.buildList(state.recipes, state.picked, state.pantry, state.picks);
  }

  function brandLine(item) {
    var view = P.brandView(item.brand);
    if (!view) return "";
    var bits = [];
    if (view.product) bits.push(view.product);
    if (view.size) bits.push(view.size);
    if (view.price) bits.push(view.price);
    var name = bits.join(", ");
    var linked = view.url
      ? '<a href="' + escapeHtml(view.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(name || view.product) + "</a>"
      : escapeHtml(name);
    var where = view.store ? " at " + escapeHtml(view.store) : "";
    return "Best buy: " + (name || view.store) + (view.store ? " at " + view.store : "");
  }

  function listView() {
    var built = shopping();
    var note = P.priceNote(built.items);
    var pickedRecipes = state.picked.map(recipeById).filter(Boolean);
    var chosen = pickedRecipes.map(function (recipe) {
      return (
        '<button type="button" class="chip" data-action="pick" data-id="' + escapeHtml(recipe.id) + '">' +
        escapeHtml(recipe.title) + " ×</button>"
      );
    }).join("");
    var groups = built.groups.map(function (group) {
      var items = group.items.map(function (item) {
        var on = !!state.checked[item.id];
        var view = P.brandView(item.brand);
        var brand = "";
        if (view) {
          var bits = [];
          if (view.product) bits.push(view.product);
          if (view.size) bits.push(view.size);
          if (view.price) bits.push(view.price);
          var name = bits.join(", ");
          var linked = view.url && name
            ? '<a href="' + escapeHtml(view.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(name) + "</a>"
            : escapeHtml(name);
          brand =
            '<p class="best">Best buy: ' + linked +
            (view.store ? " at " + escapeHtml(view.store) : "") + "</p>" +
            (view.why ? '<p class="why">' + escapeHtml(view.why) + "</p>" : "");
        }
        return (
          '<label class="check' + (on ? " on" : "") + '">' +
          '<input type="checkbox" data-action="check" data-id="' + escapeHtml(item.id) + '"' +
          (on ? " checked" : "") + " />" +
          "<span><span class=\"item-name\">" + escapeHtml(item.label) + "</span>" +
          (item.qty ? '<span class="meta"> ' + escapeHtml(item.qty) + "</span>" : "") +
          (item.recipes.length ? '<span class="meta"> · ' + escapeHtml(item.recipes.join(", ")) + "</span>" : "") +
          brand +
          "</span></label>"
        );
      }).join("");
      return '<h2 class="aisle-label">' + escapeHtml(group.aisle) + '</h2><div class="stack">' + items + "</div>";
    }).join("");

    var openItems = [];
    built.groups.forEach(function (group) {
      group.items.forEach(function (item) {
        if (!state.checked[item.id]) openItems.push(item);
      });
    });
    var stores = S.adapters().map(function (store) {
      if (store.kind === "cart") {
        return '<button type="button" class="store" data-action="cart" data-store="' + escapeHtml(store.id) + '">' +
          escapeHtml(store.label) + "</button>";
      }
      return '<button type="button" class="store" data-action="store" data-store="' + escapeHtml(store.id) + '">' +
        escapeHtml(store.label) + "</button>";
    }).join("");
    var share = navigator.share
      ? '<button type="button" class="ghost" data-action="share">Share</button>'
      : "";

    var body = "<h1>Shopping list</h1>";
    if (!state.picked.length) {
      body += '<p class="empty">Add recipes from the book. Anything you marked in What I\'ve got is left off.</p>';
    } else if (!built.items.length) {
      body += '<p class="lede">From the recipes you picked. Everything else is already on hand.</p>';
      body += '<div class="chosen">' + chosen + "</div>";
      body += '<p class="empty">Nothing to buy. The pantry covers this list.</p>';
    } else {
      body += '<p class="lede">Grouped for the store. Checked items stay until you take the recipe off.</p>';
      if (note) body += '<p class="price-note">' + escapeHtml(note) + "</p>";
      body += '<div class="chosen" aria-label="Recipes on this list">' + chosen + "</div>";
      body += groups;
      body += '<div class="store-row">' +
        '<button type="button" class="primary" data-action="copy">Copy list</button>' +
        share + stores + "</div>";
      body += '<p class="note">Store buttons open a search for each item still to buy. A browser may ask before it allows more than one tab.</p>';
    }
    return shell(body);
  }

  function cookView(id, step) {
    var recipe = recipeById(id);
    if (!recipe) {
      return shell('<a class="back" href="#/">Back</a><h1>Recipe not found</h1>', true);
    }
    var steps = Array.isArray(recipe.steps) ? recipe.steps : [];
    if (!steps.length) {
      return shell(
        '<a class="back" href="#/recipe/' + encodeURIComponent(id) + '">Back</a><h1>' +
        escapeHtml(recipe.title) + '</h1><p class="empty">No steps in this one.</p>',
        true
      );
    }
    var index = Math.min(Math.max(step, 1), steps.length);
    var base = recipe.seasoning && recipe.seasoning.base ? String(recipe.seasoning.base).trim() : "";
    if (/^none\b/i.test(base)) base = "";
    var wake = "wakeLock" in navigator
      ? '<button type="button" class="ghost wake" data-action="wake" aria-pressed="' +
        (state.wakeOn ? "true" : "false") + '">' +
        (state.wakeOn ? "Screen stays on" : "Keep screen on") + "</button>"
      : "";
    return shell(
      '<div class="cook">' +
      '<div class="cook-top"><a class="back" href="#/recipe/' + encodeURIComponent(id) + '">Done</a>' +
      '<p class="meta">' + escapeHtml(recipe.title) + "</p></div>" +
      (base ? '<p class="season-reminder"><span>Seasoning</span>' + escapeHtml(base) + "</p>" : "") +
      '<p class="step-text" id="step">' + escapeHtml(steps[index - 1]) + "</p>" +
      '<div class="cook-nav">' +
      '<button type="button" class="primary" data-action="cook-step" data-step="' + (index - 1) + '"' +
      (index === 1 ? " disabled" : "") + ">Back</button>" +
      '<p class="counter">Step ' + index + " of " + steps.length + "</p>" +
      '<button type="button" class="primary" data-action="cook-step" data-step="' + (index + 1) + '"' +
      (index === steps.length ? " disabled" : "") + ">Next</button>" +
      "</div>" +
      wake +
      '<p class="legal">© 2026 WingsCrew. All rights reserved.</p>' +
      "</div>",
      true
    );
  }

  function view() {
    if (!state.ready) {
      return shell("<h1>Cooks</h1><p class=\"lede\">Loading the cookbook…</p>");
    }
    if (state.error) {
      return shell("<h1>Cooks</h1><p class=\"empty\">" + escapeHtml(state.error) + "</p>");
    }
    var here = route();
    if (here.name === "recipe") return detailView(here.id);
    if (here.name === "got") return gotView();
    if (here.name === "list") return listView();
    if (here.name === "cook") return cookView(here.id, here.step);
    return homeView();
  }

  function render(opts) {
    opts = opts || {};
    var root = document.getElementById("app");
    if (!root) return;
    var y = window.scrollY;
    var focusId = "";
    var sel = null;
    if (opts.stay && document.activeElement && document.activeElement.id) {
      focusId = document.activeElement.id;
      sel = document.activeElement.selectionStart;
    }
    root.innerHTML = view();
    document.title = (function () {
      var here = route();
      if (here.name === "recipe") {
        var recipe = recipeById(here.id);
        return (recipe ? recipe.title + " · " : "") + "WingsCrew Cooks";
      }
      if (here.name === "got") return "What I've got · WingsCrew Cooks";
      if (here.name === "list") return "Shopping list · WingsCrew Cooks";
      if (here.name === "cook") return "Cook · WingsCrew Cooks";
      return "WingsCrew Cooks";
    })();
    if (focusId) {
      var el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (typeof sel === "number" && el.setSelectionRange) {
          try { el.setSelectionRange(sel, sel); } catch (error) { /* number inputs */ }
        }
      }
      window.scrollTo(0, y);
      return;
    }
    if (opts.nav) {
      var heading = root.querySelector("h1, .step-text");
      if (heading) {
        if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
        try { heading.focus({ preventScroll: true }); } catch (error) { heading.focus(); }
      }
      window.scrollTo(0, 0);
    }
  }

  function listPayload() {
    var built = shopping();
    return built.groups.map(function (group) {
      return {
        aisle: group.aisle,
        items: group.items.map(function (item) {
          var line = brandLine(item);
          return {
            id: item.id,
            label: item.label,
            qty: item.qty,
            checked: !!state.checked[item.id],
            brandLine: line,
          };
        }),
      };
    });
  }

  function openItems() {
    var items = [];
    shopping().groups.forEach(function (group) {
      group.items.forEach(function (item) {
        if (!state.checked[item.id]) items.push(item);
      });
    });
    return items;
  }

  function storeById(id) {
    var list = S.adapters();
    var i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function onClick(event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;
    var action = target.getAttribute("data-action");
    if (action === "section") {
      state.section = target.getAttribute("data-section") || state.section;
      state.query = "";
      render({ nav: true });
      return;
    }
    if (action === "pick") {
      togglePick(target.getAttribute("data-id"));
      render({ stay: true });
      return;
    }
    if (action === "pantry") {
      togglePantry(target.getAttribute("data-id"));
      render({ stay: true });
      return;
    }
    if (action === "clear-pantry") {
      state.pantry = [];
      save();
      render({ nav: true });
      return;
    }
    if (action === "copy") {
      var text = S.formatList(listPayload());
      S.copyText(text).then(function () {
        say("List copied.");
      }).catch(function () {
        say("Couldn't copy the list.");
      });
      return;
    }
    if (action === "share") {
      var shared = S.formatList(listPayload());
      S.shareText(shared).catch(function (error) {
        if (error && error.name === "AbortError") return;
        say("Couldn't open share.");
      });
      return;
    }
    if (action === "store") {
      var store = storeById(target.getAttribute("data-store"));
      var items = openItems();
      if (!store || !items.length) {
        say(items.length ? "That store is not set up." : "Everything on the list is checked.");
        return;
      }
      var urls = S.openSearches(store, items);
      say("Opening " + urls.length + " " + store.label + " search" + (urls.length === 1 ? "" : "es") + ". Allow pop-ups if some tabs don't show.");
      return;
    }
    if (action === "cart") {
      var cart = storeById(target.getAttribute("data-store"));
      if (!cart || typeof cart.fill !== "function") {
        say("Cart fill is not set up for that store.");
        return;
      }
      Promise.resolve(cart.fill(openItems())).catch(function () {
        say("Cart fill is not set up yet.");
      });
      return;
    }
    if (action === "cook-step") {
      if (target.disabled) return;
      var here = route();
      var next = parseInt(target.getAttribute("data-step"), 10);
      if (!here.id || !next) return;
      location.hash = "#/cook/" + encodeURIComponent(here.id) + "/" + next;
      return;
    }
    if (action === "wake") {
      toggleWake();
    }
  }

  function toggleWake() {
    if (!("wakeLock" in navigator)) return;
    if (wakeLock) {
      wakeLock.release().catch(function () {});
      wakeLock = null;
      state.wakeOn = false;
      render({ stay: true });
      return;
    }
    navigator.wakeLock.request("screen").then(function (sentinel) {
      wakeLock = sentinel;
      state.wakeOn = true;
      sentinel.addEventListener("release", function () {
        if (wakeLock === sentinel) wakeLock = null;
      });
      render({ stay: true });
    }).catch(function () {
      state.wakeOn = false;
      say("This phone didn't keep the screen on.");
      render({ stay: true });
    });
  }

  function onChange(event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    var action = target.getAttribute("data-action");
    if (action === "sort") {
      state.sort = target.value;
      save();
      render({ stay: true });
      return;
    }
    if (action === "check") {
      state.checked[target.getAttribute("data-id")] = !!target.checked;
      save();
      render({ stay: true });
    }
  }

  function onInput(event) {
    if (event.target && event.target.id === "search") {
      state.query = event.target.value;
      render({ stay: true });
    }
  }

  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);
  document.addEventListener("input", onInput);
  window.addEventListener("hashchange", function () {
    if (route().name !== "cook" && wakeLock) {
      wakeLock.release().catch(function () {});
      wakeLock = null;
      state.wakeOn = false;
    }
    render({ nav: true });
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && state.wakeOn && !wakeLock && route().name === "cook") {
      navigator.wakeLock.request("screen").then(function (sentinel) {
        wakeLock = sentinel;
      }).catch(function () {});
    }
  });

  function boot() {
    state.pantry = loadJson(KEYS.pantry, []);
    state.picked = loadJson(KEYS.picked, []);
    state.checked = loadJson(KEYS.checked, {});
    if (!Array.isArray(state.pantry)) state.pantry = [];
    if (!Array.isArray(state.picked)) state.picked = [];
    if (!state.checked || typeof state.checked !== "object" || Array.isArray(state.checked)) state.checked = {};
    var savedSort = "";
    try { savedSort = localStorage.getItem(KEYS.sort) || ""; } catch (error) { savedSort = ""; }
    if (savedSort === "book" || savedSort === "rating" || savedSort === "title") state.sort = savedSort;

    render();
    var recipesPromise = fetch("data/recipes.json").then(function (response) {
      if (!response.ok) throw new Error("recipes");
      return response.json();
    });
    var picksPromise = fetch("data/brand_picks.json").then(function (response) {
      if (!response.ok) return [];
      return response.json().then(P.normalizePicks).catch(function () { return []; });
    }).catch(function () { return []; });

    Promise.all([recipesPromise, picksPromise]).then(function (results) {
      state.recipes = Array.isArray(results[0]) ? results[0] : [];
      state.picks = results[1];
      state.ready = true;
      render({ nav: true });
    }).catch(function () {
      state.ready = true;
      state.error = "The cookbook didn't load. Connect once, then you can use it offline.";
      render({ nav: true });
    });

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }

  boot();
})();
