// Caught Red-Handed. Pass-the-phone stays on this device.
// Multi-phone play lives in multi.js. Nothing is saved on a server.
(function () {
  var AGE_KEY = "wingscrew-21plus";
  var ANSWER_MS = 45000;
  var MAX_ANSWER = 240;
  var MIN_PLAYERS = 3;
  var MAX_PLAYERS = 12;
  var CATS = Array.isArray(window.CRH_CATEGORIES) ? window.CRH_CATEGORIES : [];

  var BONUS_DARES = [
    "Read your answer again in a movie-trailer voice.",
    "Give a ten-second toast to the person on your left.",
    "Do your worst celebrity impression until the group groans.",
    "Let the group pick your next drink. Water counts.",
    "Hold a straight face for ten seconds while everyone compliments you.",
    "Swap seats and stay there until the next tile.",
    "Say one sincere compliment and one ridiculous one.",
    "Whisper every sentence you speak until the next tile.",
    "Take a new group selfie and show it. You can delete it after.",
    "Accept a nickname for the next round and answer to it.",
    "Slow-clap the picker like they just won an award.",
    "Retell your answer using only song titles until someone gets it."
  ];

  var RULES = [
    "Each phone: one person hosts and gets a 4-letter code, a link, and a QR code. Everyone else joins with a name. A TV can open the TV page and show that code; one phone taps Join as host. If the phones can't link, pass one phone instead.",
    "3 to 12 players. The host picks 5 or 6 categories, hits Random, or plays the whole board. 100 is cheeky. 500 is the one you will deny later.",
    "The host taps a tile. The prompt shows on every phone. Show on TV, on the host phone, has the big-screen link, a QR code, and how to put it on a television. That screen shows prompts and reveals, not secret answers.",
    "Each player types a secret answer on their own phone. It goes only to the host. Pass-the-phone hides each answer behind a cover before the next person types.",
    "Answers are shuffled and shown with no names attached.",
    "Everyone votes on their own phone. In pass-the-phone, the picker can guess, or the table votes while the phone is handed around.",
    "A correct guess scores that tile's points. Guessing your own answer does not score. You already knew.",
    "The last answer reveals itself. Nobody scores that one.",
    "The author is caught. House rule: an optional sip or bonus dare, or they lose half their score. Drinking is never required.",
    "If someone drops, they can rejoin from the same phone. If the host leaves, the room ends. Highest score wins."
  ];

  var state = {
    screen: "intro",
    names: [],
    nameBuffer: "",
    notice: "",
    selected: {},
    playAll: false,
    options: { timer: false, caughtRule: "sip", guessMode: "picker" },
    players: [],
    pickerIndex: 0,
    tiles: [],
    round: null,
    help: false,
    endConfirm: false,
    called: false,
    autofocus: true,
    answerDraft: "",
    timerId: null,
    timerDeadline: 0,
    timerLeft: 0,
    dareIndex: -1,
    nextPlayerId: 1,
    deckProblems: [],
    handedOff: false
  };

  function appEl() {
    return document.getElementById("crh-app");
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    var key;
    attrs = attrs || {};
    for (key in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
      var value = attrs[key];
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = String(value);
      else if (key === "value") node.value = String(value);
      else if (key === "disabled") {
        node.disabled = true;
        node.setAttribute("disabled", "");
      }
      else node.setAttribute(key, value === true ? "" : String(value));
    }
    var list = Array.isArray(children) ? children : children == null ? [] : [children];
    for (var i = 0; i < list.length; i++) {
      var child = list[i];
      if (child == null || child === false) continue;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    }
    return node;
  }

  function fragment(nodes) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i]) frag.appendChild(nodes[i]);
    }
    return frag;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function focusNode(node) {
    if (!node || typeof node.focus !== "function") return;
    try {
      node.focus({ preventScroll: true });
    } catch (error) {
      node.focus();
    }
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function playerById(id) {
    for (var i = 0; i < state.players.length; i++) {
      if (state.players[i].id === id) return state.players[i];
    }
    return null;
  }

  function picker() {
    return state.players[state.pickerIndex] || null;
  }

  function tileById(id) {
    for (var i = 0; i < state.tiles.length; i++) {
      if (state.tiles[i].id === id) return state.tiles[i];
    }
    return null;
  }

  function selectedCategories() {
    var list = [];
    for (var i = 0; i < CATS.length; i++) {
      if (state.playAll || state.selected[CATS[i].id]) list.push(CATS[i]);
    }
    return list;
  }

  function selectedCount() {
    return selectedCategories().length;
  }

  function categorySelectionOk() {
    if (!CATS.length) return false;
    if (state.playAll) return true;
    var count = selectedCount();
    return count === 5 || count === 6;
  }

  function startBlockers() {
    var notes = [];
    if (state.names.length < MIN_PLAYERS) notes.push("Add at least 3 players.");
    if (!categorySelectionOk()) notes.push("Choose 5 or 6 categories, or play all.");
    return notes;
  }

  function categoryStatus() {
    if (state.playAll) {
      return "Playing all " + CATS.length + " categories. The board scrolls sideways.";
    }
    var count = selectedCount();
    if (count === 5 || count === 6) return count + " categories ready.";
    if (!count) return "Pick 5 or 6 categories, use Random, or play all.";
    return count + " selected. Need exactly 5 or 6, or play all.";
  }

  function showScores() {
    return state.players.length && (state.screen === "board" || state.screen === "round" || state.screen === "winner");
  }

  function checkDeck() {
    var problems = [];
    var seen = {};
    var total = 0;
    if (CATS.length < 16) problems.push("Need at least 16 categories.");
    for (var i = 0; i < CATS.length; i++) {
      var cat = CATS[i];
      if (!cat || !cat.id || seen[cat.id]) problems.push("Bad category id.");
      if (cat && cat.id) seen[cat.id] = true;
      var prompts = cat && cat.prompts ? cat.prompts : [];
      var points = [];
      for (var j = 0; j < prompts.length; j++) points.push(prompts[j].points);
      if (points.join(",") !== "100,200,300,400,500") {
        problems.push((cat && cat.name ? cat.name : "Category") + " needs 100 through 500.");
      }
      for (var k = 0; k < prompts.length; k++) {
        if (!prompts[k].text || String(prompts[k].text).length < 20) {
          problems.push((cat.name || "Category") + " " + prompts[k].points + " is too short.");
        }
      }
      total += prompts.length;
    }
    if (total < 80) problems.push("Need at least 80 prompts.");
    return problems;
  }

  function button(label, action, opts) {
    opts = opts || {};
    var attrs = {
      type: "button",
      class: opts.className || "crh-btn",
      "data-action": action
    };
    if (opts.pressed != null) attrs["aria-pressed"] = opts.pressed ? "true" : "false";
    if (opts.checked != null) attrs["aria-checked"] = opts.checked ? "true" : "false";
    if (opts.disabled) attrs.disabled = true;
    if (opts.focus) attrs["data-focus"] = "true";
    if (opts.tile) attrs["data-tile"] = opts.tile;
    if (opts.suspect) attrs["data-suspect"] = opts.suspect;
    if (opts.name) attrs["data-name"] = opts.name;
    if (opts.category) attrs["data-category"] = opts.category;
    if (opts.value) attrs["data-value"] = opts.value;
    if (opts.lock) attrs["data-guess-lock"] = "true";
    if (opts.label) attrs["aria-label"] = opts.label;
    if (!opts.children) attrs.text = label;
    var node = el("button", attrs, opts.children || null);
    if (opts.focus) node.tabIndex = 0;
    return node;
  }

  function rulesNode() {
    var items = [];
    for (var i = 0; i < RULES.length; i++) {
      items.push(el("li", null, [
        el("span", { class: "crh-step-num", text: String(i + 1) }),
        el("p", { text: RULES[i] })
      ]));
    }
    return el("div", null, [
      el("ol", { class: "crh-steps" }, items),
      el("p", { class: "crh-note" }, [
        el("strong", { text: "21+ only. Drink responsibly." }),
        " Drinking is always optional. Water counts. Don't drink and drive. Skip any dare. Multi-phone answers go straight to the host and are not saved on a server. Pass-the-phone keeps every answer on this phone."
      ])
    ]);
  }

  function scoreboard() {
    var pickerId = state.round ? state.round.pickerId : (picker() ? picker().id : "");
    var top = -1;
    if (state.screen === "winner") {
      for (var s = 0; s < state.players.length; s++) {
        if (state.players[s].score > top) top = state.players[s].score;
      }
    }
    var items = [];
    for (var i = 0; i < state.players.length; i++) {
      var person = state.players[i];
      var hot = state.screen === "winner" ? person.score === top : person.id === pickerId;
      items.push(el("li", { class: hot ? "is-picker" : "" }, [
        el("span", { class: "crh-score-name", text: person.name }),
        el("span", { class: "crh-score-num", text: String(person.score) })
      ]));
    }
    return el("div", { class: "crh-scoreboard" }, [
      el("ul", { class: "crh-scores", "aria-label": "Scores" }, items)
    ]);
  }

  function viewIntro() {
    return fragment([
      el("section", { class: "hero" }, [
        el("p", { class: "crh-back" }, [el("a", { href: "../" }, ["All 21+ games"])]),
        el("p", { class: "badge crh-kicker", text: "21+ party game" }),
        el("h1", { text: "Caught Red-Handed", tabindex: "-1", "data-focus": "true" }),
        el("p", { class: "tagline", text: "answer in secret" }),
        el("p", {
          class: "lede",
          text: "A Jeopardy-style board for phones around the table. Everyone writes a secret answer. The room guesses who. Somebody gets caught."
        })
      ]),
      el("section", { class: "section" }, [
        el("h2", { class: "section-title" }, [
          el("span", { class: "dash", "aria-hidden": "true", text: "—" }),
          "How to play"
        ]),
        el("article", { class: "panel" }, [rulesNode()]),
        state.deckProblems.length
          ? el("p", { class: "crh-note", text: state.deckProblems.join(" ") })
          : null,
        el("div", { class: "crh-actions" }, [
          button("Host a room", "multiHost", { disabled: state.deckProblems.length > 0 }),
          button("Join with a code", "multiJoin", { className: "crh-btn crh-btn-ghost", disabled: state.deckProblems.length > 0 }),
          button("Pass the phone", "setup", { className: "crh-btn crh-btn-ghost", disabled: state.deckProblems.length > 0 })
        ])
      ])
    ]);
  }

  function viewSetup() {
    var nameItems = [];
    for (var i = 0; i < state.names.length; i++) {
      nameItems.push(el("li", null, [
        el("span", { text: state.names[i] }),
        button("×", "removeName", {
          className: "crh-x",
          name: state.names[i],
          label: "Remove " + state.names[i]
        })
      ]));
    }
    var catButtons = [];
    for (var c = 0; c < CATS.length; c++) {
      var cat = CATS[c];
      var on = state.playAll || !!state.selected[cat.id];
      catButtons.push(button(cat.name, "toggleCategory", {
        className: "crh-cat",
        category: cat.id,
        pressed: on,
        label: cat.name + (on ? ", selected" : ", not selected"),
        children: [
          el("strong", { text: cat.name }),
          el("span", { text: cat.blurb })
        ]
      }));
    }
    var blockers = startBlockers();
    return fragment([
      el("p", { class: "badge", text: "Setup" }),
      el("h1", { text: "Set the table", tabindex: "-1", "data-focus": state.autofocus ? "true" : null }),
      el("p", { class: "lede", text: "Names stay on this phone for the game. Refreshing starts over." }),
      el("div", { class: "crh-stack" }, [
        el("article", { class: "panel" }, [
          el("h2", { class: "crh-h", text: "Players" }),
          el("p", { class: "crh-note", text: state.names.length + " of 3–12. The first picker is chosen at random." }),
          nameItems.length ? el("ul", { class: "crh-names" }, nameItems) : null,
          el("div", { class: "crh-field" }, [
            el("input", {
              type: "text",
              "data-name-input": "true",
              maxlength: "16",
              placeholder: "Add a name",
              autocapitalize: "words",
              autocomplete: "off",
              "aria-label": "Player name",
              value: state.nameBuffer || ""
            }),
            button("Add", "addName", { className: "crh-btn crh-btn-small" })
          ]),
          state.names.length
            ? el("div", { class: "crh-actions" }, [
                button("Clear names", "clearNames", { className: "crh-btn crh-btn-ghost" })
              ])
            : null
        ]),
        el("article", { class: "panel" }, [
          el("h2", { class: "crh-h", text: "Categories" }),
          el("p", { class: "crh-note", text: "Each column has five tiles, 100 through 500. Higher is spicier. " + CATS.length + " categories, " + promptTotal() + " prompts." }),
          el("div", { class: "crh-row" }, [
            button("Random 5", "random5", { className: "crh-btn crh-btn-ghost crh-btn-small" }),
            button("Random 6", "random6", { className: "crh-btn crh-btn-ghost crh-btn-small" }),
            button("Play all", "playAll", { className: "crh-btn crh-btn-ghost crh-btn-small" })
          ]),
          el("div", { class: "crh-cats" }, catButtons),
          el("p", { class: "crh-status", text: categoryStatus() })
        ]),
        el("article", { class: "panel" }, [
          el("h2", { class: "crh-h", text: "House rules" }),
          el("p", { class: "crh-note" }, [
            el("strong", { text: "21+ only. Drink responsibly." }),
            " The sip is optional. You can play the whole night on points."
          ]),
          el("p", { class: "badge", text: "Who guesses" }),
          el("div", { class: "crh-choices" }, [
            choice("guessMode", "picker", "Picker guesses", "The player who tapped the tile guesses each answer."),
            choice("guessMode", "vote", "Table vote", "Pass the phone. Each player taps a name in secret, or the host taps for them. Every correct vote scores the full tile.")
          ]),
          el("p", { class: "badge", text: "When someone is caught" }),
          el("div", { class: "crh-choices" }, [
            choice("caughtRule", "sip", "Optional sip or dare", "They can take a sip, do a bonus dare, or skip. Nobody has to drink."),
            choice("caughtRule", "half", "Lose half their score", "Their score is cut in half, rounded down. No drink required.")
          ]),
          button(state.options.timer ? "Answer timer on" : "Answer timer off", "toggleTimer", {
            className: "crh-switch",
            checked: state.options.timer,
            label: "Answer timer",
            children: [
              el("span", null, [
                el("b", { text: "45-second answer timer" }),
                el("span", { text: "Time's up locks in whatever they typed, or a pass." })
              ]),
              el("span", { class: "crh-knob", "aria-hidden": "true" })
            ]
          })
        ])
      ]),
      el("p", { class: "crh-status", role: "status", text: state.notice || blockers.join(" ") }),
      el("div", { class: "crh-actions" }, [
        button("Start game", "start", { disabled: blockers.length > 0 }),
        button("How to play", "help", { className: "crh-btn crh-btn-ghost" })
      ])
    ]);
  }

  function choice(option, value, title, detail) {
    var on = state.options[option] === value;
    return button(title, "setOption", {
      className: "crh-choice",
      pressed: on,
      value: option + ":" + value,
      label: title + (on ? ", selected" : ""),
      children: [el("strong", { text: title }), el("span", { text: detail })]
    });
  }

  function promptTotal() {
    var total = 0;
    for (var i = 0; i < CATS.length; i++) total += CATS[i].prompts.length;
    return total;
  }

  function viewBoard() {
    var who = picker();
    var left = 0;
    for (var i = 0; i < state.tiles.length; i++) if (!state.tiles[i].used) left++;
    var cats = selectedCategories();
    var columns = [];
    for (var c = 0; c < cats.length; c++) columns.push(column(cats[c]));
    return fragment([
      el("p", { class: "badge", text: "Board" }),
      el("h1", { text: "The board", tabindex: "-1", "data-focus": "true" }),
      el("p", { class: "crh-picker-line", text: who.name + " picks a tile." }),
      el("p", {
        class: "crh-note",
        text: left + (left === 1 ? " tile" : " tiles") + " left. Higher numbers are spicier."
      }),
      el("div", { class: "crh-meta" }, [
        el("span", { class: "crh-pill", text: state.options.guessMode === "vote" ? "Table vote" : "Picker guesses" }),
        el("span", { class: "crh-pill", text: state.options.caughtRule === "half" ? "Caught: half score" : "Caught: optional sip" }),
        el("span", { class: "crh-pill", text: state.options.timer ? "45s timer" : "No timer" })
      ]),
      cats.length > 6
        ? el("p", { class: "crh-note", text: "Swipe sideways. Every chosen category is on the board." })
        : null,
      el("div", { class: "crh-board", role: "group", "aria-label": "Category board" }, columns),
      el("div", { class: "crh-actions" }, [
        button("How to play", "help", { className: "crh-btn crh-btn-ghost" }),
        button("End game", "askEnd", { className: "crh-btn crh-btn-ghost" })
      ])
    ]);
  }

  function column(cat) {
    var tiles = [];
    for (var i = 0; i < state.tiles.length; i++) {
      if (state.tiles[i].categoryId === cat.id) tiles.push(state.tiles[i]);
    }
    tiles.sort(function (a, b) { return a.points - b.points; });
    var kids = [el("h3", { text: cat.name })];
    for (var t = 0; t < tiles.length; t++) kids.push(tileButton(tiles[t]));
    return el("div", { class: "crh-col" }, kids);
  }

  function tileButton(tile) {
    var spice = String(tile.points / 100);
    var label = tile.categoryName + ", " + tile.points + (tile.used ? ", already played" : " points");
    return el("button", {
      type: "button",
      class: "crh-tile",
      "data-spice": spice,
      "data-action": tile.used ? null : "pickTile",
      "data-tile": tile.id,
      disabled: tile.used,
      "aria-label": label,
      text: tile.used ? "—" : String(tile.points)
    });
  }

  function currentTile() {
    return state.round ? tileById(state.round.tileId) : null;
  }

  function currentAnswer() {
    var round = state.round;
    return round.answers[round.deck[round.deckIndex]];
  }

  function isFinale() {
    return state.round.deckIndex === state.round.deck.length - 1;
  }

  function viewRound() {
    var step = state.round.step;
    if (step === "prompt") return viewPrompt();
    if (step === "cover") return viewCover();
    if (step === "write") return viewWrite();
    if (step === "read") return viewRead();
    if (step === "coverVote") return viewCoverVote();
    if (step === "guess") return viewGuess();
    if (step === "result") return viewResult();
    return el("p", { text: "Something slipped. Head back to the board." });
  }

  function viewPrompt() {
    var tile = currentTile();
    var first = playerById(state.round.order[0]);
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: tile.categoryName + " · " + tile.points }),
      el("h1", { text: "Read this out", tabindex: "-1", "data-focus": "true" }),
      el("p", { class: "crh-prompt", text: tile.text }),
      el("p", {
        class: "crh-note",
        text: tile.kind === "dare"
          ? "Bonus dare. If you're caught, you may have to do what you wrote. Skipping is always allowed."
          : "Everyone hears the prompt. Then the phone goes around. Answers stay hidden until the reveal."
      }),
      el("div", { class: "crh-actions" }, [
        button("Pass the phone to " + first.name, "beginAnswers"),
        button("How to play", "help", { className: "crh-btn crh-btn-ghost" })
      ])
    ]);
  }

  function viewCover() {
    var person = playerById(state.round.order[state.round.cursor]);
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: "Private" }),
      el("h1", { text: "Hand the phone to" }),
      el("p", { class: "crh-pass-name", text: person.name }),
      el("p", {
        class: "crh-note",
        text: "Answer " + (state.round.cursor + 1) + " of " + state.round.order.length + ". The previous answer is hidden. No peeking."
      }),
      el("div", { class: "crh-actions" }, [
        button("I'm " + person.name, "showWrite", { focus: true })
      ])
    ]);
  }

  function viewWrite() {
    var tile = currentTile();
    var person = playerById(state.round.order[state.round.cursor]);
    var draft = state.answerDraft || "";
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: person.name + " · secret" }),
      el("h1", { text: "Your answer" }),
      el("p", { class: "crh-prompt", text: tile.text }),
      el("label", { class: "sr-only", for: "crh-answer", text: "Secret answer for " + person.name }),
      el("textarea", {
        id: "crh-answer",
        class: "crh-answer",
        maxlength: String(MAX_ANSWER),
        "data-answer": "true",
        "data-focus": "true",
        placeholder: "Only you should see this.",
        autocapitalize: "sentences",
        autocomplete: "off",
        value: draft
      }),
      el("p", { class: "crh-count" }, [
        el("span", { "data-count": "true", text: String(draft.length) }),
        " / " + MAX_ANSWER
      ]),
      state.options.timer ? timerNode() : null,
      el("div", { class: "crh-actions" }, [
        button("Lock it in", "lockAnswer"),
        button("Pass", "passAnswer", { className: "crh-btn crh-btn-ghost" })
      ])
    ]);
  }

  function timerNode() {
    return el("div", { class: "crh-timer" }, [
      el("p", { class: "crh-note" }, [
        "Seconds left: ",
        el("strong", { "data-timer": "true", text: "45" })
      ]),
      el("div", { class: "crh-timer-track" }, [
        el("div", { class: "crh-timer-bar", "data-timer-bar": "true" })
      ])
    ]);
  }

  function viewRead() {
    var answer = currentAnswer();
    var finale = isFinale();
    var n = state.round.deckIndex + 1;
    var total = state.round.deck.length;
    var kids = [
      el("p", { class: "badge", text: "Answer " + n + " of " + total }),
      el("h1", {
        text: finale ? "Last answer" : "Read it anonymously",
        tabindex: "-1",
        "data-focus": "true"
      }),
      el("blockquote", { class: "crh-prompt", text: answer.text })
    ];
    if (finale) {
      kids.push(el("p", {
        class: "crh-note",
        text: "No points on this one. It's whoever is left, and they are still caught."
      }));
      kids.push(el("div", { class: "crh-actions" }, [button("Catch them", "revealFinale")]));
    } else {
      kids.push(el("p", { class: "crh-note", text: "No names yet. Read it like you found it in the couch." }));
      var label = state.options.guessMode === "vote"
        ? "Start the secret votes"
        : playerById(state.round.pickerId).name + " guesses";
      kids.push(el("div", { class: "crh-actions" }, [
        button(label, "beginGuess"),
        button("How to play", "help", { className: "crh-btn crh-btn-ghost" })
      ]));
    }
    return el("article", { class: "panel crh-narrow" }, kids);
  }

  function viewCoverVote() {
    var voter = playerById(state.round.order[state.round.voteCursor]);
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: "Secret vote" }),
      el("h1", { text: "Hand the phone to" }),
      el("p", { class: "crh-pass-name", text: voter.name }),
      el("p", {
        class: "crh-note",
        text: "Vote " + (state.round.voteCursor + 1) + " of " + state.round.order.length + ". The host can tap for them. Don't show the last vote."
      }),
      el("div", { class: "crh-actions" }, [
        button("I'm " + voter.name, "showGuess", { focus: true })
      ])
    ]);
  }

  function viewGuess() {
    var round = state.round;
    var voterName = state.options.guessMode === "vote"
      ? playerById(round.order[round.voteCursor]).name
      : playerById(round.pickerId).name;
    var answer = currentAnswer();
    var choices = [];
    for (var i = 0; i < state.players.length; i++) {
      var person = state.players[i];
      var on = round.pendingSuspect === person.id;
      choices.push(button(person.name, "chooseSuspect", {
        className: "crh-choice",
        suspect: person.id,
        pressed: on,
        label: person.name + (on ? ", selected" : ""),
        children: [
          el("strong", { text: person.name }),
          el("span", { text: on ? "Selected" : "Tap if they wrote it" })
        ]
      }));
    }
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: voterName + " is guessing" }),
      el("h1", { text: "Who wrote this?" }),
      el("blockquote", { class: "crh-prompt", text: answer.text }),
      el("div", { class: "crh-guesses" }, choices),
      el("div", { class: "crh-actions crh-lock" }, [
        button("Lock guess", "confirmGuess", { disabled: !round.pendingSuspect, lock: true })
      ])
    ]);
  }

  function viewResult() {
    var result = state.round.result;
    var author = playerById(result.answer.playerId);
    var lines = [];
    if (result.finale) {
      lines.push(el("li", { text: "No guess points. The last answer gives itself up." }));
    }
    for (var i = 0; i < result.awards.length; i++) {
      lines.push(el("li", { text: awardLine(result.awards[i], result.answer.playerId) }));
    }
    var penalty = penaltyNode(result.penalty, result.answer);
    var more = state.round.deckIndex < state.round.deck.length - 1;
    var tilesLeft = false;
    for (var t = 0; t < state.tiles.length; t++) if (!state.tiles[t].used) tilesLeft = true;
    var nextLabel = more ? "Next answer" : tilesLeft ? "Back to the board" : "See the winner";
    return el("article", { class: "panel crh-narrow", "aria-live": "polite" }, [
      el("p", { class: "crh-stamp", text: "Caught" }),
      el("h1", { text: author.name, tabindex: "-1", "data-focus": "true" }),
      el("blockquote", { class: "crh-prompt", text: result.answer.text }),
      lines.length ? el("ul", { class: "crh-award" }, lines) : null,
      penalty,
      el("div", { class: "crh-actions" }, [button(nextLabel, "advance")])
    ]);
  }

  function awardLine(award, authorId) {
    var voter = playerById(award.voterId);
    var suspect = playerById(award.suspectId);
    if (award.voterId === authorId && award.suspectId === authorId) {
      return voter.name + " pointed at themselves. No points for confessing.";
    }
    if (award.correct) {
      return voter.name + " caught " + suspect.name + " and scores " + award.points + ".";
    }
    if (award.voterId === authorId) {
      return voter.name + " tried to pin it on " + suspect.name + ". Bold. Wrong.";
    }
    return voter.name + " guessed " + suspect.name + ". Miss.";
  }

  function penaltyNode(penalty, answer) {
    if (penalty.type === "half") {
      var kids = [
        el("p", { class: "crh-h", text: penalty.before + " → " + penalty.after }),
        el("p", {
          class: "crh-note",
          text: penalty.lost
            ? "Caught. Half their score is gone (" + penalty.lost + " points)."
            : "Caught. They had no points to lose."
        })
      ];
      if (penalty.optionalDare) {
        kids.push(el("p", { class: "crh-note", text: "Points are the penalty. They can still do what they wrote, or skip it." }));
      }
      kids.push(el("p", { class: "crh-note" }, [
        el("strong", { text: "21+ only. Drink responsibly." }),
        " Drinking is off unless the table decides otherwise."
      ]));
      return el("div", null, kids);
    }
    var sipKids = [
      el("p", { class: "badge", text: penalty.ownDare ? "Their dare" : "Bonus dare" })
    ];
    if (!penalty.ownDare) sipKids.push(el("p", { class: "crh-prompt", text: penalty.dare }));
    sipKids.push(el("p", { class: "crh-note" }, [
      penalty.ownDare
        ? "Do what you wrote, take an optional sip, or skip. "
        : "Take an optional sip, do the bonus dare, or skip. ",
      el("strong", { text: "Drink responsibly. 21+ only." }),
      " Water counts. Nobody has to drink. Skip any dare."
    ]));
    return el("div", null, sipKids);
  }

  function ranked() {
    return state.players.slice().sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });
  }

  function viewWinner() {
    var list = ranked();
    var top = list.length ? list[0].score : 0;
    var winners = [];
    for (var i = 0; i < list.length; i++) if (list[i].score === top) winners.push(list[i]);
    var heading;
    if (!list.length) heading = "No game yet";
    else if (top === 0 && winners.length === list.length) heading = "A perfect crime";
    else if (winners.length === 1) heading = winners[0].name + " wins";
    else heading = "It's a tie";
    var rows = [];
    for (var r = 0; r < list.length; r++) {
      var person = list[r];
      rows.push(el("li", { class: person.score === top ? "is-winner" : "" }, [
        el("strong", { text: person.name }),
        el("span", { class: "crh-score-num", text: String(person.score) })
      ]));
    }
    var lede;
    if (top === 0 && winners.length === list.length) {
      lede = "Nobody scored. That's a kind of victory.";
    } else if (state.called) {
      lede = "You called it early. Highest score takes the room.";
    } else {
      lede = "The board is clear. Highest score takes the room.";
    }
    return fragment([
      el("article", { class: "panel crh-narrow" }, [
        el("p", { class: "badge", text: "Final" }),
        el("h1", { text: heading, tabindex: "-1", "data-focus": "true" }),
        el("p", { class: "lede", text: lede }),
        el("ol", { class: "crh-rank" }, rows),
        el("p", { class: "crh-note" }, [
          el("strong", { text: "21+ only. Drink responsibly." }),
          " If anyone is still sipping, water is a legal closer. Don't drink and drive."
        ]),
        el("div", { class: "crh-actions" }, [
          button("Play again", "playAgain"),
          button("How to play", "help", { className: "crh-btn crh-btn-ghost" })
        ])
      ])
    ]);
  }

  function helpOverlay() {
    return el("div", { class: "crh-overlay", role: "presentation", "data-action": "closeHelp" }, [
      el("article", { class: "panel crh-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "crh-help-title" }, [
        el("p", { class: "badge", text: "Rules" }),
        el("h2", { class: "crh-h", id: "crh-help-title", text: "How to play" }),
        rulesNode(),
        el("div", { class: "crh-actions" }, [
          button("Back to the game", "closeHelp", { focus: true })
        ])
      ])
    ]);
  }

  function endOverlay() {
    return el("div", { class: "crh-overlay", role: "presentation", "data-action": "cancelEnd" }, [
      el("article", { class: "panel crh-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "crh-end-title" }, [
        el("h2", { class: "crh-h", id: "crh-end-title", text: "End the game?" }),
        el("p", { class: "crh-note", text: "Scores get counted now. Tiles you haven't played stay unplayed." }),
        el("div", { class: "crh-actions" }, [
          button("Count the scores", "confirmEnd", { focus: true }),
          button("Keep playing", "cancelEnd", { className: "crh-btn crh-btn-ghost" })
        ])
      ])
    ]);
  }

  function render() {
    if (state.handedOff) return;
    var root = appEl();
    if (!root) return;
    var y = window.scrollY || 0;
    var overlay = state.help || state.endConfirm;
    clear(root);
    if (showScores()) root.appendChild(scoreboard());
    var view = state.screen === "setup"
      ? viewSetup()
      : state.screen === "board"
        ? viewBoard()
        : state.screen === "round"
          ? viewRound()
          : state.screen === "winner"
            ? viewWinner()
            : viewIntro();
    root.appendChild(view);
    if (state.help) root.appendChild(helpOverlay());
    if (state.endConfirm) root.appendChild(endOverlay());

    if (state.round && state.round.step === "write" && !state.help && !state.endConfirm) ensureTimer();
    else stopTimer();

    if (!document.documentElement.classList.contains("age-ok")) return;

    if (overlay) {
      focusNode(root.querySelector(".crh-overlay [data-focus]"));
      window.scrollTo(0, y);
      return;
    }
    if (state.focusSelector) {
      var picked = root.querySelector(state.focusSelector);
      state.focusSelector = "";
      if (picked && typeof picked.focus === "function") {
        try {
          picked.focus();
        } catch (error) {
          focusNode(picked);
        }
      }
      return;
    }
    if (state.autofocus) {
      state.autofocus = false;
      window.scrollTo(0, 0);
      focusNode(root.querySelector("[data-focus]"));
      window.requestAnimationFrame(function () {
        window.scrollTo(0, 0);
      });
      return;
    }
    window.scrollTo(0, y);
  }

  function syncNameBuffer() {
    var field = document.querySelector("[data-name-input]");
    if (field) state.nameBuffer = field.value;
  }

  function tryAddName(raw) {
    var name = String(raw || "").replace(/\s+/g, " ").trim();
    if (!name) return "Type a name first.";
    if (name.length > 16) return "Keep names to 16 characters.";
    if (state.names.length >= MAX_PLAYERS) return "12 players is the max.";
    var lower = name.toLowerCase();
    for (var i = 0; i < state.names.length; i++) {
      if (state.names[i].toLowerCase() === lower) return "That name is already in.";
    }
    state.names.push(name);
    state.nameBuffer = "";
    return "";
  }

  function rememberDraft() {
    var field = document.querySelector("[data-answer]");
    if (field) state.answerDraft = field.value;
  }

  function currentAnswerText() {
    var field = document.querySelector("[data-answer]");
    if (field) return field.value;
    return state.answerDraft || "";
  }

  function stopTimer() {
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
  }

  function clearTimer() {
    stopTimer();
    state.timerDeadline = 0;
    state.timerLeft = 0;
  }

  function ensureTimer() {
    if (!state.options.timer) return;
    if (!state.timerDeadline) state.timerDeadline = Date.now() + ANSWER_MS;
    paintTimer(state.timerDeadline - Date.now());
    if (state.timerId) return;
    state.timerId = window.setInterval(onTick, 200);
  }

  function paintTimer(left) {
    var seconds = Math.max(0, Math.ceil(left / 1000));
    var label = document.querySelector("[data-timer]");
    if (label) label.textContent = String(seconds);
    var bar = document.querySelector("[data-timer-bar]");
    if (bar) bar.style.transform = "scaleX(" + Math.max(0, left / ANSWER_MS) + ")";
  }

  function onTick() {
    if (!state.timerDeadline || !state.round || state.round.step !== "write" || state.help) return;
    var left = state.timerDeadline - Date.now();
    paintTimer(left);
    if (left <= 0) {
      clearTimer();
      submitAnswer(currentAnswerText());
    }
  }

  function submitAnswer(raw) {
    var round = state.round;
    if (!round || round.step !== "write") return;
    var text = String(raw || "").replace(/\s+/g, " ").trim();
    if (!text) text = "(passed)";
    if (text.length > MAX_ANSWER) text = text.slice(0, MAX_ANSWER);
    round.answers.push({
      playerId: round.order[round.cursor],
      text: text
    });
    round.cursor += 1;
    state.answerDraft = "";
    clearTimer();
    if (round.cursor >= round.order.length) {
      var indexes = [];
      for (var i = 0; i < round.answers.length; i++) indexes.push(i);
      round.deck = shuffle(indexes);
      round.deckIndex = 0;
      round.step = "read";
    } else {
      round.step = "cover";
    }
    state.autofocus = true;
    render();
  }

  function nextBonusDare() {
    if (!BONUS_DARES.length) return "Take a bow.";
    var index = Math.floor(Math.random() * BONUS_DARES.length);
    if (BONUS_DARES.length > 1 && index === state.dareIndex) {
      index = (index + 1) % BONUS_DARES.length;
    }
    state.dareIndex = index;
    return BONUS_DARES[index];
  }

  function settleCurrent(finale) {
    var round = state.round;
    var tile = currentTile();
    var answer = currentAnswer();
    var awards = [];
    if (!finale) {
      for (var i = 0; i < round.votes.length; i++) {
        var vote = round.votes[i];
        var correct = vote.suspectId === answer.playerId;
        var self = vote.voterId === answer.playerId;
        var points = correct && !self ? tile.points : 0;
        if (points) playerById(vote.voterId).score += points;
        awards.push({
          voterId: vote.voterId,
          suspectId: vote.suspectId,
          correct: correct,
          self: self,
          points: points
        });
      }
    }
    var caught = playerById(answer.playerId);
    var penalty;
    var ownDare = tile.kind === "dare" && answer.text !== "(passed)";
    if (state.options.caughtRule === "half") {
      var before = caught.score;
      caught.score = Math.floor(before / 2);
      penalty = {
        type: "half",
        before: before,
        after: caught.score,
        lost: before - caught.score,
        optionalDare: ownDare
      };
    } else {
      penalty = {
        type: "sip",
        ownDare: ownDare,
        dare: ownDare ? answer.text : nextBonusDare()
      };
    }
    round.result = {
      finale: !!finale,
      awards: awards,
      penalty: penalty,
      answer: answer
    };
    round.step = "result";
    buzz(40);
    state.autofocus = true;
    render();
  }

  function buzz(ms) {
    try {
      if (!navigator.vibrate) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      navigator.vibrate(ms);
    } catch (error) {
      /* vibration is a flourish */
    }
  }

  function finishRound() {
    state.pickerIndex = (state.pickerIndex + 1) % state.players.length;
    state.round = null;
    clearTimer();
    var left = false;
    for (var i = 0; i < state.tiles.length; i++) if (!state.tiles[i].used) left = true;
    state.called = false;
    state.screen = left ? "board" : "winner";
    state.autofocus = true;
    render();
  }

  function buildTiles() {
    var tiles = [];
    var cats = selectedCategories();
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      for (var j = 0; j < cat.prompts.length; j++) {
        var prompt = cat.prompts[j];
        tiles.push({
          id: cat.id + "-" + prompt.points,
          categoryId: cat.id,
          categoryName: cat.name,
          points: prompt.points,
          text: prompt.text,
          kind: prompt.kind || "answer",
          used: false
        });
      }
    }
    return tiles;
  }

  var actions = {
    multiHost: function () {
      if (!window.CRH_MULTI) return;
      state.handedOff = true;
      window.CRH_MULTI.host();
    },
    multiJoin: function () {
      if (!window.CRH_MULTI) return;
      state.handedOff = true;
      window.CRH_MULTI.join();
    },
    setup: function () {
      state.screen = "setup";
      state.notice = "";
      state.autofocus = true;
      render();
    },
    addName: function () {
      syncNameBuffer();
      state.notice = tryAddName(state.nameBuffer);
      state.autofocus = false;
      render();
      var field = document.querySelector("[data-name-input]");
      if (field) focusNode(field);
    },
    removeName: function (node) {
      syncNameBuffer();
      var name = node.getAttribute("data-name");
      var next = [];
      for (var i = 0; i < state.names.length; i++) {
        if (state.names[i] !== name) next.push(state.names[i]);
      }
      state.names = next;
      state.notice = "";
      render();
    },
    clearNames: function () {
      state.names = [];
      state.nameBuffer = "";
      state.notice = "";
      render();
    },
    toggleCategory: function (node) {
      syncNameBuffer();
      var id = node.getAttribute("data-category");
      if (state.playAll) {
        state.playAll = false;
        state.selected = {};
        for (var i = 0; i < CATS.length; i++) state.selected[CATS[i].id] = true;
        state.selected[id] = false;
      } else {
        state.selected[id] = !state.selected[id];
      }
      state.notice = "";
      render();
    },
    random5: function () { randomCategories(5); },
    random6: function () { randomCategories(6); },
    playAll: function () {
      syncNameBuffer();
      state.playAll = true;
      state.selected = {};
      state.notice = "";
      render();
    },
    setOption: function (node) {
      syncNameBuffer();
      var parts = String(node.getAttribute("data-value") || "").split(":");
      if (parts.length !== 2) return;
      if (parts[0] !== "guessMode" && parts[0] !== "caughtRule") return;
      state.options[parts[0]] = parts[1];
      render();
    },
    toggleTimer: function () {
      syncNameBuffer();
      state.options.timer = !state.options.timer;
      render();
    },
    start: function () {
      var blockers = startBlockers();
      if (blockers.length) {
        state.notice = blockers.join(" ");
        render();
        return;
      }
      state.players = [];
      for (var i = 0; i < state.names.length; i++) {
        state.players.push({
          id: "p" + state.nextPlayerId++,
          name: state.names[i],
          score: 0
        });
      }
      state.pickerIndex = Math.floor(Math.random() * state.players.length);
      state.tiles = buildTiles();
      state.round = null;
      state.called = false;
      state.help = false;
      state.endConfirm = false;
      state.screen = "board";
      state.autofocus = true;
      clearTimer();
      render();
    },
    pickTile: function (node) {
      if (state.screen !== "board" || state.round) return;
      var tile = tileById(node.getAttribute("data-tile"));
      if (!tile || tile.used) return;
      tile.used = true;
      var order = [];
      for (var i = 0; i < state.players.length; i++) {
        order.push(state.players[(state.pickerIndex + i) % state.players.length].id);
      }
      clearTimer();
      state.answerDraft = "";
      state.round = {
        tileId: tile.id,
        pickerId: picker().id,
        step: "prompt",
        order: order,
        cursor: 0,
        answers: [],
        deck: [],
        deckIndex: 0,
        votes: [],
        voteCursor: 0,
        pendingSuspect: null,
        result: null
      };
      state.screen = "round";
      state.autofocus = true;
      render();
    },
    beginAnswers: function () {
      if (!state.round || state.round.step !== "prompt") return;
      state.round.step = "cover";
      state.round.cursor = 0;
      state.autofocus = true;
      render();
    },
    showWrite: function () {
      if (!state.round || state.round.step !== "cover") return;
      state.answerDraft = "";
      state.timerDeadline = 0;
      state.round.step = "write";
      state.autofocus = true;
      render();
    },
    lockAnswer: function () {
      submitAnswer(currentAnswerText());
    },
    passAnswer: function () {
      submitAnswer("");
    },
    beginGuess: function () {
      if (!state.round || state.round.step !== "read" || isFinale()) return;
      state.round.votes = [];
      state.round.voteCursor = 0;
      state.round.pendingSuspect = null;
      state.round.step = state.options.guessMode === "vote" ? "coverVote" : "guess";
      state.autofocus = true;
      render();
    },
    showGuess: function () {
      if (!state.round || state.round.step !== "coverVote") return;
      state.round.pendingSuspect = null;
      state.round.step = "guess";
      state.autofocus = true;
      render();
    },
    chooseSuspect: function (node) {
      if (!state.round || state.round.step !== "guess") return;
      state.round.pendingSuspect = node.getAttribute("data-suspect");
      state.autofocus = false;
      state.focusSelector = "[data-guess-lock]";
      render();
    },
    confirmGuess: function () {
      var round = state.round;
      if (!round || round.step !== "guess" || !round.pendingSuspect) return;
      if (state.options.guessMode === "picker") {
        round.votes = [{ voterId: round.pickerId, suspectId: round.pendingSuspect }];
        settleCurrent(false);
        return;
      }
      round.votes.push({
        voterId: round.order[round.voteCursor],
        suspectId: round.pendingSuspect
      });
      round.pendingSuspect = null;
      round.voteCursor += 1;
      if (round.voteCursor >= round.order.length) {
        settleCurrent(false);
        return;
      }
      round.step = "coverVote";
      state.autofocus = true;
      render();
    },
    revealFinale: function () {
      if (!state.round || state.round.step !== "read" || !isFinale()) return;
      state.round.votes = [];
      settleCurrent(true);
    },
    advance: function () {
      var round = state.round;
      if (!round || round.step !== "result") return;
      round.deckIndex += 1;
      round.votes = [];
      round.voteCursor = 0;
      round.pendingSuspect = null;
      round.result = null;
      if (round.deckIndex >= round.deck.length) {
        finishRound();
        return;
      }
      round.step = "read";
      state.autofocus = true;
      render();
    },
    help: function () {
      rememberDraft();
      if (state.round && state.round.step === "write" && state.timerDeadline) {
        state.timerLeft = Math.max(0, state.timerDeadline - Date.now());
        stopTimer();
        state.timerDeadline = 0;
      }
      state.help = true;
      render();
    },
    closeHelp: function () {
      state.help = false;
      if (state.timerLeft) {
        state.timerDeadline = Date.now() + state.timerLeft;
        state.timerLeft = 0;
      }
      if (state.round && state.round.step === "write") state.autofocus = true;
      render();
    },
    askEnd: function () {
      if (state.screen !== "board") return;
      state.endConfirm = true;
      render();
    },
    cancelEnd: function () {
      state.endConfirm = false;
      render();
    },
    confirmEnd: function () {
      state.endConfirm = false;
      state.round = null;
      state.called = true;
      state.screen = "winner";
      state.autofocus = true;
      clearTimer();
      render();
    },
    playAgain: function () {
      state.players = [];
      state.tiles = [];
      state.round = null;
      state.called = false;
      state.help = false;
      state.screen = "setup";
      state.notice = "";
      state.autofocus = true;
      clearTimer();
      render();
    }
  };

  function randomCategories(count) {
    syncNameBuffer();
    var ids = [];
    for (var i = 0; i < CATS.length; i++) ids.push(CATS[i].id);
    ids = shuffle(ids);
    state.playAll = false;
    state.selected = {};
    for (var j = 0; j < count && j < ids.length; j++) state.selected[ids[j]] = true;
    state.notice = "";
    render();
  }

  function onClick(event) {
    if (state.handedOff) return;
    var node = event.target;
    while (node && node !== appEl()) {
      if (node.getAttribute && node.getAttribute("data-action")) break;
      node = node.parentNode;
    }
    if (!node || node === appEl()) return;
    if (node.disabled) return;
    var action = node.getAttribute("data-action");
    if ((action === "closeHelp" || action === "cancelEnd") && event.target !== node) return;
    if (!actions[action]) return;
    actions[action](node, event);
  }

  function onInput(event) {
    if (state.handedOff) return;
    var target = event.target;
    if (target && target.getAttribute("data-answer") != null) {
      state.answerDraft = target.value;
      var count = document.querySelector("[data-count]");
      if (count) count.textContent = String(target.value.length);
    }
    if (target && target.getAttribute("data-name-input") != null) {
      state.nameBuffer = target.value;
    }
  }

  function onKey(event) {
    if (state.handedOff) return;
    if (event.key === "Enter" && event.target && event.target.getAttribute && event.target.getAttribute("data-name-input") != null) {
      event.preventDefault();
      actions.addName();
    }
    if (event.key === "Escape") {
      if (state.help) actions.closeHelp();
      else if (state.endConfirm) actions.cancelEnd();
    }
  }

  function wireAge() {
    var gate = document.querySelector("[data-age-gate]");
    if (!gate) return;
    var yes = gate.querySelector("[data-age-yes]");
    var no = gate.querySelector("[data-age-no]");
    if (yes) {
      yes.addEventListener("click", function () {
        try {
          window.localStorage.setItem(AGE_KEY, "yes");
        } catch (error) {
          /* private mode still unlocks this visit */
        }
        document.documentElement.classList.add("age-ok");
        if (window.CRH_MULTI && window.CRH_MULTI.takeQuery()) {
          state.handedOff = true;
          return;
        }
        var heading = document.querySelector("#crh-app h1");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          focusNode(heading);
        }
      });
    }
    if (no) {
      no.addEventListener("click", function () {
        window.location.href = "../../";
      });
    }
  }

  function pageUrl() {
    try {
      if (/^https?:$/.test(window.location.protocol) && window.location.href) {
        return window.location.href;
      }
    } catch (error) {
      /* use the canonical link */
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

  function wireShare() {
    var buttonNode = document.querySelector("[data-crh-share]");
    if (!buttonNode) return;
    var label = "Share";
    buttonNode.addEventListener("click", function () {
      var url = pageUrl();
      var payload = {
        title: "Caught Red-Handed",
        text: "Caught Red-Handed — a 21+ party game on WingsCrew",
        url: url
      };
      function copied() {
        buttonNode.textContent = "Copied!";
        window.setTimeout(function () {
          buttonNode.textContent = label;
        }, 1600);
      }
      if (typeof navigator.share !== "function") {
        var write = navigator.clipboard && navigator.clipboard.writeText
          ? navigator.clipboard.writeText(url)
          : Promise.reject(new Error("no clipboard"));
        write.then(copied, function () {
          return legacyCopy(url).then(copied);
        }).catch(function () {});
        return;
      }
      navigator.share(payload).catch(function (error) {
        if (error && error.name === "AbortError") return;
        var write = navigator.clipboard && navigator.clipboard.writeText
          ? navigator.clipboard.writeText(url)
          : legacyCopy(url);
        return write.then(copied);
      }).catch(function () {});
    });
  }

  function wireUnload() {
    window.addEventListener("beforeunload", function (event) {
      if (state.screen === "board" || state.screen === "round") {
        event.preventDefault();
        event.returnValue = "";
      }
    });
  }

  state.deckProblems = checkDeck();
  var root = appEl();
  if (root) {
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
  }
  document.addEventListener("keydown", onKey);
  wireAge();
  wireShare();
  wireUnload();
  window.CRH_RETURN = function () {
    state.handedOff = false;
    state.screen = "intro";
    state.help = false;
    state.endConfirm = false;
    state.autofocus = true;
    render();
  };
  render();
  if (document.documentElement.classList.contains("age-ok") && window.CRH_MULTI && window.CRH_MULTI.takeQuery()) {
    state.handedOff = true;
  } else if (!document.documentElement.classList.contains("age-ok")) {
    var yesBtn = document.querySelector("[data-age-yes]");
    if (yesBtn) focusNode(yesBtn);
  }
})();
