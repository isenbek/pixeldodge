# MAD Protocol

A browser king-of-the-hill shooter. You pilot an eight-foot armored robot (a MAD)
with one AI squadmate and hold a pit in no-man's-land against human infantry.
First side to 100 points wins. Served at https://pixeldodge.com.

Everything is one HTML file plus Three.js r128 and two fonts, all self-hosted.
There is no build step for players and no server-side code.

## Layout

| Path | What it is |
|---|---|
| `site/` | The deployable game: `index.html` and `assets/`. This is the web root. |
| `original/mad-vs-human-koth.html` | The game as it stood before the finishing pass. |
| `build/build.py` | Rebuilds `site/index.html` from the original by applying named patches. |
| `scripts/deploy.sh` | Copies `site/` to the server and installs the NGINX site. |
| `deploy/nginx/pixeldodge.com.conf` | The NGINX server block. |
| `test/` | Headless-browser checks (Playwright + Chrome). |

## Deploy

On the Ubuntu box, from the repo root:

    git pull
    sudo ./scripts/deploy.sh --tls     # first time: also gets the certificate
    sudo ./scripts/deploy.sh           # afterwards

DNS for `pixeldodge.com` and `www.pixeldodge.com` has to point at the box before `--tls`.

## Controls

Desktop: WASD move, mouse aim, click fire, right-click sight, Shift thrusters,
R reload, P pause, M mute. Arrow keys also turn.

Phone or tablet (landscape): left thumb moves, right thumb aims, buttons for
FIRE, SIGHT, THRUST, LOAD and pause.

## What the finishing pass changed

The game design, the robot and soldier models, the arena, the AI, the weapon
feel and the HUD are the original. The pass added what was needed to ship it:

- Three.js and the fonts are served from `site/assets/` instead of CDNs.
- Three difficulty levels on the menu. RECRUIT is the original 4 hostiles; VETERAN
  has 6; WAR MACHINE has 8 with heavier, tighter fire. The choice is remembered.
- A point now takes 0.9 s of holding instead of 0.42 s. At the original rate a
  match ended in about 45 seconds.
- Touch controls, a landscape prompt, and a smaller HUD on touch screens.
- P to pause, M to mute, pause when the tab is hidden, and a MAIN MENU button on
  the result screen.
- The key hints no longer cover the PLAY button on short windows.
- Page description, icon and share tags.

## Rebuilding

    python3 build/build.py original/mad-vs-human-koth.html site/index.html

Each patch checks that its anchor text appears exactly once, so if the original
changes the build stops and names the patch that no longer fits.

## Tests

`test/verify.js` loads the game in headless Chrome and checks assets, fonts,
keys, a full match, the result screen and the touch controls. It expects the
site on `http://localhost:8765/` with the test hook injected:

    python3 test/mk.py site/index.html site/_test.html keep
    (cd site && python3 -m http.server 8765 &)
    node test/verify.js
    rm site/_test.html

The scripts use the Playwright install at `/opt/npm-tools/node_modules/playwright`
and Chrome at `/usr/bin/google-chrome`; change those two paths for another machine.

## Licences

Three.js is MIT. Chakra Petch and Share Tech Mono are SIL Open Font License 1.1.
The licence texts sit beside the files in `site/assets/`.
