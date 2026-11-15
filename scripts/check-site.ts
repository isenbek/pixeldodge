// The done-check, in headless Chrome, against a built dist/ (kit serve, under kit check) or the live site: every page
// opens with no error and the frame carries the name and the mark at phone width; the footer and the Menu offer a Sign
// in (the kit's shared account service); the Menu lists the doors; a theme pick survives a reload with no flash; the
// share panel draws a QR code; the sensors page has its tiles; the app opens offline; Your files keeps a picked file.
// This app's own: Home says what the game is and links to it; the game opens as a page of its own, outside the app's
// frame, with its engine and fonts from this site and nothing from another host, draws its menu, starts a match from
// PLAY, and opens again with no network (the app's worker keeps it). The API: the base routes. Ends in ALL OK or a failure.
//   bun run scripts/check-site.ts [origin]      default http://127.0.0.1:4451
import puppeteer, { type Page } from "puppeteer-core";
import { APP } from "../src/app.config";
import { mkdtempSync as kfMkdtemp, writeFileSync as kfWrite } from "node:fs";
import { tmpdir as kfTmp } from "node:os";
import { join as kfJoin } from "node:path";

const origin = (process.argv[2] ?? "http://127.0.0.1:4451").replace(/\/$/, "");
const NAME = APP.name;
const GAME = "/play/index.html";
const ID = "pixeldodge";   // the id (app.yaml id, the API's app and id), not the name
let fails = 0;
const ok = (good: boolean, what: string) => { if (!good) fails++; console.log(`${good ? "OK  " : "FAIL"} ${what}`); };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
process.on("exit", () => { browser.process()?.kill(); });
const ctx = await browser.createBrowserContext();
const page: Page = await ctx.newPage();
const errors: string[] = [];
let offline = false;
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  const u = new URL(r.url()), st = r.status();
  if (u.origin === origin && /^\/api\//.test(u.pathname) && st === 401) return;   // the account service and this app's API, to a reader not signed in
  if (u.origin === origin && st >= 400) errors.push(`${st} from this site: ${u.pathname}`);
});
page.on("console", (m) => {
  if (m.type() !== "error" || offline || /ERR_INTERNET_DISCONNECTED/.test(m.text())) return;
  if (/Failed to load resource: the server responded with a status of \d\d\d/.test(m.text())) return;
  errors.push(m.text());
});
await page.setViewport({ width: 390, height: 844 });
const text = (sel: string) => page.evaluate((s) => document.querySelector(s)?.textContent?.trim() ?? "", sel);
const clickText = (sel: string, t: string) => page.evaluate((s, t) => { const el = [...document.querySelectorAll<HTMLElement>(s)].find((e) => e.textContent?.includes(t)); el?.click(); return !!el; }, sel, t);

// 1. every page, the frame, no Sign in
for (const p of ["/", "/theme", "/sensors", "/scan", "/app", "/share", "/account", "/files", "/developers", "/nowhere"]) {
  await page.goto(`${origin}${p}`, { waitUntil: "networkidle0" });
  const h1 = await text("main h1"), brand = await text("header .brand");
  const logo = await page.evaluate(() => (document.querySelector("header .brand img") as HTMLImageElement | null)?.naturalWidth ?? 0);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  ok(h1.length > 0 && brand === NAME && logo > 0 && !wide, `${p}: "${h1}", brand "${brand}", logo ${logo}px, ${wide ? "SCROLLS SIDEWAYS" : "fits a phone"}`);
}
ok((await page.title()) === `Not here · ${NAME}`, `an unknown address says Not here (${await page.title()})`);
ok(/sign in/i.test(await text("footer")), "the footer offers a Sign in (the kit's shared account service)");

