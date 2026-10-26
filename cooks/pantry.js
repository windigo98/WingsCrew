/* Ingredient merging, sections, and the shopping list.
   Salt, pepper, cooking oil, and water are treated as already on hand.
   Near-duplicates (cheddar and sharp cheese, every tortilla, every potato)
   share one pantry chip. A new ingredient with no rule still gets a chip. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CooksPantry = api;
})(typeof window !== "undefined" ? window : this, function () {
  var AISLES = [
    "Produce",
    "Meat",
    "Dairy and Eggs",
    "Bakery and Tortillas",
    "Pantry and Canned",
    "Spices",
    "Frozen",
    "Other",
  ];

  /* Known order. Anything else in the recipe file is added after these. */
  var PREFERRED_SECTIONS = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Grill",
    "Baking",
    "Instant Pot",
    "Bachelor Meals",
    "Bachelor Sweets",
  ];

  var HOST_NAMES = {
    "budgetbytes.com": "Budget Bytes",
    "wellplated.com": "Well Plated",
    "seriouseats.com": "Serious Eats",
    "pressurecookingtoday.com": "Pressure Cooking Today",
    "bbcgoodfood.com": "BBC Good Food",
    "laurafuentes.com": "Laura Fuentes",
    "eatingwell.com": "EatingWell",
    "spendwithpennies.com": "Spend With Pennies",
    "allrecipes.com": "Allrecipes",
    "skinnytaste.com": "Skinnytaste",
    "natashaskitchen.com": "Natasha's Kitchen",
  };

  var FILLER = {
    kosher: 1, sea: 1, table: 1, freshly: 1, fresh: 1, ground: 1, black: 1,
    white: 1, divided: 1, and: 1, or: 1, to: 1, taste: 1, for: 1, soaking: 1,
    plus: 1, more: 1, if: 1, needed: 1, light: 1, lightly: 1, extra: 1,
    virgin: 1, olive: 1, canola: 1, vegetable: 1, cooking: 1, neutral: 1,
    grapeseed: 1, coconut: 1, high: 1, heat: 1, spray: 1, other: 1, melted: 1,
    cooled: 1, drizzling: 1, cranks: 1, from: 1, the: 1, a: 1, an: 1, of: 1,
    in: 1, with: 1, on: 1, into: 1, about: 1, softened: 1, cubed: 1,
    unsalted: 1, salted: 1, fine: 1,
  };

  /* First match wins. Specific foods come before the broad ones. */
  var RULES = [
    [/ham.*bacon|bacon.*ham/, "ham-or-bacon", "Ham or bacon", "Meat"],
    [/ground turkey/, "ground-turkey", "Ground turkey", "Meat"],
    [/chicken thigh/, "chicken-thighs", "Chicken thighs", "Meat"],
    [/chicken breast/, "chicken-breast", "Chicken breast", "Meat"],
    [/breakfast sausage|\bsausage\b/, "breakfast-sausage", "Breakfast sausage", "Meat"],
    [/ham bone/, "ham-bone", "Ham bone", "Meat"],
    [/\bbacon\b/, "bacon", "Bacon", "Meat"],
    [/\bham\b/, "ham", "Ham", "Meat"],
    [/skirt steak|flank steak/, "fajita-steak", "Skirt or flank steak", "Meat"],
    [/rib-?eye|strip steak/, "ribeye", "Ribeye", "Meat"],
    [/\btuna\b/, "tuna", "Tuna", "Meat"],

    [/peanut butter/, "peanut-butter", "Peanut butter", "Pantry and Canned"],
    [/cream cheese/, "cream-cheese", "Cream cheese", "Dairy and Eggs"],
    [/cotija|queso fresco/, "cotija", "Cotija or queso fresco", "Dairy and Eggs"],
    [/cheddar|sharp cheese|shredded cheese|grated cheese|gruyere/, "cheddar", "Cheddar", "Dairy and Eggs"],
    [/greek yogurt/, "greek-yogurt", "Greek yogurt", "Dairy and Eggs"],
    [/sour cream/, "sour-cream", "Sour cream", "Dairy and Eggs"],
    [/\beggs?\b/, "eggs", "Eggs", "Dairy and Eggs"],
    [/ghee|\bbutter\b/, "butter", "Butter", "Dairy and Eggs"],
    [/coconut milk/, "coconut-milk", "Coconut milk", "Pantry and Canned"],
    [/\bmilk\b/, "milk", "Milk", "Dairy and Eggs"],

    [/pie crust/, "pie-crust", "Pie crust", "Bakery and Tortillas"],
    [/breadcrumb/, "breadcrumbs", "Breadcrumbs", "Bakery and Tortillas"],
    [/tortilla chip.*potato|potato.*tortilla chip/, "chips-or-potatoes", "Tortilla chips or potatoes", "Pantry and Canned"],
    [/tortilla chip/, "tortilla-chips", "Tortilla chips", "Pantry and Canned"],
    [/tortilla/, "tortillas", "Tortillas", "Bakery and Tortillas"],

    [/15 bean|hambeens|hurst/, "15-bean-soup", "15 bean soup mix", "Pantry and Canned"],
    [/spanish rice/, "spanish-rice", "Spanish rice mix", "Pantry and Canned"],
    [/dried black bean/, "dried-black-beans", "Dried black beans", "Pantry and Canned"],
    [/black bean/, "black-beans", "Black beans", "Pantry and Canned"],
    [/pinto bean/, "pinto-beans", "Pinto beans", "Pantry and Canned"],
    [/white bean/, "white-beans", "White beans", "Pantry and Canned"],
    [/brown lentil/, "brown-lentils", "Brown lentils", "Pantry and Canned"],
    [/red lentil/, "red-lentils", "Red lentils", "Pantry and Canned"],
    [/lentil/, "lentils", "Lentils", "Pantry and Canned"],
    [/crispy rice|rice cereal|rice krispies?/, "rice-cereal", "Crispy rice cereal", "Pantry and Canned"],
    [/cooked .*rice|cooled rice|prepared white rice|prepared brown rice|short-grain/, "cooked-rice", "Cooked rice", "Pantry and Canned"],
    [/\brice\b/, "rice", "Rice", "Pantry and Canned"],
    [/rolled oat|quick-cooking oat|quick cooking oat|\boats\b/, "oats", "Oats", "Pantry and Canned"],
    [/whole wheat flour|all-purpose flour|\bflour\b/, "flour", "Flour", "Pantry and Canned"],
    [/brown sugar/, "brown-sugar", "Brown sugar", "Pantry and Canned"],
    [/granulated sugar|\bsugar\b/, "sugar", "Sugar", "Pantry and Canned"],
    [/applesauce/, "applesauce", "Applesauce", "Pantry and Canned"],
    [/baking powder/, "baking-powder", "Baking powder", "Pantry and Canned"],
    [/baking soda/, "baking-soda", "Baking soda", "Pantry and Canned"],
    [/cornstarch/, "cornstarch", "Cornstarch", "Pantry and Canned"],
    [/ice cream/, "ice-cream", "Ice cream", "Frozen"],
    [/cocoa/, "cocoa", "Cocoa powder", "Pantry and Canned"],
    [/marshmallow/, "marshmallows", "Marshmallows", "Pantry and Canned"],
    [/chocolate syrup/, "chocolate-syrup", "Chocolate syrup", "Pantry and Canned"],
    [/vanilla/, "vanilla", "Vanilla", "Pantry and Canned"],
    [/chocolate chip/, "chocolate-chips", "Chocolate chips", "Pantry and Canned"],
    [/raisin/, "raisins", "Raisins", "Pantry and Canned"],
    [/\bpeanuts?\b/, "peanuts", "Peanuts", "Pantry and Canned"],
    [/walnut|pecan/, "walnuts", "Walnuts or pecans", "Pantry and Canned"],
    [/maple syrup/, "maple-syrup", "Maple syrup", "Pantry and Canned"],
    [/\bhoney\b/, "honey", "Honey", "Pantry and Canned"],
    [/soy sauce/, "soy-sauce", "Soy sauce", "Pantry and Canned"],
    [/\bmirin\b/, "mirin", "Mirin", "Pantry and Canned"],
    [/\bsake\b/, "sake", "Sake", "Pantry and Canned"],
    [/\bdashi\b/, "dashi", "Dashi", "Pantry and Canned"],
    [/gochujang/, "gochujang", "Gochujang", "Pantry and Canned"],
    [/sriracha|sambal|chili paste|chile paste|hot pepper sauce|hot sauce|tabasco|pepper sauce/, "hot-sauce", "Hot sauce", "Pantry and Canned"],
    [/worcestershire/, "worcestershire", "Worcestershire sauce", "Pantry and Canned"],
    [/mayonnaise|\bmayo\b/, "mayonnaise", "Mayonnaise", "Pantry and Canned"],
    [/dijon/, "dijon", "Dijon mustard", "Pantry and Canned"],
    [/mustard/, "mustard", "Mustard", "Pantry and Canned"],
    [/balsamic/, "balsamic-vinegar", "Balsamic vinegar", "Pantry and Canned"],
    [/apple cider vinegar/, "apple-cider-vinegar", "Apple cider vinegar", "Pantry and Canned"],
    [/red wine vinegar/, "red-wine-vinegar", "Red wine vinegar", "Pantry and Canned"],
    [/rice vinegar/, "rice-vinegar", "Rice vinegar", "Pantry and Canned"],
    [/\bvinegar\b/, "vinegar", "Vinegar", "Pantry and Canned"],
    [/tomato sauce/, "tomato-sauce", "Tomato sauce", "Pantry and Canned"],
    [/rotel/, "rotel", "Rotel", "Pantry and Canned"],
    [/crushed tomato|diced tomato|fire roasted/, "canned-tomatoes", "Canned tomatoes", "Pantry and Canned"],
    [/\bsalsa\b|pico de gallo/, "salsa", "Salsa", "Pantry and Canned"],
    [/broth/, "broth", "Broth", "Pantry and Canned"],
    [/sesame oil/, "sesame-oil", "Sesame oil", "Pantry and Canned"],
    [/chia/, "chia-seeds", "Chia seeds", "Pantry and Canned"],

    [/lemon pepper/, "lemon-pepper", "Lemon pepper", "Spices"],
    [/garlic salt/, "garlic-salt", "Garlic salt", "Spices"],
    [/onion salt/, "onion-salt", "Onion salt", "Spices"],
    [/taco seasoning/, "taco-seasoning", "Taco seasoning", "Spices"],
    [/garam masala/, "garam-masala", "Garam masala", "Spices"],
    [/cardamom/, "cardamom", "Cardamom", "Spices"],
    [/ranch/, "ranch-seasoning", "Ranch seasoning", "Spices"],
    [/\bbasil\b/, "basil", "Basil", "Spices"],
    [/chipotle/, "chipotle-powder", "Chipotle powder", "Spices"],
    [/chili powder|chilli powder/, "chili-powder", "Chili powder", "Spices"],
    [/smoked paprika/, "smoked-paprika", "Smoked paprika", "Spices"],
    [/\bpaprika\b/, "paprika", "Paprika", "Spices"],
    [/cumin/, "cumin", "Cumin", "Spices"],
    [/coriander/, "coriander", "Coriander", "Spices"],
    [/cinnamon/, "cinnamon", "Cinnamon", "Spices"],
    [/nutmeg/, "nutmeg", "Nutmeg", "Spices"],
    [/cayenne/, "cayenne", "Cayenne", "Spices"],
    [/oregano/, "oregano", "Oregano", "Spices"],
    [/rosemary/, "rosemary", "Rosemary", "Spices"],
    [/tarragon or thyme|parsley.*thyme/, "fresh-herbs", "Fresh herbs", "Produce"],
    [/thyme|tarragon/, "thyme", "Thyme", "Spices"],
    [/\bsage\b/, "sage", "Sage", "Spices"],
    [/bay leaves|bay leaf/, "bay-leaves", "Bay leaves", "Spices"],
    [/turmeric/, "turmeric", "Turmeric", "Spices"],
    [/ground ginger/, "ground-ginger", "Ground ginger", "Spices"],
    [/onion powder/, "onion-powder", "Onion powder", "Spices"],
    [/garlic powder/, "garlic-powder", "Garlic powder", "Spices"],
    [/italian seasoning/, "italian-seasoning", "Italian seasoning", "Spices"],
    [/adobo/, "adobo", "Adobo", "Spices"],
    [/bayou blend/, "bayou-blend", "Bayou Blend", "Spices"],
    [/nature.?s seasoning/, "natures-seasoning", "Nature's Seasoning", "Spices"],
    [/seasoning salt/, "seasoning-salt", "Seasoning salt", "Spices"],
    [/red pepper flake|pepper flake/, "red-pepper-flakes", "Red pepper flakes", "Spices"],

    [/grape juice concentrate|frozen grape/, "grape-concentrate", "Grape juice concentrate", "Frozen"],
    [/cran-grape|\bgrape juice\b/, "grape-juice", "Grape juice", "Pantry and Canned"],
    [/\bice\b/, "ice", "Ice", "Frozen"],
    [/frozen corn/, "frozen-corn", "Frozen corn", "Frozen"],
    [/canned corn|\bcan corn\b/, "canned-corn", "Canned corn", "Pantry and Canned"],
    [/frozen green bean/, "frozen-green-beans", "Frozen green beans", "Frozen"],
    [/santa fe/, "santa-fe-vegetables", "Santa Fe vegetables", "Frozen"],
    [/peas/, "peas", "Peas", "Frozen"],
    [/green bean/, "green-beans", "Green beans", "Produce"],

    [/cilantro/, "cilantro", "Cilantro", "Produce"],
    [/\bparsley\b/, "parsley", "Parsley", "Produce"],
    [/green onion|scallion|chive/, "green-onions", "Green onions", "Produce"],
    [/\bdill\b/, "dill", "Dill", "Produce"],
    [/cauliflower/, "cauliflower", "Cauliflower", "Produce"],
    [/red onion/, "red-onion", "Red onion", "Produce"],
    [/onion/, "onion", "Onion", "Produce"],
    [/garlic/, "garlic", "Garlic", "Produce"],
    [/bell pepper/, "bell-pepper", "Bell pepper", "Produce"],
    [/jalape/, "jalapeno", "Jalapeño", "Produce"],
    [/cherry tomato|\btomato/, "tomato", "Tomato", "Produce"],
    [/russet|yukon|potato/, "potatoes", "Potatoes", "Produce"],
    [/carrot/, "carrots", "Carrots", "Produce"],
    [/celery/, "celery", "Celery", "Produce"],
    [/coleslaw/, "broccoli-slaw", "Broccoli slaw", "Produce"],
    [/cabbage/, "cabbage", "Cabbage", "Produce"],
    [/spinach/, "spinach", "Spinach", "Produce"],
    [/chard/, "chard", "Swiss chard", "Produce"],
    [/lettuce/, "lettuce", "Lettuce", "Produce"],
    [/avocado/, "avocado", "Avocado", "Produce"],
    [/lime/, "lime", "Lime", "Produce"],
    [/lemon/, "lemon", "Lemon", "Produce"],
    [/zucchini/, "zucchini", "Zucchini", "Produce"],
    [/mushroom/, "mushrooms", "Mushrooms", "Produce"],
    [/radish/, "radishes", "Radishes", "Produce"],
    [/ginger/, "ginger", "Ginger", "Produce"],
    [/banana/, "bananas", "Bananas", "Produce"],
    [/ears corn|\bcorn\b/, "corn", "Corn", "Produce"],
    [/guacamole/, "guacamole", "Guacamole", "Produce"],
  ];

  function sourceUrl(recipe) {
    if (!recipe || recipe.sourceUrl == null) return "";
    var value = String(recipe.sourceUrl).trim();
    return value;
  }

  function siteLabel(recipe) {
    if (!recipe) return "";
    if (recipe.site) return String(recipe.site).trim();
    var url = sourceUrl(recipe);
    if (!url) return "";
    try {
      var host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
      return HOST_NAMES[host] || host;
    } catch (error) {
      return "";
    }
  }

  function matchText(raw) {
    return String(raw || "")
      .toLowerCase()
      .replace(/\(.*?\)/g, " ")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9%+.\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isOptional(raw) {
    var text = String(raw || "");
    if (/\boptional\b/i.test(text)) return true;
    /* A platter of toppings ("lime, cilantro, sour cream… for serving"), not the dish. */
    if (/\b(for serving|for garnish|to serve)\b/i.test(text) && (text.match(/,/g) || []).length >= 2) {
      return true;
    }
    return false;
  }

  function isJdTag(tag) {
    return String(tag || "").toLowerCase().replace(/[^a-z]/g, "") === "jdoriginal";
  }

  function isOriginal(recipe) {
    if (!recipe) return false;
    var tags = recipe.tags || [];
    var i;
    for (i = 0; i < tags.length; i++) {
      if (isJdTag(tags[i])) return true;
    }
    return !sourceUrl(recipe);
  }

  function isAssumed(raw) {
    var lower = String(raw || "").toLowerCase();
    if (/cooking spray|nonstick spray|oil spray/.test(lower)) return true;
    if (/sesame|truffle|chili oil|chile oil|flavored oil/.test(lower)) return false;
    if (/\boil\b/.test(lower)) return true;
    var text = lower.replace(/\(.*?\)/g, " ").replace(/[^a-z\s-]/g, " ");
    var words = text.split(/[\s-]+/).filter(Boolean);
    if (!words.length) return false;
    var meaningful = words.filter(function (word) {
      return !FILLER[word] && word !== "salt" && word !== "pepper" && word !== "oil" && word !== "water";
    });
    if (meaningful.length) return false;
    return words.some(function (word) {
      return word === "salt" || word === "pepper" || word === "oil" || word === "water";
    });
  }

  function slug(text) {
    var value = String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return value || "item";
  }

  function titleCase(text) {
    var clean = String(text || "").replace(/\s+/g, " ").trim();
    if (!clean) return "Item";
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  function guessAisle(text) {
    var value = text.toLowerCase();
    if (/frozen/.test(value)) return "Frozen";
    if (/tortilla|bread|crust|bun/.test(value)) return "Bakery and Tortillas";
    if (/chicken|beef|steak|bacon|ham|turkey|sausage|tuna|pork/.test(value)) return "Meat";
    if (/milk|cheese|egg|butter|yogurt|cream/.test(value)) return "Dairy and Eggs";
    if (/powder|seasoning|cumin|paprika|cinnamon|oregano|thyme|spice|pepper flake|salt/.test(value)) return "Spices";
    if (/onion|pepper|potato|tomato|lettuce|cilantro|lime|lemon|avocado|carrot|garlic|zucchini|spinach|cabbage|banana|herb/.test(value)) return "Produce";
    if (/broth|bean|rice|flour|sugar|sauce|oat|can |canned|vinegar|honey|oil/.test(value)) return "Pantry and Canned";
    return "Other";
  }

  function classify(raw) {
    var text = matchText(raw);
    var optional = isOptional(raw);
    if (isAssumed(raw)) {
      return { id: "on-hand", label: "On hand", aisle: "Other", staple: true, optional: optional };
    }
    var i;
    for (i = 0; i < RULES.length; i++) {
      if (RULES[i][0].test(text)) {
        return {
          id: RULES[i][1],
          label: RULES[i][2],
          aisle: RULES[i][3],
          staple: false,
          optional: optional,
        };
      }
    }
    var label = titleCase(text);
    return {
      id: slug(text),
      label: label,
      aisle: guessAisle(text),
      staple: false,
      optional: optional,
    };
  }

  function formatNumber(value) {
    var n = Number(value);
    if (!isFinite(n)) return "";
    var sign = n < 0 ? "-" : "";
    n = Math.abs(Math.round(n * 1000) / 1000);
    var whole = Math.floor(n + 1e-9);
    var frac = n - whole;
    var glyphs = [
      [0.125, "⅛"], [0.25, "¼"], [0.333, "⅓"], [0.375, "⅜"],
      [0.5, "½"], [0.667, "⅔"], [0.75, "¾"],
    ];
    var best = "";
    var bestDiff = 0.045;
    var g;
    for (g = 0; g < glyphs.length; g++) {
      var diff = Math.abs(frac - glyphs[g][0]);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = glyphs[g][1];
      }
    }
    if (frac < 0.04) best = "";
    if (!best && frac >= 0.04) {
      var rounded = Math.round(n * 100) / 100;
      return sign + String(rounded);
    }
    if (best && whole) return sign + whole + " " + best;
    if (best) return sign + best;
    return sign + String(whole);
  }

  function formatAmount(qty, unit) {
    if (qty == null || qty === "") return "";
    var num = formatNumber(qty);
    if (!num) return "";
    var u = unit == null ? "" : String(unit).trim();
    return u ? num + " " + u : num;
  }

  function unitKey(unit) {
    var u = String(unit || "").trim().toLowerCase();
    var map = {
      teaspoon: "tsp", teaspoons: "tsp", tsp: "tsp",
      tablespoon: "tbsp", tablespoons: "tbsp", tbsp: "tbsp",
      cup: "cup", cups: "cup",
      ounce: "oz", ounces: "oz", oz: "oz",
      pound: "lb", pounds: "lb", lb: "lb", lbs: "lb",
      gram: "g", grams: "g", g: "g",
      can: "can", cans: "can",
      clove: "clove", cloves: "clove",
    };
    return map[u] || u;
  }

  function displayUnit(key, qty) {
    var names = {
      tsp: ["tsp", "tsp"],
      tbsp: ["Tbsp", "Tbsp"],
      cup: ["cup", "cups"],
      oz: ["oz", "oz"],
      lb: ["lb", "lb"],
      g: ["g", "g"],
      can: ["can", "cans"],
      clove: ["clove", "cloves"],
    };
    if (!names[key]) return key;
    return Number(qty) === 1 ? names[key][0] : names[key][1];
  }

  function recipeParts(recipe) {
    var list = recipe && Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    return list.map(function (ing) {
      var info = classify(ing && ing.item);
      return {
        id: info.id,
        label: info.label,
        aisle: info.aisle,
        staple: info.staple,
        optional: info.optional,
        qty: ing ? ing.qty : null,
        unit: ing ? ing.unit : "",
        raw: ing && ing.item ? String(ing.item) : "",
        amount: formatAmount(ing && ing.qty, ing && ing.unit),
      };
    });
  }

  function requiredParts(recipe) {
    var seen = {};
    return recipeParts(recipe).filter(function (part) {
      if (part.staple || part.optional || !part.id) return false;
      if (seen[part.id]) return false;
      seen[part.id] = true;
      return true;
    });
  }

  function joinAnd(items) {
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + " and " + items[1];
    return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
  }

  function summary(recipe) {
    var names = [];
    requiredParts(recipe).forEach(function (part) {
      if (names.length < 4) names.push(part.label.toLowerCase());
    });
    var home = recipe && recipe.sections && recipe.sections[0] ? recipe.sections[0] : "Recipe";
    if (!names.length) return home + " recipe.";
    return home + " with " + joinAnd(names) + ".";
  }

  function blurb(recipe) {
    if (recipe && recipe.notes && String(recipe.notes).trim()) return String(recipe.notes).trim();
    return summary(recipe);
  }

  function formatMinutes(total) {
    var n = Number(total);
    if (!isFinite(n) || n <= 0) return "";
    n = Math.round(n);
    if (n < 60) return n + " min";
    var hours = Math.floor(n / 60);
    var mins = n % 60;
    if (!mins) return hours + (hours === 1 ? " hour" : " hours");
    return hours + " hr " + mins + " min";
  }

  function sectionList(recipes) {
    var seen = {};
    (recipes || []).forEach(function (recipe) {
      (recipe.sections || []).forEach(function (name) {
        if (name) seen[String(name)] = true;
      });
    });
    var extras = Object.keys(seen).filter(function (name) {
      return PREFERRED_SECTIONS.indexOf(name) === -1;
    });
    extras.sort(function (a, b) { return a.localeCompare(b); });
    return PREFERRED_SECTIONS.concat(extras);
  }

  function pantryChips(recipes) {
    var map = {};
    (recipes || []).forEach(function (recipe) {
      requiredParts(recipe).forEach(function (part) {
        map[part.id] = { id: part.id, label: part.label, aisle: part.aisle };
      });
    });
    var chips = Object.keys(map).map(function (id) { return map[id]; });
    chips.sort(function (a, b) {
      var aisle = AISLES.indexOf(a.aisle) - AISLES.indexOf(b.aisle);
      if (aisle) return aisle;
      return a.label.localeCompare(b.label);
    });
    return chips;
  }

  function asSet(ids) {
    var set = {};
    (ids || []).forEach(function (id) { if (id) set[id] = true; });
    return set;
  }

  function matchBook(recipes, haveIds) {
    var have = asSet(haveIds);
    var canMake = [];
    var almost = [];
    (recipes || []).forEach(function (recipe) {
      var need = requiredParts(recipe);
      var missing = need.filter(function (part) { return !have[part.id]; });
      if (!missing.length) canMake.push({ recipe: recipe, missing: [] });
      else if (missing.length <= 2) almost.push({ recipe: recipe, missing: missing });
    });
    almost.sort(function (a, b) {
      if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
      return a.recipe.title.localeCompare(b.recipe.title);
    });
    canMake.sort(function (a, b) { return a.recipe.title.localeCompare(b.recipe.title); });
    return { canMake: canMake, almost: almost };
  }

  function formatParts(parts) {
    var totals = {};
    var order = [];
    var incomplete = false;
    parts.forEach(function (part) {
      var qty = Number(part.qty);
      if (part.qty == null || part.qty === "" || !isFinite(qty)) {
        incomplete = true;
        return;
      }
      var key = unitKey(part.unit);
      if (!Object.prototype.hasOwnProperty.call(totals, key)) {
        totals[key] = 0;
        order.push(key);
      }
      totals[key] += qty;
    });
    if (!incomplete && order.length) {
      return order.map(function (key) {
        return formatAmount(totals[key], displayUnit(key, totals[key]));
      }).join(" + ");
    }
    return "";
  }

  function knownAisle(name) {
    return AISLES.indexOf(name) >= 0 ? name : "";
  }

  function buildList(recipes, pickedIds, haveIds, brandPicks) {
    var picked = asSet(pickedIds);
    var have = asSet(haveIds);
    var buckets = {};
    (recipes || []).forEach(function (recipe) {
      if (!picked[recipe.id]) return;
      recipeParts(recipe).forEach(function (part) {
        if (part.staple || part.optional || have[part.id]) return;
        if (!buckets[part.id]) {
          buckets[part.id] = {
            id: part.id,
            label: part.label,
            aisle: part.aisle,
            parts: [],
            recipes: [],
          };
        }
        buckets[part.id].parts.push({
          qty: part.qty,
          unit: part.unit,
          recipeTitle: recipe.title,
        });
        if (buckets[part.id].recipes.indexOf(recipe.title) === -1) {
          buckets[part.id].recipes.push(recipe.title);
        }
      });
    });

    var picks = Array.isArray(brandPicks) ? brandPicks : [];
    Object.keys(buckets).forEach(function (id) {
      var item = buckets[id];
      item.qty = formatParts(item.parts);
      item.brand = matchBrand(item, picks);
      if (item.brand && knownAisle(item.brand.aisle)) item.aisle = item.brand.aisle;
    });

    var groups = AISLES.map(function (aisle) {
      var items = Object.keys(buckets).map(function (id) { return buckets[id]; }).filter(function (item) {
        return item.aisle === aisle;
      });
      items.sort(function (a, b) { return a.label.localeCompare(b.label); });
      return { aisle: aisle, items: items };
    }).filter(function (group) { return group.items.length; });

    return { groups: groups, items: Object.keys(buckets).map(function (id) { return buckets[id]; }) };
  }

  function matchBrand(item, picks) {
    var i;
    for (i = 0; i < picks.length; i++) {
      var pick = picks[i];
      if (!pick || !pick.ingredient) continue;
      var info = classify(pick.ingredient);
      if (info.id === item.id) return pick;
      if (String(pick.ingredient).trim().toLowerCase() === item.label.toLowerCase()) return pick;
    }
    return null;
  }

  function normalizePicks(data) {
    if (Array.isArray(data)) return data.filter(Boolean);
    if (data && Array.isArray(data.picks)) return data.picks.filter(Boolean);
    if (data && typeof data === "object") {
      return Object.keys(data).map(function (key) {
        var row = data[key];
        if (!row || typeof row !== "object" || Array.isArray(row)) return null;
        var copy = {};
        Object.keys(row).forEach(function (field) { copy[field] = row[field]; });
        if (!copy.ingredient) copy.ingredient = key;
        return copy;
      }).filter(Boolean);
    }
    return [];
  }

  function formatCheckedAt(value) {
    if (value == null || value === "") return "";
    var text = String(value).trim();
    var match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    var date = match
      ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
      : new Date(text);
    if (isNaN(date.getTime())) return text;
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function priceNote(items) {
    var seen = {};
    var dates = [];
    (items || []).forEach(function (item) {
      if (!item.brand || item.brand.checkedAt == null || item.brand.checkedAt === "") return;
      var label = formatCheckedAt(item.brand.checkedAt);
      if (!label || seen[label]) return;
      seen[label] = true;
      dates.push(label);
    });
    if (!dates.length) return "";
    if (dates.length === 1) return "Prices as of " + dates[0] + ".";
    return "Prices as of " + dates.slice(0, -1).join(", ") + " and " + dates[dates.length - 1] + ".";
  }

  function storeSide(pick) {
    if (!pick || !pick.bestBuy) return null;
    var store = String(pick.bestBuy.store || "").toLowerCase();
    if (store.indexOf("walmart") >= 0) return pick.walmart || null;
    if (store.indexOf("heb") >= 0 || store.indexOf("h-e-b") >= 0) return pick.heb || null;
    return null;
  }

  function money(value) {
    var n = Number(value);
    if (!isFinite(n)) return "";
    return "$" + n.toFixed(2);
  }

  function brandView(pick) {
    if (!pick || !pick.bestBuy) return null;
    var product = pick.bestBuy.product ? String(pick.bestBuy.product).trim() : "";
    var store = pick.bestBuy.store ? String(pick.bestBuy.store).trim() : "";
    if (!product && !store) return null;
    var side = storeSide(pick);
    var url = side && side.url && /^https?:\/\//i.test(String(side.url)) ? String(side.url) : "";
    return {
      product: product,
      store: store,
      why: pick.bestBuy.why ? String(pick.bestBuy.why).trim() : "",
      price: side ? money(side.price) : "",
      size: side && side.size ? String(side.size).trim() : "",
      url: url,
    };
  }

  return {
    AISLES: AISLES,
    PREFERRED_SECTIONS: PREFERRED_SECTIONS,
    sourceUrl: sourceUrl,
    isOriginal: isOriginal,
    siteLabel: siteLabel,
    classify: classify,
    isAssumed: isAssumed,
    isOptional: isOptional,
    formatAmount: formatAmount,
    formatMinutes: formatMinutes,
    recipeParts: recipeParts,
    requiredParts: requiredParts,
    summary: summary,
    blurb: blurb,
    joinAnd: joinAnd,
    sectionList: sectionList,
    pantryChips: pantryChips,
    matchBook: matchBook,
    buildList: buildList,
    normalizePicks: normalizePicks,
    formatCheckedAt: formatCheckedAt,
    priceNote: priceNote,
    brandView: brandView,
  };
});
