# Caught Red-Handed

21+ party game. This folder is meant to stay splittable into its own repo. Pass-the-phone, each-phone, and the TV page all live here.

The pages still use the WingsCrew site stylesheet and icons while they sit in this site (`../../assets/` from the game page, `../../../assets/` from `tv/`). Nothing in this folder calls a paid service or asks for an account.

## Ways to play

Pass the phone works with no network. Names and answers stay on that phone.

Each phone uses vendored [PeerJS](https://peerjs.com/) 1.5.5 (`vendor/peerjs.min.js`). The host browser is the hub. The free public broker at `0.peerjs.com` (port 443, path `/`) only introduces the browsers. It does not store names, answers, votes, or scores. Those travel on a direct WebRTC connection and disappear when the page closes. There is no TURN relay. On a strict network, use **Pass the phone**.

Phones find each other with Google's public STUN servers (`stun.l.google.com:19302` and `stun1.l.google.com:19302`). Those servers are not a place the game saves data.

If `0.peerjs.com` goes away, pass-the-phone still works. To bring each-phone play back, run your own open-source [PeerServer](https://github.com/peers/peerjs-server) and change `peerOpts()` in `multi.js` (`host`, `port`, `path`, and `secure`). Keep the vendored PeerJS file. Do not point the game at a paid service.

QR codes are drawn with vendored qrcode-generator 1.4.4 (`vendor/qrcode.js`). No QR website is called.

## Room codes

A room code is exactly 4 letters, shown in uppercase.

Alphabet: `ABCDEFGHJKMNPQRSTUVWXYZ`.

I, L, and O are left out, and there are no digits, so a code read across the room is not mistaken for 1 or 0.

The PeerJS id is `wingscrew-crh-` plus that code. The prefix keeps the id off other people's random ids on the public broker. If the broker says the id is taken, the host throws the code away and tries a new one, up to 12 times.

Someone joining can type the code in any case. Spaces and dashes are ignored, so `ab-cd` and `AB CD` are the same code. Any other letter that is not in the alphabet is rejected.

## Join link and QR

The QR and the join link point at the game with the code filled in:

`https://wingscrew.com/21plus/caught-red-handed/?join=ABCD`

Opening that link lands on the join step. The code is already filled. The player types a name and taps **Join**. The phone page still asks the 21+ question first, unless this browser already answered **Yes**.

The QR is black modules on a white field, with a quiet zone, and it is sized for a TV. The 4 letters sit beside it in large type. The short URL is printed under the letters.

The same block is on the host lobby and on the big-screen view.

**Show on TV** on the host phone opens the big-screen link, a QR code for that link, and steps for a TV browser, AirPlay, Chromecast, or HDMI. Secret answers stay off that screen until the reveal. The big-screen link is:

`https://wingscrew.com/21plus/caught-red-handed/?room=ABCD&screen=1`

That screen shows the QR in the lobby, then the board, the prompts, and the reveals. Players still answer and vote on their own phones. The host phone runs the game.

## TV browser

Short link for a smart TV's own browser:

`https://wingscrew.com/21plus/caught-red-handed/tv/`

Opening that page creates a room by itself and shows the QR and the 4-letter code. Nobody has to type on the remote.

The TV is the PeerJS hub. It is not a player. Phones join it:

1. Scan the QR, or open the game and enter the code.
2. Type a name.
3. One person taps **Join as host**. That phone gets the host controls (categories, start, tile picks, reveals).
4. Everyone else taps **Join**.

**Join as host** is only for a room the TV opened. If a phone already created the room, that button is refused and the player taps **Join** instead.

If the host phone drops during the lobby, the host seat opens again after a few seconds so someone else can claim it. If it drops after the game has started, reopen the game on that same phone and it rejoins as host. Reloading the TV starts a new room.

The TV page does not ask for the Yes/No age tap, because a TV remote should not have to click through before the code appears. The 21+ line stays on the screen. Joining from a phone still goes through the age question on the main game page.

## Pages and indexing

`index.html` and `tv/index.html` send `noindex, nofollow`. Do not add either URL to `sitemap.xml`.

The footer on both pages is the WingsCrew all-rights-reserved line. The license for the repo is the all-rights-reserved [LICENSE](../../LICENSE) at the site root. Vendor libraries keep their own notices in `vendor/LICENSES.txt`.

## Test

`test/tv-clients.mjs` loads the TV page and three phone pages in headless Chrome. It uses a local stand-in for PeerJS so the check does not call the public broker. From the repo root, with `puppeteer-core` on `NODE_PATH`:

```
node 21plus/caught-red-handed/test/tv-clients.mjs
```

The script serves the repo itself. It checks the 4-letter code, the join link baked into the QR, a prefilled join (including spaces and dashes), Join as host, and that the TV shows the board once the host starts.