// 2. the Menu and Home
await page.goto(`${origin}/`, { waitUntil: "networkidle0" });
await page.click("header .menu-btn"); await sleep(300);
const doors = await page.evaluate(() => [...(document.getElementById("tc-menu")?.shadowRoot?.querySelectorAll("button, a") ?? [])].map((b) => b.textContent?.trim() ?? "").filter(Boolean));
ok(doors.some((d) => d.startsWith("Play")) && doors.some((d) => d.startsWith("You")) && doors.some((d) => /sign in/i.test(d)), `the Menu lists the doors and a Sign in: ${doors.slice(0, 3).join(" | ")}`);
await page.keyboard.press("Escape");
const playHref = await page.evaluate(() => document.querySelector('[data-k="play"]')?.getAttribute("href") ?? "");
const panels = await page.evaluate(() => [...document.querySelectorAll("main section.panel")].map((x) => x.getAttribute("data-k")));
ok(/king-of-the-hill/.test(await text("main .lede")) && playHref === GAME && panels.join() === "how,levels,keys,touch,made", `Home says what the game is, links to it (${playHref}) and has its five panels (${panels.join()})`);
const licences = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>("main .src a")].map((x) => x.getAttribute("href") ?? "").filter((h) => h.startsWith("/play/")));
const licSt = await Promise.all(licences.map((h) => fetch(`${origin}${h}`).then((r) => r.status).catch(() => 0)));
ok(licences.length === 3 && licSt.every((x) => x === 200), `the three licence texts are served (${licSt.join(", ")})`);

// 3. a theme pick survives a reload with no flash (the default is Steel; pick the kit's Paper)
await page.goto(`${origin}/theme`, { waitUntil: "networkidle0" });
ok(await clickText(".theme-pick", "Paper"), "the theme page offers Paper");
await sleep(200);
ok(!!(await page.evaluate((k) => localStorage.getItem(k), `${APP.prefix}:theme`)), `the pick is kept under the app's prefix (${APP.prefix}:theme)`);
await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });
const early = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
ok(early === "rgb(226, 231, 235)", `reload: the page is Paper before the app runs (${early})`);

// 4. share with a QR code
await page.goto(`${origin}/theme`, { waitUntil: "networkidle0" });
ok(await clickText("button", "Share this theme"), "Share this theme opens the panel");
await sleep(500); await clickText("button", "QR code"); await sleep(300);
ok(await page.evaluate(() => [...document.querySelectorAll("svg path")].some((p) => (p.getAttribute("d")?.length ?? 0) > 2000)), "the panel draws a QR code");

// 5. sensors
await page.goto(`${origin}/sensors`, { waitUntil: "networkidle0" });
const tiles = await page.evaluate(() => document.querySelectorAll("tc-gps, tc-motion, tc-sound, tc-battery, tc-network, tc-clock").length);
ok(tiles >= 6, `the sensors page has ${tiles} tiles`);

// 6. offline
await page.goto(`${origin}/app`, { waitUntil: "networkidle0" });
await sleep(1500); await page.reload({ waitUntil: "networkidle0" }); await sleep(1000);
offline = true;
await page.setOfflineMode(true);
await page.goto(`${origin}/sensors`, { waitUntil: "domcontentloaded" }).catch(() => null);
await sleep(500);
ok((await text("main h1")) === "Sensors", `offline: /sensors opens from the cache ("${await text("main h1")}")`);
await page.setOfflineMode(false);
offline = false;

// 6b. your files, signed out: a picked file is kept on this device
const kfSample = kfJoin(kfMkdtemp(kfJoin(kfTmp(), `${ID}-check-`)), "hello.txt");
kfWrite(kfSample, `hello from ${NAME}'s check\n`);
await page.goto(`${origin}/files`, { waitUntil: "networkidle0" });
const kfInput = await page.evaluateHandle(() => document.querySelector("tc-pick")!.shadowRoot!.querySelector("input.files"));
await (kfInput as unknown as { uploadFile(p: string): Promise<void> }).uploadFile(kfSample);
let kfRows: string[] = [];
for (let i = 0; i < 40 && !kfRows.some((r) => r.startsWith("hello.txt")); i++) { await sleep(250); kfRows = await page.evaluate(() => [...document.querySelectorAll(".kfiles li")].map((li) => `${li.querySelector(".open")?.textContent} | ${li.querySelector(".state")?.textContent ?? ""}`)); }
ok(kfRows.some((r) => /^hello\.txt \| On this device/.test(r)), `your files: a picked file is kept on this device (${kfRows.join("; ")})`);

