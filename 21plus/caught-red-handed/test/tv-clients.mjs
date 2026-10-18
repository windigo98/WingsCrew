// Headless check: TV room, QR join link, and three phone clients.
// A local Peer stand-in keeps the test off the public broker.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const shot = "/opt/cursor/artifacts/tv_join_qr.png";
const LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ";

const mockPeer = `
(function () {
  if (window.__CRH_MOCK_PEER) return;
  window.__CRH_MOCK_PEER = true;
  var peers = [];
  var remoteOpen = {};
  var msgCount = 0;
  var channel = new BroadcastChannel("crh-mock-peer");

  function emit(target, name, arg) {
    var list = target._events[name] || [];
    for (var i = 0; i < list.length; i++) list[i](arg);
  }

  function deliver(msg) {
    for (var i = 0; i < peers.length; i++) peers[i]._receive(msg);
  }

  function publish(msg) {
    msgCount += 1;
    if (msgCount > 400) {
      console.error("mock flood " + msgCount + " " + msg.t + " " + (msg.data && msg.data.t ? msg.data.t : ""));
      return;
    }
    deliver(msg);
    try { channel.postMessage(msg); } catch (error) { /* ignore */ }
  }

  channel.onmessage = function (ev) { deliver(ev.data); };

  function Conn(owner, remoteId, id) {
    this.owner = owner;
    this.peer = remoteId;
    this.id = id;
    this.open = false;
    this._events = {};
  }
  Conn.prototype.on = function (name, fn) {
    (this._events[name] = this._events[name] || []).push(fn);
    return this;
  };
  Conn.prototype.send = function (data) {
    if (!this.open) return;
    publish({ t: "data", connId: this.id, to: this.peer, from: this.owner.id, data: data });
  };
  Conn.prototype.close = function () {
    if (!this.open) return;
    this.open = false;
    publish({ t: "close", connId: this.id });
    emit(this, "close");
  };

  function Peer(id, options) {
    if (id && typeof id === "object") {
      options = id;
      id = null;
    }
    this.id = id || ("anon" + Math.random().toString(36).slice(2, 10));
    this._events = {};
    this._conns = {};
    this.destroyed = false;
    this.disconnected = false;
    this._opened = false;
    peers.push(this);
    var self = this;
    if (id) {
      var rejects = 0;
      try { rejects = Number(localStorage.getItem("crh-force-reject") || "0"); } catch (error) { rejects = 0; }
      if (rejects > 0) {
        try { localStorage.setItem("crh-force-reject", String(rejects - 1)); } catch (error) { /* ignore */ }
        window.setTimeout(function () {
          if (!self.destroyed) emit(self, "error", { type: "unavailable-id" });
        }, 20);
        return;
      }
      if (remoteOpen[self.id]) {
        window.setTimeout(function () {
          if (!self.destroyed) emit(self, "error", { type: "unavailable-id" });
        }, 20);
        return;
      }
    }
    window.setTimeout(function () {
      if (self.destroyed || self._opened) return;
      self._opened = true;
      remoteOpen[self.id] = true;
      publish({ t: "hello", id: self.id });
      emit(self, "open", self.id);
    }, 30);
  }

  Peer.prototype.on = function (name, fn) {
    (this._events[name] = this._events[name] || []).push(fn);
    return this;
  };
  Peer.prototype._receive = function (msg) {
    if (!msg || this.destroyed) return;
    if (msg.t === "hello" && msg.id && msg.id !== this.id) remoteOpen[msg.id] = true;
    if (msg.t === "bye" && msg.id) delete remoteOpen[msg.id];
    if (msg.t === "connect" && msg.to === this.id && this._opened) {
      if (this._conns[msg.connId]) return;
      var incoming = new Conn(this, msg.from, msg.connId);
      incoming.open = true;
      this._conns[incoming.id] = incoming;
      emit(this, "connection", incoming);
      publish({ t: "opened", connId: incoming.id, to: msg.from });
      return;
    }
    if (msg.t === "opened") {
      var mine = this._conns[msg.connId];
      if (mine && msg.to === this.id && !mine.open) {
        mine.open = true;
        emit(mine, "open");
      }
      return;
    }
    if (msg.t === "data") {
      var conn = this._conns[msg.connId];
      if (conn && msg.to === this.id) emit(conn, "data", msg.data);
      return;
    }
    if (msg.t === "close") {
      var closing = this._conns[msg.connId];
      if (closing && closing.open) {
        closing.open = false;
        emit(closing, "close");
      }
    }
  };
  Peer.prototype.connect = function (remoteId) {
    var conn = new Conn(this, remoteId, "c" + Math.random().toString(36).slice(2, 10));
    this._conns[conn.id] = conn;
    publish({ t: "connect", from: this.id, to: remoteId, connId: conn.id });
    return conn;
  };
  Peer.prototype.reconnect = function () {};
  Peer.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    this._opened = false;
    publish({ t: "bye", id: this.id });
    delete remoteOpen[this.id];
    var self = this;
    peers = peers.filter(function (peer) { return peer !== self; });
    emit(this, "close");
  };

  window.Peer = Peer;
})();
`;

