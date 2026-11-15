# CLAUDE.md: pixeldodge

MAD Protocol, <https://pixeldodge.com>: a browser king-of-the-hill shooter, packaged as an app on `@tinymachines/kit`.
Repo `isenbek/pixeldodge` (public).

## Start here

1. `README.md`: the layout, how to run, check and deploy.
2. `src/app.config.ts` (who the app is) and `src/App.tsx` (the routes).
3. `site/index.html` is the game. It is made by `build/build.py` from `original/`; change the game through a patch
   there, not by hand in `site/`.

## Rules

- **`bun run check` must end in `ALL OK`** before a deploy; `bun run deploy` refuses without a pass on HEAD.
  Afterwards `bun run live`.
- **The game is a page of its own** at `/play/index.html`, outside the app's frame. `scripts/game.sh` copies `site/`
  to `public/play/` before every build; `public/play/` is not committed. Link to `/play/index.html`, never `/play/`:
  the app's worker keeps the file by that name, so it opens with no network.
- **The kit's rules:** bun only, uv for `api/`, no CDN at runtime, colours from the tokens only, `defineApp()` first
  (`src/app.ts`), `app.config.ts` is plain data, every string in `src/copy/` in English, Spanish and Japanese. A fix
  that belongs to every app goes in the kit. Moving to a new kit release is `kit pin`.
- **The repo is public.** No user names, home paths or host details in tracked files; the API's unit says `@USER@`
  and `@HERE@`, which `kit setup` fills in.
- **No em dashes in the app's text.** Stage explicit paths.

## The host

- Static root `/var/www/pixeldodge.com`; the nginx site is written by `kit nginx` (`deploy/pixeldodge.com.nginx`).
- The API is `pixeldodge-api.service` on a loopback port (8340, `app.yaml`); sign-in and the account go to the kit's
  shared account service.
- Ports: dev 4420; the check takes a free one.
