// Multi-phone Caught Red-Handed.
// A phone can host, or the TV page can host while a phone claims control.
// PeerJS only introduces the browsers.
// Answers travel on the WebRTC link to the host and are not stored on a server.
(function () {
  var CATS = Array.isArray(window.CRH_CATEGORIES) ? window.CRH_CATEGORIES : [];
  var ANSWER_MS = 45000;
  var MAX_ANSWER = 240;
  var MIN_PLAYERS = 3;
  var MAX_PLAYERS = 12;
  // No I, L, or O (and no digits). Those look like 1 and 0 across a room.
  var LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ";
  var PEER_PREFIX = "wingscrew-crh-";
  var SEAT_KEY = "crh-seat";

  var DARES = [
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
    "Slow-clap the host like they just won an award.",
    "Retell your answer using only song titles until someone gets it."
  ];

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

  function cleanName(raw) {
    return String(raw || "").replace(/\s+/g, " ").trim().slice(0, 16);
  }

  function normalizeCode(raw) {
    return String(raw || "").toUpperCase().replace(/[\s\-–—]+/g, "");
  }

  function tidyCode(raw) {
    return normalizeCode(raw).slice(0, 4);
  }

  function codeValid(code) {
    if (!code || code.length !== 4) return false;
    for (var i = 0; i < code.length; i++) {
      if (LETTERS.indexOf(code.charAt(i)) === -1) return false;
    }
    return true;
  }

  function createTable(cats) {
    var table = {
      code: "",
      phase: "lobby",
      options: { timer: false, caughtRule: "sip" },
      selected: {},
      playAll: false,
      players: [],
      tiles: [],
      round: null,
      called: false,
      endReason: "",
      dareIndex: -1,
      nextRound: 1,
      notice: "",
      timerDeadline: 0
    };

    function playerById(id) {
      for (var i = 0; i < table.players.length; i++) {
        if (table.players[i].id === id) return table.players[i];
      }
      return null;
    }

    function hostPlayer() {
      for (var i = 0; i < table.players.length; i++) {
        if (table.players[i].isHost) return table.players[i];
      }
      return null;
    }

    function lobbyStartNotes() {
      var notes = [];
      var host = hostPlayer();
      if (!host || !host.name) {
        notes.push(table.tvRoom
          ? "Someone needs to tap Join as host on their phone."
          : "Add your name. You're playing too.");
      }
      if (table.players.length < MIN_PLAYERS) notes.push("Need at least 3 players.");
      if (table.players.length > MAX_PLAYERS) notes.push("12 players is the max.");
      var live = connected().length;
      if (live < MIN_PLAYERS) notes.push("At least 3 players need to be connected.");
      if (!categoryOk()) notes.push("Choose 5 or 6 categories, or play all.");
      return notes;
    }

    function nameTaken(name, exceptId) {
      var lower = name.toLowerCase();
      for (var i = 0; i < table.players.length; i++) {
        if (table.players[i].id === exceptId) continue;
        if (table.players[i].name.toLowerCase() === lower) return true;
      }
      return false;
    }

    function connected() {
      var list = [];
      for (var i = 0; i < table.players.length; i++) {
        if (table.players[i].connected) list.push(table.players[i]);
      }
      return list;
    }

    function selectedCats() {
      var list = [];
      for (var i = 0; i < cats.length; i++) {
        if (table.playAll || table.selected[cats[i].id]) list.push(cats[i]);
      }
      return list;
    }

    function categoryOk() {
      if (!cats.length) return false;
      if (table.playAll) return true;
      var n = selectedCats().length;
      return n === 5 || n === 6;
    }

    function tileById(id) {
      for (var i = 0; i < table.tiles.length; i++) {
        if (table.tiles[i].id === id) return table.tiles[i];
      }
      return null;
    }

    function nextDare() {
      if (!DARES.length) return "Take a bow.";
      var index = Math.floor(Math.random() * DARES.length);
      if (DARES.length > 1 && index === table.dareIndex) index = (index + 1) % DARES.length;
      table.dareIndex = index;
      return DARES[index];
    }

    function buildTiles() {
      var tiles = [];
      var chosen = selectedCats();
      for (var i = 0; i < chosen.length; i++) {
        var cat = chosen[i];
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
      table.tiles = tiles;
    }

    function currentAnswer() {
      var round = table.round;
      if (!round) return null;
      var id = round.order[round.index];
      return { playerId: id, text: round.answers[id] };
    }

    function isFinale() {
      var round = table.round;
      return !!(round && round.index === round.order.length - 1);
    }

    function allConnectedAnswered() {
      var people = connected();
      if (!people.length || !table.round) return false;
      for (var i = 0; i < people.length; i++) {
        if (table.round.answers[people[i].id] == null) return false;
      }
      return true;
    }

    function allConnectedVoted() {
      var people = connected();
      if (!people.length || !table.round) return false;
      for (var i = 0; i < people.length; i++) {
        if (table.round.votes[people[i].id] == null) return false;
      }
      return true;
    }

    function closeAnswers() {
      var round = table.round;
      if (!round || table.phase !== "answer") return;
      table.timerDeadline = 0;
      var people = connected();
      for (var i = 0; i < people.length; i++) {
        if (round.answers[people[i].id] == null) round.answers[people[i].id] = "(passed)";
      }
      var ids = [];
      for (var k in round.answers) {
        if (Object.prototype.hasOwnProperty.call(round.answers, k)) ids.push(k);
      }
      if (!ids.length) {
        table.phase = "board";
        table.notice = "Nobody answered. That tile stays spent.";
        table.round = null;
        return;
      }
      round.order = shuffle(ids);
      round.index = 0;
      round.votes = {};
      table.phase = "reveal";
      table.notice = "";
    }

    function settle(finale) {
      var round = table.round;
      var tile = tileById(round.tileId);
      var answer = currentAnswer();
      var author = playerById(answer.playerId);
      var lines = [];
      if (finale) {
        lines.push("No vote points. The last answer gives itself up.");
      } else {
        for (var id in round.votes) {
          if (!Object.prototype.hasOwnProperty.call(round.votes, id)) continue;
          var suspectId = round.votes[id];
          var voter = playerById(id);
          var suspect = playerById(suspectId);
          if (!voter || !suspect) continue;
          var correct = suspectId === answer.playerId;
          var self = id === answer.playerId;
          var points = correct && !self ? tile.points : 0;
          if (points) voter.score += points;
          if (self && correct) lines.push(voter.name + " pointed at themselves. No points for confessing.");
          else if (correct) lines.push(voter.name + " caught " + suspect.name + " and scores " + points + ".");
          else if (self) lines.push(voter.name + " tried to pin it on " + suspect.name + ". Bold. Wrong.");
          else lines.push(voter.name + " guessed " + suspect.name + ". Miss.");
        }
        if (!lines.length) lines.push("No votes came in.");
      }
      var ownDare = tile.kind === "dare" && answer.text !== "(passed)";
      var penalty;
      if (table.options.caughtRule === "half") {
        var before = author ? author.score : 0;
        if (author) author.score = Math.floor(before / 2);
        var after = author ? author.score : 0;
        penalty = {
          type: "half",
          headline: before + " → " + after,
          detail: before - after
            ? "Caught. Half their score is gone (" + (before - after) + " points)."
            : "Caught. They had no points to lose.",
          extra: ownDare ? "Points are the penalty. They can still do what they wrote, or skip it." : "",
          dare: ""
        };
      } else {
        penalty = {
          type: "sip",
          headline: ownDare ? "Their dare" : "Bonus dare",
          detail: ownDare
            ? "Do what you wrote, take an optional sip, or skip."
            : "Take an optional sip, do the bonus dare, or skip.",
          extra: "Drink responsibly. 21+ only. Water counts. Nobody has to drink. Skip any dare.",
          dare: ownDare ? "" : nextDare()
        };
      }
      var more = round.index < round.order.length - 1;
      var tilesLeft = false;
      for (var t = 0; t < table.tiles.length; t++) if (!table.tiles[t].used) tilesLeft = true;
      round.result = {
        authorName: author ? author.name : "Someone",
        answerText: answer.text,
        finale: !!finale,
        lines: lines,
        penalty: penalty,
        nextLabel: more ? "Next answer" : tilesLeft ? "Back to the board" : "See the winner"
      };
      table.phase = "result";
      table.notice = "";
    }

    function publicPlayers() {
      var list = [];
      for (var i = 0; i < table.players.length; i++) {
        var person = table.players[i];
        var round = table.round;
        list.push({
          id: person.id,
          name: person.name,
          score: person.score,
          connected: person.connected,
          isHost: !!person.isHost,
          answered: !!(round && round.answers[person.id] != null),
          voted: !!(round && round.votes[person.id] != null)
        });
      }
      return list;
    }

    function publicState() {
      var active = null;
      var result = null;
      var round = table.round;
      if (round && (table.phase === "prompt" || table.phase === "answer" || table.phase === "reveal" || table.phase === "vote" || table.phase === "result")) {
        var tile = tileById(round.tileId);
        var showText = table.phase === "reveal" || table.phase === "vote" || table.phase === "result";
        var answer = showText ? currentAnswer() : null;
        active = {
          roundId: round.id,
          categoryName: tile ? tile.categoryName : "",
          points: tile ? tile.points : 0,
          text: tile ? tile.text : "",
          kind: tile ? tile.kind : "answer",
          index: round.index,
          total: round.order.length,
          answerText: answer ? answer.text : "",
          finale: showText ? isFinale() : false
        };
      }
      if (round && round.result && table.phase === "result") result = round.result;
      var choices = [];
      for (var i = 0; i < cats.length; i++) {
        choices.push({
          id: cats[i].id,
          name: cats[i].name,
          blurb: cats[i].blurb || "",
          on: !!(table.playAll || table.selected[cats[i].id])
        });
      }
      var tiles = [];
      for (var t = 0; t < table.tiles.length; t++) {
        var tile = table.tiles[t];
        tiles.push({
          id: tile.id,
          categoryId: tile.categoryId,
          categoryName: tile.categoryName,
          points: tile.points,
          used: tile.used
        });
      }
      var need = connected().length;
      var answered = 0;
      var voting = 0;
      if (round) {
        for (var p = 0; p < table.players.length; p++) {
          if (!table.players[p].connected) continue;
          if (round.answers[table.players[p].id] != null) answered++;
          if (round.votes[table.players[p].id] != null) voting++;
        }
      }
      return {
        phase: table.phase,
        code: table.code,
        notice: table.notice,
        endReason: table.endReason,
        tvRoom: !!table.tvRoom,
        startNotes: table.phase === "lobby" ? lobbyStartNotes() : [],
        options: { timer: !!table.options.timer, caughtRule: table.options.caughtRule },
        timerDeadline: table.timerDeadline || 0,
        players: publicPlayers(),
        categories: choices,
        categoryOk: categoryOk(),
        playAll: table.playAll,
        tiles: tiles,
        active: active,
        progress: { answered: answered, voting: voting, need: need },
        result: result,
        winner: winnerState(),
        called: table.called
      };
    }

    function winnerState() {
      if (table.phase !== "winner") return null;
      var rows = table.players.slice().sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      });
      var top = rows.length ? rows[0].score : 0;
      var winners = 0;
      var out = [];
      for (var i = 0; i < rows.length; i++) {
        var win = rows[i].score === top;
        if (win) winners++;
        out.push({ name: rows[i].name, score: rows[i].score, winner: win });
      }
      var title = "Winner";
      if (!rows.length) title = "No game";
      else if (top === 0 && winners === rows.length) title = "A perfect crime";
      else if (winners === 1) title = rows[0].name + " wins";
      else title = "It's a tie";
      var lede = table.called
        ? "You called it early. Highest score takes the room."
        : "The board is clear. Highest score takes the room.";
      if (top === 0 && winners === rows.length) lede = "Nobody scored. That's a kind of victory.";
      return { title: title, lede: lede, rows: out };
    }

    return {
      peekAnswers: function () {
        return table.round ? table.round.answers : null;
      },
      setCode: function (code) { table.code = code; },
      markTv: function () { table.tvRoom = true; },
      markPhoneHost: function () { table.phoneHost = true; },
      setHostName: function (raw) {
        var name = cleanName(raw);
        var host = hostPlayer();
        if (!name) {
          if (host && host.id === "host" && table.phase === "lobby") {
            table.players = table.players.filter(function (p) { return p.id !== "host"; });
          }
          return "";
        }
        if (nameTaken(name, host ? host.id : "host")) return "That name is already in the room.";
        if (!host) {
          table.players.unshift({ id: "host", name: name, score: 0, connected: true, isHost: true, token: "host" });
        } else if (table.phase === "lobby") {
          host.name = name;
          host.connected = true;
        }
        return "";
      },
      addPlayer: function (id, rawName, token, claimHost) {
        var name = cleanName(rawName);
        if (!id) return { ok: false, error: "Missing player." };
        var existing = playerById(id);
        if (claimHost) {
          var holder = hostPlayer();
          if (table.phoneHost || (holder && holder.id !== id)) {
            return { ok: false, error: "Someone is already hosting. Join as a player." };
          }
        }
        if (existing) {
          if (existing.token && token && existing.token !== token) {
            return { ok: false, error: "That seat belongs to someone else." };
          }
          if (table.phase !== "lobby" && existing.name.toLowerCase() !== name.toLowerCase()) {
            name = existing.name;
          }
          if (name && !nameTaken(name, id)) existing.name = name;
          existing.connected = true;
          if (claimHost) existing.isHost = true;
          return { ok: true, player: existing, rejoin: true };
        }
        if (table.phase !== "lobby") return { ok: false, error: "That game already started." };
        if (!name) return { ok: false, error: "Type a name first." };
        if (table.players.length >= MAX_PLAYERS) return { ok: false, error: "This room is full (12)." };
        if (nameTaken(name, id)) return { ok: false, error: "That name is already in the room." };
        var player = { id: id, name: name, score: 0, connected: true, isHost: !!claimHost, token: token || "" };
        table.players.push(player);
        return { ok: true, player: player, rejoin: false };
      },
      disconnect: function (id) {
        var player = playerById(id);
        if (!player || player.id === "host") return false;
        player.connected = false;
        if (player.isHost && table.phase === "lobby") {
          table.notice = "The host phone disconnected. It can rejoin, or someone else can take host shortly.";
          return "release-host";
        }
        if (player.isHost) {
          table.notice = player.name + " disconnected. Rejoin from the same phone to keep hosting.";
        }
        if (table.phase === "answer" && allConnectedAnswered()) closeAnswers();
        else if (table.phase === "vote" && allConnectedVoted()) settle(false);
        return true;
      },
      releaseHost: function (id) {
        var player = playerById(id);
        if (!player || !player.isHost || player.connected || table.phase !== "lobby") return false;
        table.players = table.players.filter(function (p) { return p.id !== id; });
        table.notice = "The host seat is open. Join as host from a phone.";
        return true;
      },
      kick: function (id) {
        if (table.phase !== "lobby") return;
        table.players = table.players.filter(function (p) { return p.id !== id || p.isHost; });
      },
      toggleCategory: function (id) {
        if (table.phase !== "lobby") return;
        if (table.playAll) {
          table.playAll = false;
          table.selected = {};
          for (var i = 0; i < cats.length; i++) table.selected[cats[i].id] = true;
          table.selected[id] = false;
        } else {
          table.selected[id] = !table.selected[id];
        }
      },
      randomCategories: function (count) {
        if (table.phase !== "lobby") return;
        var ids = [];
        for (var i = 0; i < cats.length; i++) ids.push(cats[i].id);
        ids = shuffle(ids);
        table.playAll = false;
        table.selected = {};
        for (var j = 0; j < count && j < ids.length; j++) table.selected[ids[j]] = true;
      },
      playAll: function () {
        if (table.phase !== "lobby") return;
        table.playAll = true;
        table.selected = {};
      },
      setOption: function (key, value) {
        if (table.phase !== "lobby") return;
        if (key === "timer") table.options.timer = !!value;
        if (key === "caughtRule" && (value === "sip" || value === "half")) table.options.caughtRule = value;
      },
      startErrors: function () {
        return lobbyStartNotes();
      },
      start: function () {
        var errors = this.startErrors();
        if (errors.length) return errors.join(" ");
        for (var i = 0; i < table.players.length; i++) table.players[i].score = 0;
        buildTiles();
        table.round = null;
        table.called = false;
        table.notice = "";
        table.phase = "board";
        return "";
      },
      pickTile: function (id) {
        if (table.phase !== "board") return;
        var tile = tileById(id);
        if (!tile || tile.used) return;
        tile.used = true;
        table.notice = "";
        table.timerDeadline = 0;
        table.round = {
          id: table.nextRound++,
          tileId: tile.id,
          answers: {},
          order: [],
          index: 0,
          votes: {},
          result: null
        };
        table.phase = "prompt";
      },
      openAnswers: function () {
        if (table.phase !== "prompt") return;
        table.phase = "answer";
        table.timerDeadline = table.options.timer ? Date.now() + ANSWER_MS : 0;
      },
      submitAnswer: function (id, raw) {
        var round = table.round;
        if (!round || table.phase !== "answer") return;
        var player = playerById(id);
        if (!player) return;
        if (round.answers[id] != null) return;
        var text = String(raw || "").replace(/\s+/g, " ").trim();
        if (!text) text = "(passed)";
        if (text.length > MAX_ANSWER) text = text.slice(0, MAX_ANSWER);
        round.answers[id] = text;
        if (allConnectedAnswered()) closeAnswers();
      },
      closeAnswers: closeAnswers,
      beginVote: function () {
        if (table.phase !== "reveal" || !table.round) return;
        if (isFinale()) settle(true);
        else {
          table.round.votes = {};
          table.phase = "vote";
        }
      },
      submitVote: function (id, suspectId) {
        var round = table.round;
        if (!round || table.phase !== "vote") return;
        if (!playerById(id) || !playerById(suspectId)) return;
        if (round.votes[id] != null) return;
        round.votes[id] = suspectId;
        if (allConnectedVoted()) settle(false);
      },
      closeVotes: function () {
        if (table.phase !== "vote") return;
        settle(false);
      },
      advance: function () {
        var round = table.round;
        if (!round || table.phase !== "result") return;
        round.index += 1;
        round.votes = {};
        round.result = null;
        if (round.index >= round.order.length) {
          table.round = null;
          var left = false;
          for (var i = 0; i < table.tiles.length; i++) if (!table.tiles[i].used) left = true;
          table.called = false;
          table.phase = left ? "board" : "winner";
          return;
        }
        table.phase = "reveal";
      },
      endGame: function () {
        if (table.phase === "lobby" || table.phase === "ended") return;
        table.round = null;
        table.called = true;
        table.phase = "winner";
      },
      closeRoom: function (reason) {
        table.phase = "ended";
        table.endReason = reason || "The host ended the game.";
        table.round = null;
      },
      tick: function (now) {
        if (table.phase === "answer" && table.timerDeadline && now >= table.timerDeadline) {
          closeAnswers();
          return true;
        }
        return false;
      },
      privateFor: function (id) {
        var round = table.round;
        var player = playerById(id);
        return {
          answered: !!(round && round.answers[id] != null),
          voted: !!(round && round.votes[id] != null),
          controller: !!(player && player.isHost)
        };
      },
      publicState: publicState
    };
  }

  // Public PeerJS broker. If 0.peerjs.com goes away, point host/port/path/secure
  // at a self-hosted PeerServer. Pass-the-phone does not use this. See the README.
  function peerOpts() {
    return {
      host: "0.peerjs.com",
      port: 443,
      path: "/",
      secure: true,
      debug: 0,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      }
    };
  }

  function peerId(code) {
    return PEER_PREFIX + code;
  }

  function randomCode() {
    var code = "";
    for (var i = 0; i < 4; i++) code += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
    return code;
  }

  function friendly(err) {
    var type = err && err.type ? err.type : "";
    if (type === "peer-unavailable") return "No room with that code. Ask the host to read it again.";
    if (type === "unavailable-id") return "That room code is already taken. Trying another.";
    if (type === "browser-incompatible") return "This browser can't open a direct phone-to-phone connection. Pass the phone instead.";
    if (type === "network" || type === "server-error" || type === "socket-error" || type === "socket-closed" || type === "disconnected") {
      return "The free PeerJS intro service didn't answer. Check the connection, or pass one phone around instead.";
    }
    return "The phones couldn't connect. Try again, or pass one phone around.";
  }

  function seat() {
    try {
      var raw = sessionStorage.getItem(SEAT_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && saved.pid && saved.token) return saved;
      }
    } catch (error) {
      /* session storage can be blocked */
    }
    var fresh = {
      pid: "p" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6),
      token: Math.random().toString(36).slice(2, 12)
    };
    saveSeat(fresh);
    return fresh;
  }

  function saveSeat(value) {
    try { sessionStorage.setItem(SEAT_KEY, JSON.stringify(value)); } catch (error) { /* ignore */ }
  }

  function queryFlag(name) {
    var search = window.location.search || "";
    var match = new RegExp("[?&]" + name + "=([^&]*)").exec(search);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function gamePath() {
    var path = window.location.pathname || "/21plus/caught-red-handed/";
    if (/\/index\.html$/.test(path)) path = path.slice(0, -"index.html".length);
    if (/\/tv\/?$/.test(path)) path = path.replace(/tv\/?$/, "");
    if (path.slice(-1) !== "/") path += "/";
    return path;
  }

  function pageOrigin() {
    return window.location.origin || "https://wingscrew.com";
  }

  function joinLink(code) {
    return pageOrigin() + gamePath() + "?join=" + code;
  }

  function screenLink(code) {
    return pageOrigin() + gamePath() + "?room=" + code + "&screen=1";
  }

  function shortUrl(code) {
    var host = window.location.host || "wingscrew.com";
    if (host === "www.wingscrew.com") host = "wingscrew.com";
    return host + gamePath() + "?join=" + code;
  }

  function qrData(text) {
    if (typeof window.qrcode !== "function" || !text) return "";
    try {
      var qr = window.qrcode(0, "Q");
      qr.addData(text);
      qr.make();
      // 8px modules and a 4-module quiet zone. Black on white.
      return qr.createDataURL(8, 32);
    } catch (error) {
      return "";
    }
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
      } else node.setAttribute(key, value === true ? "" : String(value));
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
    for (var i = 0; i < nodes.length; i++) if (nodes[i]) frag.appendChild(nodes[i]);
    return frag;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
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
    if (opts.tile) attrs["data-tile"] = opts.tile;
    if (opts.suspect) attrs["data-suspect"] = opts.suspect;
    if (opts.pid) attrs["data-pid"] = opts.pid;
    if (opts.category) attrs["data-category"] = opts.category;
    if (opts.value) attrs["data-value"] = opts.value;
    if (opts.keep) attrs["data-keep"] = opts.keep;
    if (opts.label) attrs["aria-label"] = opts.label;
    if (!opts.children) attrs.text = label;
    return el("button", attrs, opts.children || null);
  }

  var ui = {
    active: false,
    role: "",
    root: null,
    peer: null,
    conns: {},
    screens: [],
    status: "live",
    error: "",
    joinCode: "",
    joinName: "",
    claimHost: false,
    hostName: "",
    hostRelease: 0,
    draft: "",
    focus: "",
    suspect: "",
    suspectKey: "",
    caret: null,
    confirmEnd: false,
    tries: 0,
    ended: false,
    endReason: "",
    pub: null,
    you: null,
    timerId: 0,
    listening: false,
    table: null,
    heartbeat: 0
  };

  function hostPub() {
    if (!ui.table) return null;
    var pub = ui.table.publicState();
    pub.screenCount = ui.screens.length;
    return pub;
  }

  function send(conn, msg) {
    try {
      if (conn && conn.open) conn.send(msg);
    } catch (error) {
      /* a closed channel just means they left */
    }
  }

  function publish(doPaint) {
    if (!ui.table) return;
    var pub = hostPub();
    ui.pub = pub;
    ui.you = ui.table.privateFor("host");
    for (var id in ui.conns) {
      if (!Object.prototype.hasOwnProperty.call(ui.conns, id)) continue;
      send(ui.conns[id], { t: "state", pub: pub, you: ui.table.privateFor(id) });
    }
    for (var s = 0; s < ui.screens.length; s++) {
      send(ui.screens[s], { t: "state", pub: pub, you: { screen: true } });
    }
    if (doPaint !== false) paint();
  }

  function broadcast() {
    publish(true);
  }

  function dropConn(conn) {
    if (!conn || conn._crhReplaced) return;
    if (conn._crhScreen) {
      ui.screens = ui.screens.filter(function (item) { return item !== conn; });
      broadcast();
      return;
    }
    if (conn._crhPid && ui.table) {
      var droppedId = conn._crhPid;
      if (ui.conns[droppedId] === conn) delete ui.conns[droppedId];
      var dropped = ui.table.disconnect(droppedId);
      if (dropped === "release-host") scheduleHostRelease(droppedId);
      if (dropped) broadcast();
    }
  }

  function scheduleHostRelease(id) {
    if (ui.hostRelease) window.clearTimeout(ui.hostRelease);
    ui.hostRelease = window.setTimeout(function () {
      ui.hostRelease = 0;
      if (!ui.table || ui.ended) return;
      if (ui.table.releaseHost(id)) broadcast();
    }, 12000);
  }

  function clearHostRelease() {
    if (ui.hostRelease) window.clearTimeout(ui.hostRelease);
    ui.hostRelease = 0;
  }

  function onClientMessage(conn, msg) {
    if (typeof msg === "string") {
      try { msg = JSON.parse(msg); } catch (error) { return; }
    }
    if (!msg || typeof msg !== "object" || !ui.table) return;
    if (msg.t === "join") {
      if (msg.screen) {
        conn._crhScreen = true;
        ui.screens.push(conn);
        send(conn, { t: "state", pub: hostPub(), you: { screen: true } });
        broadcast();
        return;
      }
      var result = ui.table.addPlayer(String(msg.pid || ""), msg.name, String(msg.token || ""), !!msg.claimHost);
      if (!result.ok) {
        send(conn, { t: "reject", error: result.error });
        return;
      }
      var old = ui.conns[result.player.id];
      if (old && old !== conn) {
        old._crhReplaced = true;
        try { old.close(); } catch (error) { /* replaced */ }
      }
      conn._crhPid = result.player.id;
      conn._crhController = !!result.player.isHost;
      ui.conns[result.player.id] = conn;
      if (result.player.isHost) clearHostRelease();
      broadcast();
      return;
    }
    if (msg.t === "control") {
      if (!conn._crhController) return;
      applyHost(String(msg.action || ""), msg, conn._crhPid);
      return;
    }
    var pid = conn._crhPid;
    if (!pid) return;
    if (msg.t === "answer") ui.table.submitAnswer(pid, msg.text);
    else if (msg.t === "vote") ui.table.submitVote(pid, msg.suspect);
    else return;
    broadcast();
  }

  function bindConn(conn) {
    conn.on("data", function (msg) { onClientMessage(conn, msg); });
    conn.on("close", function () { dropConn(conn); });
    conn.on("error", function () { dropConn(conn); });
  }

  var clientConn = null;
  var clientGen = 0;

  function destroyPeer() {
    clientConn = null;
    if (ui.heartbeat) window.clearInterval(ui.heartbeat);
    ui.heartbeat = 0;
    if (ui.timerId) window.clearInterval(ui.timerId);
    ui.timerId = 0;
    try { if (ui.peer) ui.peer.destroy(); } catch (error) { /* already gone */ }
    ui.peer = null;
  }

  function endRoom(reason, localNote) {
    if (ui.ended) return;
    ui.ended = true;
    ui.endReason = localNote || reason;
    var msg = { t: "end", reason: reason };
    for (var id in ui.conns) {
      if (Object.prototype.hasOwnProperty.call(ui.conns, id)) send(ui.conns[id], msg);
    }
    for (var i = 0; i < ui.screens.length; i++) send(ui.screens[i], msg);
    if (ui.table) ui.table.closeRoom(reason);
    destroyPeer();
    ui.status = "ended";
    paint();
  }

  function claim(code, attempt) {
    if (!window.Peer) {
      fail("Multi-phone play didn't load. Pass the phone instead.");
      return;
    }
    ui.status = "connecting";
    ui.error = "";
    paint();
    var peer;
    try {
      peer = new window.Peer(peerId(code), peerOpts());
    } catch (error) {
      fail(friendly(error));
      return;
    }
    var opened = false;
    peer.on("open", function () {
      opened = true;
      ui.peer = peer;
      ui.table.setCode(code);
      ui.status = "live";
      peer.on("connection", bindConn);
      peer.on("disconnected", function () {
        if (ui.ended) return;
        try { peer.reconnect(); } catch (error) { /* broker may be down */ }
        ui.table.notice = "Reconnecting the room…";
        broadcast();
      });
      peer.on("close", function () {
        if (!ui.ended) endRoom("The host left, so this room is over.", "This room is closed.");
      });
      ui.heartbeat = window.setInterval(function () {
        if (ui.ended || !ui.table) return;
        if (ui.table.tick(Date.now())) broadcast();
      }, 400);
      broadcast();
    });
    peer.on("error", function (err) {
      if (!opened && err && err.type === "unavailable-id" && attempt < 12) {
        try { peer.destroy(); } catch (error) { /* try a new code */ }
        claim(randomCode(), attempt + 1);
        return;
      }
      if (!opened) fail(friendly(err));
    });
  }

  function connectClient(code, screenMode) {
    var gen = ++clientGen;
    clientConn = null;
    if (!window.Peer) {
      fail("Multi-phone play didn't load. Pass the phone instead.");
      return;
    }
    ui.status = "connecting";
    ui.error = "";
    ui.joinCode = code;
    paint();
    destroyPeer();
    var peer;
    try { peer = new window.Peer(peerOpts()); }
    catch (error) {
      fail(friendly(error));
      return;
    }
    ui.peer = peer;
    var failed = false;
    function giveUp(message) {
      if (gen !== clientGen || failed || ui.ended) return;
      failed = true;
      clientConn = null;
      destroyPeer();
      if (ui.tries < 4 && ui.pub && ui.status !== "form") {
        ui.tries += 1;
        window.setTimeout(function () {
          if (!ui.ended) connectClient(code, screenMode);
        }, 1000);
        return;
      }
      fail(message);
    }
    peer.on("open", function () {
      if (gen !== clientGen) return;
      var conn = peer.connect(peerId(code), { reliable: true, serialization: "json" });
      clientConn = conn;
      var timer = window.setTimeout(function () {
        giveUp("No room with that code, or the host is offline.");
      }, 12000);
      conn.on("open", function () {
        window.clearTimeout(timer);
        failed = false;
        ui.tries = 0;
        ui.status = "live";
        var mine = seat();
        var seatRecord = {
          pid: mine.pid,
          token: mine.token,
          room: code,
          name: ui.joinName || mine.name || "",
          host: !!ui.claimHost
        };
        saveSeat(seatRecord);
        conn.send(screenMode
          ? { t: "join", screen: true }
          : { t: "join", pid: mine.pid, token: mine.token, name: ui.joinName, claimHost: !!ui.claimHost });
      });
      conn.on("data", function (msg) {
        if (typeof msg === "string") {
          try { msg = JSON.parse(msg); } catch (error) { return; }
        }
        if (!msg || typeof msg !== "object") return;
        if (msg.t === "reject") {
          failed = true;
          window.clearTimeout(timer);
          clientConn = null;
          destroyPeer();
          ui.status = "form";
          ui.error = msg.error || "Couldn't join.";
          paint();
          return;
        }
        if (msg.t === "end") {
          ui.ended = true;
          ui.endReason = msg.reason || "The host left, so this room is over.";
          ui.status = "ended";
          clientConn = null;
          destroyPeer();
          stripRoom();
          paint();
          return;
        }
        if (msg.t === "state") {
          ui.pub = msg.pub;
          ui.you = msg.you || {};
          if (ui.you.controller && ui.role === "player") {
            ui.role = "controller";
            if (!ui.hostName) ui.hostName = ui.joinName;
          }
          ui.status = "live";
          if (msg.pub && msg.pub.phase === "ended") {
            ui.ended = true;
            ui.endReason = msg.pub.endReason || "This room is over.";
            ui.status = "ended";
          }
          paint();
        }
      });
      conn.on("close", function () {
        window.clearTimeout(timer);
        if (clientConn === conn) clientConn = null;
        if (!ui.ended && ui.status === "live") giveUp("Lost the host. If the room is still going, join again.");
      });
      conn.on("error", function () {
        window.clearTimeout(timer);
        if (!ui.ended) giveUp("The connection to the host dropped.");
      });
    });
    peer.on("error", function (err) {
      if (ui.status === "live") return;
      giveUp(friendly(err));
    });
  }

  function fail(message) {
    ui.status = "failed";
    ui.error = message;
    destroyPeer();
    paint();
  }

  function stripRoom() {
    try {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (error) {
      /* the URL can stay */
    }
  }

  function goBack() {
    ui.active = false;
    ui.ended = true;
    destroyPeer();
    document.body.classList.remove("crh-screen");
    stripRoom();
    if (typeof window.CRH_RETURN === "function") window.CRH_RETURN();
  }

  function capture() {
    if (!ui.root) return;
    var hostName = ui.root.querySelector("[data-host-name]");
    if (hostName) ui.hostName = hostName.value;
    var joinName = ui.root.querySelector("[data-join-name]");
    if (joinName) ui.joinName = joinName.value;
    var joinCode = ui.root.querySelector("[data-join-code]");
    if (joinCode) ui.joinCode = joinCode.value;
    var answer = ui.root.querySelector("[data-answer]");
    if (answer) ui.draft = answer.value;
    var active = document.activeElement;
    var keep = active && active.getAttribute ? (active.getAttribute("data-keep") || "") : "";
    if (keep) ui.focus = keep;
    ui.caret = keep && active && typeof active.selectionStart === "number" ? active.selectionStart : null;
  }

  function restore() {
    if (!ui.root) return;
    var map = {
      host: "[data-host-name]",
      "join-name": "[data-join-name]",
      "join-code": "[data-join-code]",
      answer: "[data-answer]"
    };
    if (!ui.focus || !map[ui.focus]) return;
    var node = ui.root.querySelector(map[ui.focus]);
    if (!node || typeof node.focus !== "function") return;
    try { node.focus({ preventScroll: true }); } catch (error) { node.focus(); }
    if (ui.caret != null && typeof node.setSelectionRange === "function") {
      var pos = Math.min(ui.caret, String(node.value || "").length);
      try { node.setSelectionRange(pos, pos); } catch (error) { /* some inputs reject a caret */ }
    }
  }

  function scoreboard(pub) {
    var items = [];
    var players = pub.players || [];
    for (var i = 0; i < players.length; i++) {
      var person = players[i];
      items.push(el("li", { class: person.connected ? "" : "is-off" }, [
        el("span", { class: "crh-score-name", text: person.name + (person.isHost ? "" : "") }),
        el("span", { class: "crh-score-num", text: String(person.score) })
      ]));
    }
    return el("div", { class: "crh-scoreboard" }, [
      el("ul", { class: "crh-scores", "aria-label": "Scores" }, items)
    ]);
  }

  function timerBlock(pub) {
    if (!pub.timerDeadline || pub.phase !== "answer") return null;
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

  function ensureClock() {
    if (ui.timerId) window.clearInterval(ui.timerId);
    ui.timerId = 0;
    if (!ui.pub || !ui.pub.timerDeadline || ui.pub.phase !== "answer") return;
    var tick = function () {
      var label = document.querySelector("[data-timer]");
      var bar = document.querySelector("[data-timer-bar]");
      if (!label || !ui.pub || !ui.pub.timerDeadline) return;
      var left = ui.pub.timerDeadline - Date.now();
      label.textContent = String(Math.max(0, Math.ceil(left / 1000)));
      if (bar) bar.style.transform = "scaleX(" + Math.max(0, left / ANSWER_MS) + ")";
    };
    tick();
    ui.timerId = window.setInterval(tick, 200);
  }

  function controlling() {
    return ui.role === "host" || ui.role === "controller";
  }

  function displayOnly() {
    return ui.role === "screen" || ui.role === "tv";
  }

  function hostPerson(pub) {
    var players = (pub && pub.players) || [];
    for (var i = 0; i < players.length; i++) {
      if (players[i].isHost) return players[i];
    }
    return null;
  }

  function joinShowcase(code) {
    var link = joinLink(code);
    var qr = qrData(link);
    var letters = String(code || "----").split("").join(" ");
    return el("div", { class: "crh-join-visual" }, [
      qr ? el("img", {
        class: "crh-qr",
        src: qr,
        alt: "QR code that joins room " + code,
        "data-join-url": link
      }) : el("p", { class: "crh-qr-missing", text: "QR code didn't draw. Read the letters instead." }),
      el("div", { class: "crh-join-copy" }, [
        el("p", { class: "crh-code-label", text: "Room code" }),
        el("p", {
          class: "crh-code",
          "aria-label": "Room code " + letters,
          text: code || "----"
        }),
        el("p", { class: "crh-short", text: shortUrl(code) })
      ])
    ]);
  }

  function applyHost(action, data, pid) {
    if (!ui.table) return;
    data = data || {};
    if (action === "category") ui.table.toggleCategory(data.category);
    else if (action === "random") ui.table.randomCategories(Number(data.value) || 5);
    else if (action === "all") ui.table.playAll();
    else if (action === "caughtRule") ui.table.setOption("caughtRule", data.value);
    else if (action === "timer") ui.table.setOption("timer", !ui.table.publicState().options.timer);
    else if (action === "kick") {
      var kicked = data.pid;
      ui.table.kick(kicked);
      if (ui.conns[kicked]) {
        send(ui.conns[kicked], { t: "reject", error: "The host removed you from the room." });
        ui.conns[kicked]._crhReplaced = true;
        try { ui.conns[kicked].close(); } catch (error) { /* kicked */ }
        delete ui.conns[kicked];
      }
      broadcast();
      return;
    } else if (action === "host-name") {
      var renameError = ui.table.setHostName(data.name);
      if (renameError) ui.table.notice = renameError;
    } else if (action === "start") {
      if (ui.role === "host" || pid === "host") {
        var nameError = ui.table.setHostName(data.name || "");
        if (nameError) {
          ui.table.notice = nameError;
          broadcast();
          return;
        }
      }
      var startError = ui.table.start();
      if (startError) {
        ui.table.notice = startError;
        broadcast();
        return;
      }
    } else if (action === "tile") ui.table.pickTile(data.tile);
    else if (action === "open-answers") ui.table.openAnswers();
    else if (action === "answer") ui.table.submitAnswer(pid, data.text);
    else if (action === "close-answers") ui.table.closeAnswers();
    else if (action === "begin-vote") ui.table.beginVote();
    else if (action === "vote") ui.table.submitVote(pid, data.suspect);
    else if (action === "close-votes") ui.table.closeVotes();
    else if (action === "advance") ui.table.advance();
    else if (action === "end-game") ui.table.endGame();
    else if (action === "close-room") {
      endRoom("The host ended the game.", ui.role === "host" ? "You closed the room." : "The host ended the game.");
      return;
    } else return;
    broadcast();
  }

  function hostCommand(action, data) {
    if (ui.role === "controller") {
      var conn = currentConn();
      if (!conn) return;
      var msg = { t: "control", action: action };
      data = data || {};
      for (var key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) msg[key] = data[key];
      }
      send(conn, msg);
      return;
    }
    applyHost(action, data || {}, "host");
  }

  function viewFailed() {
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: "Connection" }),
      el("h1", { text: "Phones didn't link" }),
      el("p", { class: "lede", text: ui.error || "Something blocked the connection." }),
      el("p", { class: "crh-note", text: "PeerJS only introduces the phones. If that free service is down, pass one phone around. Nothing from the game is saved there." }),
      el("div", { class: "crh-actions" }, [
        button("Try again", "retry"),
        button("Pass the phone instead", "back", { className: "crh-btn crh-btn-ghost" })
      ])
    ]);
  }

  function viewEnded() {
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: "Room closed" }),
      el("h1", { text: "That's the game" }),
      el("p", { class: "lede", text: ui.endReason || "The host left, so this room is over." }),
      el("div", { class: "crh-actions" }, [
        button("Back to start", "back")
      ])
    ]);
  }

  function viewJoinForm() {
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: "Join a room" }),
      el("h1", { text: "Your phone" }),
      el("p", { class: "lede", text: "Enter the 4 letters from the TV and the name you want on the board. Spaces and dashes are ignored." }),
      el("label", { class: "crh-note", for: "crh-code", text: "Room code" }),
      el("input", {
        id: "crh-code",
        class: "crh-answer crh-code-input",
        "data-join-code": "true",
        "data-keep": "join-code",
        maxlength: "8",
        autocapitalize: "characters",
        autocomplete: "off",
        autocorrect: "off",
        spellcheck: "false",
        "aria-label": "4 letter room code",
        value: ui.joinCode || ""
      }),
      el("label", { class: "crh-note", for: "crh-join-name", text: "Your name" }),
      el("input", {
        id: "crh-join-name",
        class: "crh-answer",
        "data-join-name": "true",
        "data-keep": "join-name",
        maxlength: "16",
        autocapitalize: "words",
        autocomplete: "off",
        placeholder: "Name",
        value: ui.joinName || ""
      }),
      ui.error ? el("p", { class: "crh-status", role: "status", text: ui.error }) : null,
      el("div", { class: "crh-actions" }, [
        button("Join", "submit-join"),
        button("Join as host", "submit-host", { className: "crh-btn crh-btn-ghost" })
      ]),
      el("p", { class: "crh-note", text: "Join as host only when the room was opened on a TV. If a phone already created the room, tap Join." }),
      el("div", { class: "crh-actions" }, [
        button("Back", "back", { className: "crh-btn crh-btn-ghost" })
      ])
    ]);
  }

  function lobbyCategories(pub) {
    var buttons = [];
    var cats = pub.categories || [];
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      buttons.push(button(cat.name, "category", {
        className: "crh-cat",
        category: cat.id,
        pressed: !!cat.on,
        label: cat.name + (cat.on ? ", selected" : ", not selected"),
        children: [el("strong", { text: cat.name }), el("span", { text: cat.blurb })]
      }));
    }
    return buttons;
  }

  function viewHostLobby(pub) {
    var code = pub.code || "----";
    var link = joinLink(code);
    var screen = screenLink(code);
    var people = [];
    for (var i = 0; i < pub.players.length; i++) {
      var person = pub.players[i];
      people.push(el("li", null, [
        el("span", { text: person.name + (person.isHost ? " · host" : "") + (person.connected ? "" : " · disconnected") }),
        person.isHost ? null : button("Remove", "kick", { className: "crh-x", pid: person.id, label: "Remove " + person.name })
      ]));
    }
    var errors = Array.isArray(pub.startNotes) ? pub.startNotes : (ui.table ? ui.table.startErrors() : []);
    var showNote = pub.tvRoom
      ? "This room is on the TV. Other players scan the code and tap Join. You run the game from this phone."
      : "Everyone else scans the code, or opens the link, and taps Join. Open the big-screen link on a TV to show this board. A TV's own browser can also open the TV page and host the room itself.";
    return fragment([
      el("p", { class: "badge", text: "Host" }),
      el("h1", { text: pub.tvRoom ? "You're the host" : "Your room" }),
      el("section", { class: "crh-showtv", "aria-label": "Show on TV" }, [
        el("h2", { class: "crh-h", text: "Show on TV" }),
        el("p", { class: "crh-note", text: showNote }),
        joinShowcase(code),
        el("div", { class: "crh-actions" }, [
          button("Copy join link", "copy-link", { value: link }),
          button("Copy big-screen link", "copy-link", { className: "crh-btn crh-btn-ghost", value: screen })
        ]),
        pub.tvRoom ? null : el("p", { class: "crh-note", text: "TV browser, no extra typing: wingscrew.com/21plus/caught-red-handed/tv/" }),
        pub.screenCount ? el("p", { class: "crh-status", text: pub.screenCount + (pub.screenCount === 1 ? " big screen connected." : " big screens connected.") }) : null
      ]),
      el("article", { class: "panel" }, [
        el("h2", { class: "crh-h", text: ui.role === "controller" ? "Players" : "Your name" }),
        ui.role === "controller"
          ? el("p", { class: "crh-note", text: "You're hosting as " + (ui.joinName || "your name") + "." })
          : el("input", {
          class: "crh-answer",
          "data-host-name": "true",
          "data-keep": "host",
          maxlength: "16",
          placeholder: "Host name",
          autocapitalize: "words",
          autocomplete: "off",
          "aria-label": "Your name",
          value: ui.hostName || ""
        }),
        people.length ? el("ul", { class: "crh-names" }, people) : el("p", { class: "crh-note", text: "Waiting for players." })
      ]),
      el("article", { class: "panel" }, [
        el("h2", { class: "crh-h", text: "Categories" }),
        el("div", { class: "crh-row" }, [
          button("Random 5", "random", { className: "crh-btn crh-btn-ghost crh-btn-small", value: "5" }),
          button("Random 6", "random", { className: "crh-btn crh-btn-ghost crh-btn-small", value: "6" }),
          button("Play all", "all", { className: "crh-btn crh-btn-ghost crh-btn-small" })
        ]),
        el("div", { class: "crh-cats" }, lobbyCategories(pub)),
        el("p", { class: "crh-status", text: pub.playAll ? "Playing all categories. The board scrolls." : (pub.categoryOk ? "Categories ready." : "Pick 5 or 6, use Random, or play all.") })
      ]),
      el("article", { class: "panel" }, [
        el("h2", { class: "crh-h", text: "House rules" }),
        el("p", { class: "crh-note" }, [
          el("strong", { text: "21+ only. Drink responsibly." }),
          " Voting happens on each phone. The sip is optional."
        ]),
        el("div", { class: "crh-choices" }, [
          choice("caughtRule", "sip", "Optional sip or dare", "Caught players can sip, do a bonus dare, or skip.", pub),
          choice("caughtRule", "half", "Lose half their score", "Their score is cut in half, rounded down.", pub)
        ]),
        button(pub.options.timer ? "Answer timer on" : "Answer timer off", "timer", {
          className: "crh-switch",
          checked: !!pub.options.timer,
          children: [
            el("span", null, [
              el("b", { text: "45-second answer timer" }),
              el("span", { text: "Time's up counts as a pass for anyone still typing." })
            ]),
            el("span", { class: "crh-knob", "aria-hidden": "true" })
          ]
        })
      ]),
      el("p", { class: "crh-status", role: "status", text: errors.join(" ") }),
      el("div", { class: "crh-actions" }, [
        button("Start game", "start", { disabled: errors.length > 0 }),
        button("Close room", "back", { className: "crh-btn crh-btn-ghost" })
      ])
    ]);
  }

  function choice(option, value, title, detail, pub) {
    var on = pub.options[option] === value || (option === "caughtRule" && pub.options.caughtRule === value);
    return button(title, "option", {
      className: "crh-choice",
      pressed: on,
      value: option + ":" + value,
      children: [el("strong", { text: title }), el("span", { text: detail })]
    });
  }

  function viewShowOnTv(pub) {
    var code = pub.code || "----";
    var names = [];
    for (var i = 0; i < (pub.players || []).length; i++) {
      var person = pub.players[i];
      names.push(el("li", null, [
        el("span", { text: person.name + (person.isHost ? " · host" : "") + (person.connected ? "" : " · disconnected") })
      ]));
    }
    var host = hostPerson(pub);
    var tvRoom = !!pub.tvRoom;
    return fragment([
      el("p", { class: "badge", text: tvRoom ? "21+ · TV" : "Show on TV" }),
      el("h1", { text: "Join on your phone" }),
      el("p", { class: "lede", text: tvRoom
        ? "Scan the code. Type your name. Tap Join. One person taps Join as host and runs the game from that phone."
        : "Scan the code. Type your name. Tap Join. This screen shows the board. The host's phone runs the game." }),
      el("section", { class: "crh-showtv", "aria-label": "Show on TV" }, [
        joinShowcase(code)
      ]),
      names.length ? el("ul", { class: "crh-names crh-tv-names", "aria-label": "Players" }, names) : null,
      tvRoom && !host
        ? el("p", { class: "crh-status", role: "status", text: "Waiting for a phone to join as host." })
        : host
          ? el("p", { class: "crh-status", role: "status", text: host.name + " is hosting." + (host.connected ? "" : " Reconnecting…") })
          : null,
      el("p", { class: "crh-note" }, [
        el("strong", { text: "21+ only. Drink responsibly." }),
        " Drinking is always optional."
      ])
    ]);
  }

  function viewWaitLobby(pub) {
    var names = [];
    for (var i = 0; i < pub.players.length; i++) {
      names.push(el("li", null, [
        el("span", { text: pub.players[i].name + (pub.players[i].isHost ? " · host" : "") })
      ]));
    }
    var host = hostPerson(pub);
    var waiting = pub.tvRoom && !host
      ? "Waiting for someone to tap Join as host. Keep this page open."
      : "Waiting for the host to pick categories and start. Keep this page open.";
    return el("article", { class: "panel crh-narrow" }, [
      el("p", { class: "badge", text: pub.code || "Room" }),
      el("h1", { text: "You're in" }),
      el("p", { class: "lede", text: waiting }),
      names.length ? el("ul", { class: "crh-names" }, names) : null,
      el("p", { class: "crh-note" }, [
        el("strong", { text: "21+ only. Drink responsibly." }),
        " Answers stay on the phones until the host reveals them."
      ])
    ]);
  }

  function viewBoard(pub) {
    var cats = [];
    var seen = {};
    for (var i = 0; i < pub.tiles.length; i++) {
      var tile = pub.tiles[i];
      if (!seen[tile.categoryId]) {
        seen[tile.categoryId] = { name: tile.categoryName, tiles: [] };
        cats.push(seen[tile.categoryId]);
      }
      seen[tile.categoryId].tiles.push(tile);
    }
    var columns = [];
    for (var c = 0; c < cats.length; c++) {
      var kids = [el("h3", { text: cats[c].name })];
      var tiles = cats[c].tiles.slice().sort(function (a, b) { return a.points - b.points; });
      for (var t = 0; t < tiles.length; t++) {
        var item = tiles[t];
        if (controlling()) {
          kids.push(el("button", {
            type: "button",
            class: "crh-tile",
            "data-spice": String(item.points / 100),
            "data-action": item.used ? null : "tile",
            "data-tile": item.id,
            disabled: item.used,
            "aria-label": item.categoryName + ", " + item.points + (item.used ? ", already played" : " points"),
            text: item.used ? "—" : String(item.points)
          }));
        } else {
          kids.push(el("div", {
            class: "crh-tile" + (item.used ? " is-used" : ""),
            "data-spice": String(item.points / 100),
            text: item.used ? "—" : String(item.points)
          }));
        }
      }
      columns.push(el("div", { class: "crh-col" }, kids));
    }
    var left = 0;
    for (var n = 0; n < pub.tiles.length; n++) if (!pub.tiles[n].used) left++;
    return fragment([
      scoreboard(pub),
      el("p", { class: "badge", text: displayOnly() ? (ui.role === "tv" ? "TV" : "Big screen") : "Board" }),
      el("h1", { text: "The board" }),
      el("p", { class: "crh-picker-line", text: controlling() ? "You pick a tile." : "The host picks a tile." }),
      el("p", { class: "crh-note", text: left + (left === 1 ? " tile" : " tiles") + " left." }),
      pub.notice ? el("p", { class: "crh-status", text: pub.notice }) : null,
      cats.length > 6 ? el("p", { class: "crh-note", text: "Swipe sideways for every category." }) : null,
      el("div", { class: "crh-board", role: "group", "aria-label": "Category board" }, columns),
      controlling() ? el("div", { class: "crh-actions" }, [
        button("End game", "ask-end", { className: "crh-btn crh-btn-ghost" })
      ]) : null
    ]);
  }

  function viewPrompt(pub) {
    var active = pub.active;
    return fragment([
      scoreboard(pub),
      el("article", { class: "panel crh-narrow" }, [
        el("p", { class: "badge", text: active.categoryName + " · " + active.points }),
        el("h1", { text: "Read this out" }),
        el("p", { class: "crh-prompt", text: active.text }),
        el("p", { class: "crh-note", text: active.kind === "dare"
          ? "Bonus dare. If you're caught, you may have to do what you wrote. Skipping is allowed."
          : "Everyone can see the prompt. Answers are typed on each phone and sent only to the host." }),
        controlling() ? el("div", { class: "crh-actions" }, [
          button("Answer on your phones", "open-answers")
        ]) : el("p", { class: "crh-note", text: "Waiting for the host to open answers." })
      ])
    ]);
  }

  function viewAnswer(pub) {
    var active = pub.active;
    var you = ui.you || {};
    var rows = [];
    for (var i = 0; i < pub.players.length; i++) {
      var person = pub.players[i];
      var status = !person.connected ? "Disconnected" : person.answered ? "Locked in" : "Waiting";
      rows.push(el("li", { text: person.name + " — " + status }));
    }
    var showForm = !displayOnly() && !you.answered;
    return fragment([
      scoreboard(pub),
      el("article", { class: "panel crh-narrow" }, [
        el("p", { class: "badge", text: "Secret · " + (pub.progress.answered || 0) + " / " + (pub.progress.need || 0) }),
        el("h1", { text: showForm ? "Your answer" : "Answers coming in" }),
        el("p", { class: "crh-prompt", text: active.text }),
        showForm ? el("label", { class: "sr-only", for: "crh-secret", text: "Secret answer" }) : null,
        showForm ? el("textarea", {
          id: "crh-secret",
          class: "crh-answer",
          maxlength: String(MAX_ANSWER),
          "data-answer": "true",
          "data-keep": "answer",
          placeholder: "Only the host receives this, and not until the reveal.",
          value: ui.draft || ""
        }) : null,
        showForm ? el("div", { class: "crh-actions" }, [
          button("Lock it in", "lock-answer"),
          button("Pass", "pass-answer", { className: "crh-btn crh-btn-ghost" })
        ]) : el("p", { class: "crh-note", text: displayOnly()
          ? "Players are typing on their own phones."
          : "Locked in. Wait for the reveal." }),
        timerBlock(pub),
        el("ul", { class: "crh-award" }, rows),
        controlling() ? el("div", { class: "crh-actions" }, [
          button("Close answers", "close-answers", { className: "crh-btn crh-btn-ghost" })
        ]) : null
      ])
    ]);
  }

  function viewReveal(pub) {
    var active = pub.active;
    return fragment([
      scoreboard(pub),
      el("article", { class: "panel crh-narrow" }, [
        el("p", { class: "badge", text: "Answer " + ((active.index || 0) + 1) + " of " + (active.total || 0) }),
        el("h1", { text: active.finale ? "Last answer" : "Read it anonymously" }),
        el("blockquote", { class: "crh-prompt", text: active.answerText || "" }),
        el("p", { class: "crh-note", text: active.finale
          ? "No points on this one. It's whoever is left, and they are still caught."
          : "No names yet. Votes happen on each phone." }),
        controlling() ? el("div", { class: "crh-actions" }, [
          button(active.finale ? "Catch them" : "Vote on your phones", "begin-vote")
        ]) : el("p", { class: "crh-note", text: "Waiting for the host." })
      ])
    ]);
  }

  function viewVote(pub) {
    var active = pub.active;
    var you = ui.you || {};
    var key = String(active.roundId) + ":" + active.index;
    if (ui.suspectKey !== key) {
      ui.suspectKey = key;
      ui.suspect = "";
    }
    var choices = [];
    if (!displayOnly() && !you.voted) {
      for (var i = 0; i < pub.players.length; i++) {
        var person = pub.players[i];
        var on = ui.suspect === person.id;
        choices.push(button(person.name, "suspect", {
          className: "crh-choice",
          suspect: person.id,
          pressed: on,
          children: [
            el("strong", { text: person.name }),
            el("span", { text: on ? "Selected" : "Tap if they wrote it" })
          ]
        }));
      }
    }
    var waiting = [];
    for (var p = 0; p < pub.players.length; p++) {
      var who = pub.players[p];
      if (!who.connected) continue;
      waiting.push(el("li", { text: who.name + (who.voted ? " — voted" : " — voting") }));
    }
    return fragment([
      scoreboard(pub),
      el("article", { class: "panel crh-narrow" }, [
        el("p", { class: "badge", text: "Vote · " + (pub.progress.voting || 0) + " / " + (pub.progress.need || 0) }),
        el("h1", { text: you.voted || displayOnly() ? "Votes are in progress" : "Who wrote this?" }),
        el("blockquote", { class: "crh-prompt", text: active.answerText || "" }),
        choices.length ? el("div", { class: "crh-guesses" }, choices) : null,
        !displayOnly() && !you.voted ? el("div", { class: "crh-actions crh-lock" }, [
          button("Lock vote", "lock-vote", { disabled: !ui.suspect })
        ]) : el("p", { class: "crh-note", text: displayOnly() ? "Players are voting on their phones." : "Vote locked. Wait for the catch." }),
        controlling() ? el("ul", { class: "crh-award" }, waiting) : null,
        controlling() ? el("div", { class: "crh-actions" }, [
          button("Close voting", "close-votes", { className: "crh-btn crh-btn-ghost" })
        ]) : null
      ])
    ]);
  }

  function viewResult(pub) {
    var result = pub.result || {};
    var penalty = result.penalty || {};
    var lines = [];
    var list = result.lines || [];
    for (var i = 0; i < list.length; i++) lines.push(el("li", { text: list[i] }));
    var penaltyKids = [
      penalty.headline ? el("p", { class: penalty.type === "half" ? "crh-h" : "badge", text: penalty.headline }) : null,
      penalty.dare ? el("p", { class: "crh-prompt", text: penalty.dare }) : null,
      penalty.detail ? el("p", { class: "crh-note", text: penalty.detail }) : null,
      penalty.extra ? el("p", { class: "crh-note" }, [
        penalty.type === "sip" ? el("strong", { text: "Drink responsibly. 21+ only." }) : el("strong", { text: "21+ only. Drink responsibly." }),
        " " + penalty.extra.replace(/^Drink responsibly\. 21\+ only\. ?/, "")
      ]) : null
    ];
    return fragment([
      scoreboard(pub),
      el("article", { class: "panel crh-narrow", "aria-live": "polite" }, [
        el("p", { class: "crh-stamp", text: "Caught" }),
        el("h1", { text: result.authorName || "Caught" }),
        el("blockquote", { class: "crh-prompt", text: result.answerText || "" }),
        lines.length ? el("ul", { class: "crh-award" }, lines) : null,
        el("div", null, penaltyKids),
        controlling()
          ? el("div", { class: "crh-actions" }, [button(result.nextLabel || "Next", "advance")])
          : el("p", { class: "crh-note", text: "Waiting for the host." })
      ])
    ]);
  }

  function viewWinner(pub) {
    var winner = pub.winner || { title: "Winner", lede: "", rows: [] };
    var rows = [];
    var list = winner.rows || [];
    for (var i = 0; i < list.length; i++) {
      rows.push(el("li", { class: list[i].winner ? "is-winner" : "" }, [
        el("strong", { text: list[i].name }),
        el("span", { class: "crh-score-num", text: String(list[i].score) })
      ]));
    }
    return fragment([
      scoreboard(pub),
      el("article", { class: "panel crh-narrow" }, [
        el("p", { class: "badge", text: "Final" }),
        el("h1", { text: winner.title }),
        el("p", { class: "lede", text: winner.lede }),
        el("ol", { class: "crh-rank" }, rows),
        el("p", { class: "crh-note" }, [
          el("strong", { text: "21+ only. Drink responsibly." }),
          " If anyone is still sipping, water is a legal closer. Don't drink and drive."
        ]),
        controlling() ? el("div", { class: "crh-actions" }, [
          button("Close room", "finish")
        ]) : el("p", { class: "crh-note", text: "The host can close the room when you're done." })
      ])
    ]);
  }

  function viewLive() {
    var pub = ui.pub;
    if (!pub) return el("p", { class: "crh-note", text: "Connecting…" });
    if (pub.phase === "ended" || ui.status === "ended") return viewEnded();
    if (pub.phase === "lobby") {
      if (displayOnly()) return viewShowOnTv(pub);
      if (controlling()) return viewHostLobby(pub);
      return viewWaitLobby(pub);
    }
    if (pub.phase === "board") return viewBoard(pub);
    if (pub.phase === "prompt" && pub.active) return viewPrompt(pub);
    if (pub.phase === "answer" && pub.active) return viewAnswer(pub);
    if (pub.phase === "reveal" && pub.active) return viewReveal(pub);
    if (pub.phase === "vote" && pub.active) return viewVote(pub);
    if (pub.phase === "result") return viewResult(pub);
    if (pub.phase === "winner") return viewWinner(pub);
    return el("p", { class: "crh-note", text: "Waiting…" });
  }

  function paint() {
    if (ui.painting) return;
    var root = ui.root || document.getElementById("crh-app");
    if (!root || !ui.active) return;
    ui.painting = true;
    try {
    ui.root = root;
    document.body.classList.toggle("crh-screen", displayOnly());
    document.body.classList.toggle("crh-tv", ui.role === "tv");
    capture();
    clear(root);
    var view = ui.status === "failed" ? viewFailed()
      : ui.status === "ended" ? viewEnded()
      : ui.status === "form" ? viewJoinForm()
      : ui.status === "connecting" ? el("article", { class: "panel crh-narrow" }, [
          el("p", { class: "badge", text: "Connecting" }),
          el("h1", { text: ui.role === "host" || ui.role === "tv" ? "Opening a room" : "Joining" }),
          el("p", { class: "lede", text: "Finding the free PeerJS intro service. The game itself stays on these phones." })
        ])
      : viewLive();
    root.appendChild(view);
    if (ui.confirmEnd) {
      root.appendChild(el("div", { class: "crh-overlay", "data-action": "cancel-end" }, [
        el("article", { class: "panel crh-dialog", role: "dialog", "aria-modal": "true" }, [
          el("h2", { class: "crh-h", text: "End the game?" }),
          el("p", { class: "crh-note", text: "Scores get counted on every phone. The room stays open until you close it." }),
          el("div", { class: "crh-actions" }, [
            button("Count the scores", "confirm-end"),
            button("Keep playing", "cancel-end", { className: "crh-btn crh-btn-ghost" })
          ])
        ])
      ]));
    }
    restore();
    ensureClock();
    } finally {
      ui.painting = false;
    }
  }

  function copyText(value, node) {
    var done = function () {
      var previous = node.textContent;
      node.textContent = "Copied!";
      window.setTimeout(function () { node.textContent = previous; }, 1400);
    };
    var write = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(value)
      : Promise.reject(new Error("no clipboard"));
    write.then(done, function () {
      var field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      try { document.execCommand("copy"); done(); } catch (error) { /* ignore */ }
      document.body.removeChild(field);
    });
  }

  function submitJoin(claimHost) {
    capture();
    var code = tidyCode(ui.joinCode);
    var name = cleanName(ui.joinName);
    ui.joinCode = code;
    if (!codeValid(code)) {
      ui.error = code.length !== 4
        ? "The code is 4 letters. Spaces and dashes don't count."
        : "Use the letters on the TV. I, L, and O aren't in the code.";
      paint();
      return;
    }
    if (!name) {
      ui.error = "Type the name you want on the board.";
      ui.focus = "join-name";
      paint();
      return;
    }
    ui.joinName = name;
    ui.claimHost = !!claimHost;
    ui.error = "";
    var mine = seat();
    saveSeat({ pid: mine.pid, token: mine.token, room: code, name: name, host: !!claimHost });
    connectClient(code, false);
  }

  function onClick(event) {
    if (!ui.active) return;
    var node = event.target;
    while (node && node !== ui.root) {
      if (node.getAttribute && node.getAttribute("data-action")) break;
      node = node.parentNode;
    }
    if (!node || node === ui.root || node.disabled) return;
    var action = node.getAttribute("data-action");
    if ((action === "cancel-end") && event.target !== node) return;
    if (action === "back" || action === "finish") {
      if ((ui.role === "host" || ui.role === "tv") && !ui.ended) endRoom("The host ended the game.", "You closed the room.");
      if (ui.role === "controller" && !ui.ended) hostCommand("close-room");
      goBack();
      return;
    }
    if (action === "retry") {
      ui.ended = false;
      ui.tries = 0;
      if (ui.role === "host" || ui.role === "tv") claim(randomCode(), 0);
      else if (ui.joinCode) connectClient(ui.joinCode, ui.role === "screen");
      else { ui.status = "form"; paint(); }
      return;
    }
    if (action === "submit-join") { submitJoin(false); return; }
    if (action === "submit-host") { submitJoin(true); return; }
    if (ui.role === "controller") {
      onControllerClick(action, node);
      return;
    }
    if (action === "copy-link") { copyText(node.getAttribute("data-value") || "", node); return; }
    if (!ui.table || ui.role !== "host") {
      if (action === "lock-answer" || action === "pass-answer") {
        capture();
        sendAnswer(action === "pass-answer" ? "" : ui.draft);
        return;
      }
      if (action === "suspect") {
        ui.suspect = node.getAttribute("data-suspect");
        paint();
        return;
      }
      if (action === "lock-vote") {
        if (!ui.suspect) return;
        sendVote(ui.suspect);
        return;
      }
      return;
    }
    if (action === "category") {
      capture();
      ui.table.toggleCategory(node.getAttribute("data-category"));
      broadcast();
      return;
    }
    if (action === "random") {
      capture();
      ui.table.randomCategories(Number(node.getAttribute("data-value")) || 5);
      broadcast();
      return;
    }
    if (action === "all") {
      capture();
      ui.table.playAll();
      broadcast();
      return;
    }
    if (action === "option") {
      capture();
      var parts = String(node.getAttribute("data-value") || "").split(":");
      if (parts[0] === "caughtRule") ui.table.setOption("caughtRule", parts[1]);
      broadcast();
      return;
    }
    if (action === "timer") {
      capture();
      ui.table.setOption("timer", !(ui.pub && ui.pub.options && ui.pub.options.timer));
      broadcast();
      return;
    }
    if (action === "kick") {
      ui.table.kick(node.getAttribute("data-pid"));
      var kicked = node.getAttribute("data-pid");
      if (ui.conns[kicked]) {
        send(ui.conns[kicked], { t: "reject", error: "The host removed you from the room." });
        ui.conns[kicked]._crhReplaced = true;
        try { ui.conns[kicked].close(); } catch (error) { /* kicked */ }
        delete ui.conns[kicked];
      }
      broadcast();
      return;
    }
    if (action === "start") {
      capture();
      var nameError = ui.table.setHostName(ui.hostName);
      if (nameError) {
        ui.table.notice = nameError;
        broadcast();
        return;
      }
      var startError = ui.table.start();
      if (startError) {
        ui.table.notice = startError;
        broadcast();
        return;
      }
      ui.draft = "";
      broadcast();
      return;
    }
    if (action === "tile") { ui.table.pickTile(node.getAttribute("data-tile")); broadcast(); return; }
    if (action === "open-answers") { ui.table.openAnswers(); broadcast(); return; }
    if (action === "lock-answer" || action === "pass-answer") {
      capture();
      ui.table.submitAnswer("host", action === "pass-answer" ? "" : ui.draft);
      ui.draft = "";
      broadcast();
      return;
    }
    if (action === "close-answers") { ui.table.closeAnswers(); broadcast(); return; }
    if (action === "begin-vote") { ui.table.beginVote(); ui.suspect = ""; broadcast(); return; }
    if (action === "suspect") { ui.suspect = node.getAttribute("data-suspect"); paint(); return; }
    if (action === "lock-vote") {
      if (!ui.suspect) return;
      ui.table.submitVote("host", ui.suspect);
      broadcast();
      return;
    }
    if (action === "close-votes") { ui.table.closeVotes(); broadcast(); return; }
    if (action === "advance") { ui.suspect = ""; ui.table.advance(); broadcast(); return; }
    if (action === "ask-end") { ui.confirmEnd = true; paint(); return; }
    if (action === "cancel-end") { ui.confirmEnd = false; paint(); return; }
    if (action === "confirm-end") {
      ui.confirmEnd = false;
      ui.table.endGame();
      broadcast();
    }
  }

  function sendAnswer(text) {
    var conn = currentConn();
    if (!conn) return;
    send(conn, { t: "answer", text: text });
    ui.draft = "";
    if (ui.you) ui.you.answered = true;
    paint();
  }

  function sendVote(suspect) {
    var conn = currentConn();
    if (!conn) return;
    send(conn, { t: "vote", suspect: suspect });
    if (ui.you) ui.you.voted = true;
    paint();
  }

  function currentConn() {
    return clientConn;
  }

  function onInput(event) {
    if (!ui.active) return;
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute("data-host-name") != null) {
      ui.hostName = target.value;
      if (ui.table && ui.role === "host" && (!ui.pub || ui.pub.phase === "lobby")) {
        ui.table.setHostName(ui.hostName);
        broadcast();
      }
    }
    if (target.getAttribute("data-join-name") != null) ui.joinName = target.value;
    if (target.getAttribute("data-join-code") != null) {
      var tidy = tidyCode(target.value);
      if (target.value !== tidy) target.value = tidy;
      ui.joinCode = tidy;
    }
    if (target.getAttribute("data-answer") != null) ui.draft = target.value;
  }

  function onKey(event) {
    if (!ui.active) return;
    if (event.key === "Enter" && event.target && event.target.getAttribute && event.target.getAttribute("data-join-name") != null) {
      event.preventDefault();
      submitJoin();
    }
    if (event.key === "Escape" && ui.confirmEnd) {
      ui.confirmEnd = false;
      paint();
    }
  }

  function bind() {
    var root = document.getElementById("crh-app");
    ui.root = root;
    if (ui.listening || !root) return;
    ui.listening = true;
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    document.addEventListener("keydown", onKey);
    window.addEventListener("pagehide", function (event) {
      if (event && event.persisted) return;
      if ((ui.role === "host" || ui.role === "tv") && ui.active && !ui.ended && ui.status === "live") {
        endRoom(ui.role === "tv" ? "The TV left, so this room is over." : "The host left, so this room is over.", "You left the room.");
      }
    });
    window.addEventListener("beforeunload", function (event) {
      if (!ui.active || ui.ended || ui.status !== "live") return;
      if (ui.role === "screen" || ui.role === "tv") return;
      if (ui.pub && ui.pub.phase === "lobby") return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function resetUi(role) {
    ui.active = true;
    ui.role = role;
    ui.status = role === "player" ? "form" : "connecting";
    ui.error = "";
    ui.ended = false;
    ui.endReason = "";
    ui.confirmEnd = false;
    ui.tries = 0;
    ui.pub = null;
    ui.you = null;
    ui.conns = {};
    ui.screens = [];
    ui.draft = "";
    ui.suspect = "";
    ui.focus = "";
    ui.caret = null;
    ui.claimHost = false;
    ui.table = null;
    clearHostRelease();
    bind();
  }

  function onControllerClick(action, node) {
    if (action === "category") hostCommand("category", { category: node.getAttribute("data-category") });
    else if (action === "random") hostCommand("random", { value: node.getAttribute("data-value") });
    else if (action === "all") hostCommand("all");
    else if (action === "option") {
      var parts = String(node.getAttribute("data-value") || "").split(":");
      if (parts[0] === "caughtRule") hostCommand("caughtRule", { value: parts[1] });
    } else if (action === "timer") hostCommand("timer");
    else if (action === "kick") hostCommand("kick", { pid: node.getAttribute("data-pid") });
    else if (action === "start") {
      capture();
      hostCommand("start", { name: ui.hostName });
    } else if (action === "tile") hostCommand("tile", { tile: node.getAttribute("data-tile") });
    else if (action === "open-answers") hostCommand("open-answers");
    else if (action === "lock-answer" || action === "pass-answer") {
      capture();
      sendAnswer(action === "pass-answer" ? "" : ui.draft);
    } else if (action === "close-answers") hostCommand("close-answers");
    else if (action === "begin-vote") hostCommand("begin-vote");
    else if (action === "suspect") {
      ui.suspect = node.getAttribute("data-suspect");
      paint();
    } else if (action === "lock-vote") {
      if (!ui.suspect) return;
      sendVote(ui.suspect);
    } else if (action === "close-votes") hostCommand("close-votes");
    else if (action === "advance") {
      ui.suspect = "";
      hostCommand("advance");
    } else if (action === "ask-end") {
      ui.confirmEnd = true;
      paint();
    } else if (action === "cancel-end") {
      ui.confirmEnd = false;
      paint();
    } else if (action === "confirm-end") {
      ui.confirmEnd = false;
      hostCommand("end-game");
    } else if (action === "copy-link") copyText(node.getAttribute("data-value") || "", node);
  }

  window.CRH_TABLE = createTable;
  window.CRH_MULTI = {
    host: function () {
      resetUi("host");
      ui.table = createTable(CATS);
      ui.table.markPhoneHost();
      var saved = seat();
      ui.hostName = saved.name || "";
      claim(randomCode(), 0);
    },
    join: function (code) {
      resetUi("player");
      var saved = seat();
      var tidy = tidyCode(code || saved.room || "");
      ui.joinCode = tidy;
      ui.joinName = saved.name || "";
      ui.focus = codeValid(tidy) ? "join-name" : "join-code";
      if (code && codeValid(tidy) && saved.room === tidy && saved.name) {
        ui.joinName = saved.name;
        ui.claimHost = !!saved.host;
        connectClient(tidy, false);
        return;
      }
      if (tidy && !codeValid(tidy)) ui.error = "Use the 4 letters on the TV. I, L, and O aren't used.";
      ui.status = "form";
      paint();
    },
    screen: function (code) {
      resetUi("screen");
      ui.joinCode = code;
      connectClient(code, true);
    },
    tv: function () {
      resetUi("tv");
      ui.table = createTable(CATS);
      ui.table.markTv();
      claim(randomCode(), 0);
    },
    takeQuery: function () {
      var raw = queryFlag("join") || queryFlag("room") || "";
      if (!raw) return false;
      var code = tidyCode(raw);
      if (queryFlag("screen") === "1") {
        if (!codeValid(code)) return false;
        this.screen(code);
        return true;
      }
      if (!normalizeCode(raw)) return false;
      this.join(code);
      return true;
    }
  };
})();