function contentType(file) {
  var ext = path.extname(file).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js" || ext === ".mjs") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".xml") return "application/xml";
  if (ext === ".webmanifest") return "application/manifest+json";
  return "application/octet-stream";
}

function startServer() {
  var server = http.createServer(function (req, res) {
    var url = new URL(req.url, "http://127.0.0.1");
    var rel = decodeURIComponent(url.pathname);
    if (rel.endsWith("/")) rel += "index.html";
    var file = path.normalize(path.join(root, rel));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end("no");
      return;
    }
    fs.readFile(file, function (error, buf) {
      if (error) {
        res.writeHead(404);
        res.end("missing");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType(file), "Cache-Control": "no-store" });
      res.end(buf);
    });
  });
  return new Promise(function (resolve) {
    server.listen(0, "127.0.0.1", function () {
      resolve(server);
    });
  });
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function fillName(page, name) {
  await page.waitForSelector("#crh-join-name");
  await page.click("#crh-join-name", { clickCount: 3 });
  await page.type("#crh-join-name", name);
}

async function main() {
  var server = await startServer();
  var port = server.address().port;
  var origin = "http://127.0.0.1:" + port;
  var browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome-stable",
    headless: "new",
    protocolTimeout: 20000,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
  });
  var failures = [];
  function watch(page, label) {
    page.on("pageerror", function (err) {
      console.log(label, "pageerror", err.message);
      failures.push(label + " " + err.message);
    });
    page.on("console", function (msg) {
      if (msg.type() === "error" || msg.type() === "warning") console.log(label, msg.type(), msg.text());
      if (msg.type() === "error") failures.push(label + " console " + msg.text());
    });
  }
  async function openPage(context, label) {
    var page = await context.newPage();
    watch(page, label);
    await page.setRequestInterception(true);
    page.on("request", function (req) {
      if (req.url().indexOf("peerjs.min.js") !== -1) {
        req.respond({
          status: 200,
          contentType: "text/javascript; charset=utf-8",
          body: mockPeer
        });
        return;
      }
      req.continue();
    });
    return page;
  }
  try {
    var context = await browser.createBrowserContext();
    var tv = await openPage(context, "tv");
    await tv.setViewport({ width: 1366, height: 768 });
    await tv.evaluateOnNewDocument(function () {
      try { localStorage.setItem("crh-force-reject", "1"); } catch (error) { /* ignore */ }
    });
    await tv.goto(origin + "/21plus/caught-red-handed/tv/", { waitUntil: "domcontentloaded" });
    await tv.waitForSelector(".crh-code", { timeout: 15000 });
    await tv.waitForFunction(function () {
      var img = document.querySelector(".crh-qr");
      if (!img) return false;
      return img.getBoundingClientRect().width > 280;
    }, { timeout: 15000 });

    var info = await tv.evaluate(function () {
      var code = document.querySelector(".crh-code").textContent.trim();
      var img = document.querySelector(".crh-qr");
      var link = img.getAttribute("data-join-url");
      var qr = window.qrcode(0, "Q");
      qr.addData(link);
      qr.make();
      var rect = img.getBoundingClientRect();
      var visual = document.querySelector(".crh-join-visual");
      var style = visual ? getComputedStyle(visual) : null;
      return {
        code: code,
        link: link,
        shortText: document.querySelector(".crh-short").textContent,
        match: img.getAttribute("src") === qr.createDataURL(8, 32),
        width: rect.width,
        bg: style ? style.backgroundColor : "",
        footer: document.querySelector(".site-footer").innerText,
        robots: document.querySelector('meta[name="robots"]').content,
        title: document.querySelector("h1").textContent,
        rejected: localStorage.getItem("crh-force-reject")
      };
    });

    assert(/^[ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/.test(info.code), "code " + info.code);
    for (var i = 0; i < info.code.length; i++) {
      assert(LETTERS.indexOf(info.code.charAt(i)) !== -1, "alphabet");
    }
    assert(info.code.indexOf("I") === -1 && info.code.indexOf("L") === -1 && info.code.indexOf("O") === -1, "ambiguous");
    assert(info.rejected === "0", "id-taken retry did not run");
    assert(info.link === origin + "/21plus/caught-red-handed/?join=" + info.code, "join link " + info.link);
    assert(info.match, "QR does not encode the join link");
    assert(info.shortText.indexOf("?join=" + info.code) !== -1, "short url " + info.shortText);
    assert(info.shortText.indexOf("/21plus/caught-red-handed/") !== -1, "short path");
    assert(info.width >= 300, "QR width " + info.width);
    assert(info.bg === "rgb(255, 255, 255)", "QR card background " + info.bg);
    assert(info.footer.indexOf("All rights reserved") !== -1, "footer");
    assert(info.robots.indexOf("noindex") !== -1, "noindex");
    assert(info.title.indexOf("Join") !== -1, "tv heading");
    console.log("TV code", info.code, "QR", Math.round(info.width) + "px", info.shortText);

    var dashed = info.code.slice(0, 2).toLowerCase() + "-" + info.code.slice(2).toLowerCase();
    var host = await openPage(context, "host");
    await host.setViewport({ width: 390, height: 844 });
    await host.goto(origin + "/21plus/caught-red-handed/?join=" + encodeURIComponent(dashed), { waitUntil: "domcontentloaded" });
    await host.waitForSelector("[data-age-yes]");
    await host.click("[data-age-yes]");
    await host.waitForSelector("#crh-code");
    var prefilled = await host.$eval("#crh-code", function (node) { return node.value; });
    assert(prefilled === info.code, "prefill " + prefilled + " from " + dashed);
    var focused = await host.evaluate(function () {
      return document.activeElement && document.activeElement.id;
    });
    assert(focused === "crh-join-name", "focus " + focused);
    await fillName(host, "Alex");
    await host.click("[data-action='submit-host']");
    await host.waitForFunction(function () {
      return document.body.innerText.indexOf("You're the host") !== -1;
    }, { timeout: 10000 });

    var spaced = info.code.slice(0, 2) + " " + info.code.slice(2);
    async function joinPlayer(name, query) {
      var page = await openPage(context, name);
      await page.setViewport({ width: 390, height: 844 });
      await page.evaluateOnNewDocument(function () {
        try { localStorage.setItem("wingscrew-21plus", "yes"); } catch (error) { /* ignore */ }
      });
      await page.goto(origin + "/21plus/caught-red-handed/?" + query, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#crh-code", { timeout: 10000 });
      var value = await page.$eval("#crh-code", function (node) { return node.value; });
      await fillName(page, name);
      await page.click("[data-action='submit-join']");
      await page.waitForFunction(function () {
        return document.body.innerText.indexOf("You're in") !== -1;
      }, { timeout: 10000 });
      return { page: page, value: value };
    }

    var blair = await joinPlayer("Blair", "join=" + encodeURIComponent(spaced.toLowerCase()));
    assert(blair.value === info.code, "spaced prefill " + blair.value);
    var casey = await joinPlayer("Casey", "room=" + info.code.toLowerCase());
    assert(casey.value === info.code, "room prefill " + casey.value);

    await tv.waitForFunction(function (code) {
      var text = document.body.innerText;
      return text.indexOf("Alex is hosting") !== -1 && text.indexOf("Blair") !== -1 && text.indexOf("Casey") !== -1 && text.indexOf(code) !== -1;
    }, { timeout: 10000 }, info.code);

    fs.mkdirSync(path.dirname(shot), { recursive: true });
    await tv.screenshot({ path: shot });
    console.log("screenshot", shot);

    await host.evaluate(function () {
      document.querySelector("[data-action='random'][data-value='5']").click();
    });
    await host.waitForFunction(function () {
      var btn = document.querySelector("[data-action='start']");
      return btn && !btn.disabled;
    }, { timeout: 10000 });
    await host.evaluate(function () {
      document.querySelector("[data-action='start']").click();
    });
    await tv.waitForFunction(function () {
      return document.body.innerText.indexOf("The board") !== -1;
    }, { timeout: 10000 });
    await host.waitForFunction(function () {
      return document.body.innerText.indexOf("You pick a tile") !== -1;
    }, { timeout: 10000 });

    var phone = await openPage(context, "phone-host");
    await phone.setViewport({ width: 390, height: 844 });
    await phone.evaluateOnNewDocument(function () {
      try { localStorage.setItem("wingscrew-21plus", "yes"); } catch (error) { /* ignore */ }
    });
    await phone.goto(origin + "/21plus/caught-red-handed/", { waitUntil: "domcontentloaded" });
    await phone.waitForSelector("[data-action='multiHost']");
    await phone.evaluate(function () {
      document.querySelector("[data-action='multiHost']").click();
    });
    await phone.waitForSelector(".crh-showtv h2", { timeout: 10000 });
    var phoneInfo = await phone.evaluate(function () {
      var code = document.querySelector(".crh-code").textContent.trim();
      var link = document.querySelector(".crh-qr").getAttribute("data-join-url");
      var buttons = Array.prototype.map.call(document.querySelectorAll("[data-action='copy-link']"), function (node) {
        return node.getAttribute("data-value");
      });
      var heading = document.querySelector(".crh-showtv h2").textContent;
      return { code: code, link: link, buttons: buttons, heading: heading };
    });
    assert(phoneInfo.heading === "Show on TV", phoneInfo.heading);
    assert(/^[ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/.test(phoneInfo.code), "phone code " + phoneInfo.code);
    assert(phoneInfo.link.indexOf("?join=" + phoneInfo.code) !== -1, "phone join " + phoneInfo.link);
    assert(phoneInfo.buttons.some(function (value) { return value.indexOf("screen=1") !== -1 && value.indexOf(phoneInfo.code) !== -1; }), "big screen link");
    await phone.evaluate(function () {
      document.querySelector("[data-action='show-tv']").click();
    });
    await phone.waitForSelector("#crh-tv-link", { timeout: 10000 });
    var panel = await phone.evaluate(function () {
      return {
        link: document.querySelector("#crh-tv-link").textContent,
        text: document.body.innerText
      };
    });
    assert(panel.link.indexOf("screen=1") !== -1 && panel.link.indexOf(phoneInfo.code) !== -1, "panel link " + panel.link);
    assert(panel.text.indexOf("AirPlay") !== -1 && panel.text.indexOf("Chromecast") !== -1 && panel.text.indexOf("HDMI") !== -1, "cast steps");
    console.log("phone host", phoneInfo.code, "show on TV panel ok");

    var bad = await openPage(context, "bad-code");
    await bad.evaluateOnNewDocument(function () {
      try { localStorage.setItem("wingscrew-21plus", "yes"); } catch (error) { /* ignore */ }
    });
    await bad.goto(origin + "/21plus/caught-red-handed/?join=IIII", { waitUntil: "domcontentloaded" });
    await bad.waitForSelector("#crh-code");
    await fillName(bad, "Dee");
    await bad.click("[data-action='submit-join']");
    await bad.waitForFunction(function () {
      return document.body.innerText.indexOf("I, L, and O") !== -1;
    });

    if (failures.length) throw new Error(failures.join("\n"));
    console.log("ok");
  } finally {
    await browser.close();
    await new Promise(function (resolve) { server.close(resolve); });
  }
}

main().catch(function (error) {
  console.error(error);
  process.exit(1);
});