// 7. the game: a page of its own, its engine and fonts from this site, a match starts
const game = await ctx.newPage();
const gameErrors: string[] = [], gameHosts = new Set<string>(), gameBad: string[] = [];
game.on("pageerror", (e) => gameErrors.push(e.message));
game.on("response", (r) => { const u = new URL(r.url()); if (u.protocol.startsWith("http")) { gameHosts.add(u.origin); if (r.status() >= 400) gameBad.push(`${r.status()} ${u.pathname}`); } });
await game.setViewport({ width: 1280, height: 720 });
// "load", not network idle: the game draws from its first frame and headless Chrome never calls that idle
const gr = await game.goto(`${origin}${GAME}`, { waitUntil: "load" });
const gameTitle = await game.title();
ok(gr?.status() === 200 && /^MAD PROTOCOL/.test(gameTitle) && !(await game.$("header .brand")), `${GAME} is the game itself, not the app's shell (${gr?.status()}, "${gameTitle}")`);
await sleep(1000);
const g0 = await game.evaluate(async () => {
  await document.fonts.ready;
  const three = (window as unknown as { THREE?: { REVISION?: string } }).THREE?.REVISION ?? "";
  const cv = document.querySelector("canvas");
  const play = [...document.querySelectorAll<HTMLElement>("button, .btn, [role=button]")].find((b) => /^\s*PLAY\s*$/i.test(b.textContent ?? ""));
  const shown = (el: Element | null | undefined) => !!el && (el as HTMLElement).offsetParent !== null;
  return { three, canvas: !!cv && cv.width > 0, play: shown(play), fonts: ["Chakra Petch", "Share Tech Mono"].map((f) => document.fonts.check(`16px "${f}"`)) };
});
ok(g0.three === "128" && g0.canvas && g0.play, `the game draws: Three.js r${g0.three}, a canvas, PLAY on its menu (${g0.play})`);
ok(g0.fonts.every(Boolean), `its two fonts load from this site (${g0.fonts.join(", ")})`);
ok(gameHosts.size === 1 && gameHosts.has(origin) && gameBad.length === 0, `the game asks only this site for files, and all of them answer (${[...gameHosts].join(", ")}${gameBad.length ? "; " + gameBad.join(", ") : ""})`);
const started = await game.evaluate(async () => {
  const play = [...document.querySelectorAll<HTMLElement>("button, .btn, [role=button]")].find((b) => /^\s*PLAY\s*$/i.test(b.textContent ?? ""));
  play?.click();
  await new Promise((r) => setTimeout(r, 1500));
  return document.getElementById("hud")?.classList.contains("live") ?? false;
});
ok(started, "PLAY starts a match: the HUD is live");
ok(gameErrors.length === 0, gameErrors.length ? `the game's errors: ${gameErrors.join(" | ").slice(0, 300)}` : "the game runs with no error");
// with no network: the app's worker has the game with the rest of the build
await game.setOfflineMode(true);
const off = await game.goto(`${origin}${GAME}`, { waitUntil: "domcontentloaded" }).catch(() => null);
await sleep(1500);
const offThree = await game.evaluate(() => (window as unknown as { THREE?: { REVISION?: string } }).THREE?.REVISION ?? "").catch(() => "");
ok(off?.status() === 200 && offThree === "128", `offline: the game opens from the cache (${off?.status() ?? "no answer"}, Three.js r${offThree})`);
await game.setOfflineMode(false);
await game.close();

// 8. the API: the base routes
const head = process.env.KIT_LIVE_COMMIT || Bun.spawnSync(["git", "rev-parse", "--short", "HEAD"]).stdout.toString().trim();
const get = (p: string) => fetch(`${origin}${p}`, { headers: { "cache-control": "no-cache" } });
const [bHealth, bAbout, bWhoami] = await Promise.all([get("/api/v1/health"), get("/api/v1/about"), get("/api/v1/whoami")].map((p) => p.then((r) => (r.ok ? r.json() : { status: r.status })).catch(() => null)));
ok(bHealth?.ok === true && bHealth.app === ID, `the API answers /api/v1/health (${JSON.stringify(bHealth).slice(0, 80)})`);
ok(bAbout?.id === ID && bAbout.commit === head, `/api/v1/about: ${bAbout?.id} at ${bAbout?.commit ?? "no answer"} (HEAD ${head}), kitapi ${bAbout?.kitapi}`);
ok(bWhoami?.signed_in === false, `/api/v1/whoami, signed out: nobody (${JSON.stringify(bWhoami)})`);

ok(errors.length === 0, errors.length ? `page errors: ${errors.join(" | ").slice(0, 400)}` : "no page errors anywhere");
await browser.close();
console.log(fails ? `check-site: ${fails} FAILED` : "check-site: ALL OK");
// exit 1 on a failure, so kit check (and a lane) cannot read ALL OK over a FAIL line (found 2026-11-08)
process.exit(fails ? 1 : 0);
